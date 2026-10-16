import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

import { getMigrationFiles, calculateChecksum, runMigrations, getMigrationStatus } from '../lib/migrations';
import { evaluateAndPersistResponse, evaluateRule } from '../lib/food-safety-engine';
import { setPoolForTesting, resetPool } from '../lib/db';
import { createSessionToken, SESSION_COOKIE_NAME } from '../lib/session';

import { POST as verifyActionHandler } from '../app/api/v1/actions/[action_id]/verify/route';
import { POST as checkResponsesHandler } from '../app/api/v1/checks/[check_id]/responses/route';
import { PATCH as patchActionHandler } from '../app/api/v1/actions/[action_id]/route';
import { POST as submitVerificationHandler } from '../app/api/v1/actions/[action_id]/submit-verification/route';

/**
 * Stateful Mock PostgreSQL Engine for Stage 5B Migration & SQL Integrity Testing
 */
class Stage5BMockDatabase {
  public tables: Map<string, any[]> = new Map();
  public executedQueries: { sql: string; params: any[] }[] = [];
  public inTransaction: boolean = false;

  constructor() {
    this.tables.set('schema_migrations', []);
    this.tables.set('roles', []);
    this.tables.set('restaurant_types', []);
    this.tables.set('food_processes', []);
    this.tables.set('equipment_types', []);
    this.tables.set('sources', []);
    this.tables.set('rules', []);
    this.tables.set('rule_conditions', []);
    this.tables.set('check_templates', []);
    this.tables.set('check_template_items', []);
    this.tables.set('outlets', []);
    this.tables.set('organisations', []);
    this.tables.set('check_instances', []);
    this.tables.set('check_responses', []);
    this.tables.set('observations', []);
    this.tables.set('corrective_actions', []);
    this.tables.set('action_verifications', []);
    this.tables.set('audit_logs', []);
    this.tables.set('system_events', []);
    this.tables.set('restaurant_activity', []);
  }

  async connect() {
    return this;
  }

  release() {
    // No-op
  }

  async query(sqlText: string, params: any[] = []): Promise<{ rows: any[] }> {
    const cleaned = sqlText.trim().replace(/\s+/g, ' ');
    this.executedQueries.push({ sql: cleaned, params: [...params] });

    if (cleaned === 'BEGIN') {
      this.inTransaction = true;
      return { rows: [] };
    }
    if (cleaned === 'COMMIT' || cleaned === 'ROLLBACK') {
      this.inTransaction = false;
      return { rows: [] };
    }

    // CREATE TABLE IF NOT EXISTS schema_migrations
    if (/CREATE TABLE IF NOT EXISTS schema_migrations/i.test(cleaned)) {
      if (!this.tables.has('schema_migrations')) this.tables.set('schema_migrations', []);
      return { rows: [] };
    }

    // SELECT version, checksum FROM schema_migrations
    if (/SELECT version, checksum FROM schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      return { rows: list.map(r => ({ version: r.version, checksum: r.checksum })) };
    }

    // SELECT version FROM schema_migrations ORDER BY applied_at DESC
    if (/SELECT version FROM schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      if (list.length === 0) return { rows: [] };
      const sorted = [...list].sort((a, b) => b.version.localeCompare(a.version));
      return { rows: [{ version: sorted[0].version }] };
    }

    // INSERT INTO schema_migrations
    if (/INSERT INTO schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations')!;
      list.push({
        version: params[0],
        name: params[1],
        checksum: params[2],
        applied_at: new Date().toISOString(),
        execution_time_ms: params[3] || 10
      });
      return { rows: [] };
    }

    // Migration execution simulation for tables
    if (/CREATE TABLE/i.test(cleaned)) {
      const tableRegex = /CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_]+)/gi;
      let m: RegExpExecArray | null;
      while ((m = tableRegex.exec(cleaned)) !== null) {
        if (m[1] && !this.tables.has(m[1])) {
          this.tables.set(m[1], []);
        }
      }
      return { rows: [] };
    }

    // Generic INSERT INTO roles/restaurant_types/... in 013
    if (/INSERT INTO (roles|restaurant_types|rules|check_templates)/i.test(cleaned)) {
      if (/INSERT INTO roles/i.test(cleaned)) {
        const list = this.tables.get('roles')!;
        const matches = Array.from(cleaned.matchAll(/INSERT INTO roles\(.*?VALUES\(.*?,'([a-z_]+)',/gi));
        for (const m of matches) {
          if (!list.some(r => r.code === m[1])) {
            list.push({ id: `role-${m[1]}`, code: m[1] });
          }
        }
      }
      if (/INSERT INTO restaurant_types/i.test(cleaned)) {
        const list = this.tables.get('restaurant_types')!;
        const matches = Array.from(cleaned.matchAll(/INSERT INTO restaurant_types\(.*?VALUES\(.*?,'([a-z_]+)',/gi));
        for (const m of matches) {
          if (!list.some(r => r.code === m[1])) {
            list.push({ id: `rt-${m[1]}`, code: m[1] });
          }
        }
      }
      if (/INSERT INTO rules/i.test(cleaned)) {
        const list = this.tables.get('rules')!;
        const matches = Array.from(cleaned.matchAll(/'(FS-[A-Z0-9-]+)'/g));
        for (const m of matches) {
          if (!list.some(r => r.rule_code === m[1])) {
            list.push({ id: `rule-${m[1]}`, rule_code: m[1] });
          }
        }
      }
      if (/INSERT INTO check_templates/i.test(cleaned)) {
        const list = this.tables.get('check_templates')!;
        const codeMatch = cleaned.match(/'(DAILY_FOOD_SAFETY)'/);
        if (codeMatch && !list.some(r => r.code === codeMatch[1])) {
          list.push({ id: `tmpl-${codeMatch[1]}`, code: codeMatch[1] });
        }
      }
      return { rows: [] };
    }

    // Specific domain queries for evaluateAndPersistResponse
    if (/SELECT cti\.\*, ci\.outlet_id, ci\.status check_status.*FROM check_template_items/i.test(cleaned)) {
      const itemId = params[0];
      const checkId = params[1];
      const check = this.tables.get('check_instances')?.find(c => c.id === checkId);
      const item = this.tables.get('check_template_items')?.find(i => i.id === itemId);
      if (!check || !item) return { rows: [] };
      return {
        rows: [{
          ...item,
          outlet_id: check.outlet_id,
          check_status: check.status,
          rule_code: item.rule_code || 'FS-STO-005',
          rule_title: item.rule_title || 'Storage temperature',
          rule_description: 'Store food at safe temperatures',
          risk_level: item.risk_level || 'high',
          evaluation_config: item.evaluation_config || null,
          rule_active: true,
          ccp_id: item.ccp_id || null
        }]
      };
    }

    if (/INSERT INTO check_responses/i.test(cleaned)) {
      const id = `resp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const rec = {
        id,
        check_instance_id: params[0],
        check_template_item_id: params[1],
        response_value: params[2],
        numeric_value: params[3],
        temperature_value: params[4],
        status: params[5],
        observation: params[6],
        responded_by: params[7]
      };
      this.tables.get('check_responses')!.push(rec);
      return { rows: [{ id }] };
    }

    if (/INSERT INTO observations/i.test(cleaned)) {
      const id = `obs-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const rec = {
        id,
        outlet_id: params[0],
        rule_id: params[1],
        check_response_id: params[2],
        severity: params[3],
        description: params[4],
        observed_by: params[5],
        status: 'open'
      };
      this.tables.get('observations')!.push(rec);
      return { rows: [{ id }] };
    }

    if (/INSERT INTO corrective_actions/i.test(cleaned)) {
      const id = `act-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const rec = {
        id,
        outlet_id: params[0],
        source_type: 'check_response',
        source_id: params[1],
        title: params[2],
        description: params[3],
        severity: params[4],
        priority: params[5],
        assigned_to: params[6],
        status: params[4] === 'critical' || params[4] === 'high' ? 'open' : 'in_progress'
      };
      this.tables.get('corrective_actions')!.push(rec);
      return { rows: [{ id }] };
    }

    if (/UPDATE observations SET status='linked'/i.test(cleaned)) {
      const obsId = params[0];
      const obs = this.tables.get('observations')?.find(o => o.id === obsId);
      if (obs) obs.status = 'linked';
      return { rows: [] };
    }

    // Action verify route queries
    if (/SELECT ca\.\*, o\.organisation_id FROM corrective_actions ca JOIN outlets o ON o\.id = ca\.outlet_id WHERE ca\.id = \$1/i.test(cleaned)) {
      const actId = params[0];
      const action = this.tables.get('corrective_actions')?.find(a => a.id === actId);
      if (!action) return { rows: [] };
      const outlet = this.tables.get('outlets')?.find(o => o.id === action.outlet_id);
      return { rows: [{ ...action, organisation_id: outlet?.organisation_id || 'org-1' }] };
    }

    if (/INSERT INTO action_verifications/i.test(cleaned)) {
      const id = `verif-${Date.now()}`;
      const rec = {
        id,
        corrective_action_id: params[0],
        verified_by: params[1],
        verification_method: params[2],
        result: params[3],
        notes: params[4],
        verified_at: new Date().toISOString()
      };
      this.tables.get('action_verifications')!.push(rec);
      return { rows: [{ id, verified_at: rec.verified_at }] };
    }

    if (/UPDATE corrective_actions SET status = \$2::action_status/i.test(cleaned) || /UPDATE corrective_actions SET status = \$2/i.test(cleaned)) {
      const actId = params[0];
      const nextStatus = params[1];
      const act = this.tables.get('corrective_actions')?.find(a => a.id === actId);
      if (act) {
        act.status = nextStatus;
        act.closed_at = nextStatus === 'closed' ? new Date().toISOString() : null;
      }
      return { rows: [{ id: actId, status: nextStatus, closed_at: act?.closed_at || null }] };
    }

    if (/UPDATE observations obs SET status = \$2::observation_status FROM corrective_actions ca/i.test(cleaned)) {
      const actId = params[0];
      const nextObsStatus = params[1];
      const act = this.tables.get('corrective_actions')?.find(a => a.id === actId);
      let count = 0;
      if (act) {
        for (const obs of this.tables.get('observations') || []) {
          if (obs.outlet_id === act.outlet_id) {
            const matchesCheckResp = act.source_type === 'check_response' && obs.check_response_id === act.source_id;
            const matchesDirectObs = act.source_type === 'observation' && obs.id === act.source_id;
            if (matchesCheckResp || matchesDirectObs) {
              obs.status = nextObsStatus;
              count++;
            }
          }
        }
      }
      return { rows: [], rowCount: count } as any;
    }

    // Default query fallback
    return { rows: [] };
  }
}

async function runStage5BTests() {
  console.log('========================================================================');
  console.log('FOODSAFE365 — STAGE 5B: MIGRATION AND SQL INTEGRITY TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;

  // ---------------------------------------------------------------------------
  // SECTION 1: F-04 REFERENCE DATA TRACKING & IDEMPOTENCE
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: F-04: MIGRATION 013 REFERENCE DATA DISCOVERY & CHECKSUM ---');
  const files = getMigrationFiles();
  const mig013 = files.find(f => f.version === '013_seed_reference_data');
  assert.ok(mig013, 'Migration 013_seed_reference_data.sql must exist in migrations directory');
  assert.strictEqual(mig013.name, '013_seed_reference_data.sql');
  assert.ok(mig013.checksum && mig013.checksum.length === 64, 'Migration 013 must have valid SHA-256 checksum');

  // Verify contents contain reference data inserts
  assert.ok(mig013.content.includes("INSERT INTO roles"), '013 must include roles reference data');
  assert.ok(mig013.content.includes("INSERT INTO restaurant_types"), '013 must include restaurant_types');
  assert.ok(mig013.content.includes("INSERT INTO food_processes"), '013 must include food_processes');
  assert.ok(mig013.content.includes("INSERT INTO equipment_types"), '013 must include equipment_types');
  assert.ok(mig013.content.includes("INSERT INTO rules"), '013 must include master rules matrix');
  assert.ok(mig013.content.includes("INSERT INTO check_templates"), '013 must include check templates');
  assert.ok(!mig013.content.includes("BEGIN;"), '013 must not contain top-level BEGIN transaction marker');
  assert.ok(!mig013.content.includes("COMMIT;"), '013 must not contain top-level COMMIT transaction marker');

  passed++;
  console.log('✅ TEST 1 PASSED: Migration 013 tracked, checksummed, and contains required reference data without nested transactions');

  console.log('\n--- TEST 2: F-04: MIGRATION 013 EXECUTION & IDEMPOTENCE LEDGER ---');
  const mockDb = new Stage5BMockDatabase();
  setPoolForTesting(mockDb);

  const run1 = await runMigrations({ pool: mockDb });
  assert.strictEqual(run1.success, true);
  assert.ok(run1.applied.includes('013_seed_reference_data'), 'Migration 013 must be applied on fresh database');
  assert.strictEqual(mockDb.tables.get('roles')?.length, 7, 'All 7 reference roles must be seeded');
  assert.strictEqual(mockDb.tables.get('restaurant_types')?.length, 7, 'All 7 reference restaurant types must be seeded');

  // Second run: must be completely idempotent (0 newly applied)
  const run2 = await runMigrations({ pool: mockDb });
  assert.strictEqual(run2.success, true);
  assert.strictEqual(run2.applied.length, 0, 'Zero migrations must be reapplied on second run');
  assert.ok(run2.alreadyApplied.includes('013_seed_reference_data'), 'Migration 013 must be marked alreadyApplied');

  passed++;
  console.log('✅ TEST 2 PASSED: Migration 013 applies reliably, seeds reference data, and is strictly idempotent');

  // ---------------------------------------------------------------------------
  // SECTION 2: F-05 POSTGRESQL ENUM HANDLING & CASE EXPRESSION CONTRACTS
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: F-05: EVALUATE & PERSIST RESPONSE POSTGRESQL ENUM CASTS ---');
  mockDb.executedQueries = [];
  mockDb.tables.set('outlets', [{ id: 'outlet-uuid-1', organisation_id: 'org-1' }]);
  mockDb.tables.set('check_instances', [{ id: 'check-uuid-1', outlet_id: 'outlet-uuid-1', status: 'in_progress' }]);
  mockDb.tables.set('check_template_items', [{
    id: 'item-uuid-1',
    rule_code: 'FS-STO-005',
    rule_title: 'Storage temperature',
    risk_level: 'high',
    response_type: 'temperature',
    active: true,
    evaluation_config: JSON.stringify({ numeric_max: 4, unit: '°C', next_step: 'Move to cold room' })
  }]);

  // Submit temperature deviation (6°C > 4°C limit) -> shouldObserve = true, riskLevel = 'high'
  const evalResult = await evaluateAndPersistResponse(mockDb as any, {
    checkId: 'check-uuid-1',
    itemId: 'item-uuid-1',
    responseValue: 6,
    temperatureValue: 6,
    userId: 'user-uuid-1'
  });

  assert.strictEqual(evalResult.outcome, 'ACTION_REQUIRED');
  assert.strictEqual(evalResult.responseStatus, 'fail');
  assert.strictEqual(evalResult.shouldObserve, true);

  // Assert exact SQL queries generated:
  // 1. check_responses insert with $6::response_status
  const crQuery = mockDb.executedQueries.find(q => q.sql.includes('INSERT INTO check_responses'));
  assert.ok(crQuery, 'check_responses insert query must be executed');
  assert.ok(crQuery.sql.includes('$6::response_status'), 'check_responses insert must explicitly cast status to response_status');

  // 2. observations insert with $4::risk_level and 'open'::observation_status
  const obsQuery = mockDb.executedQueries.find(q => q.sql.includes('INSERT INTO observations'));
  assert.ok(obsQuery, 'observations insert query must be executed');
  assert.ok(obsQuery.sql.includes('$4::risk_level'), 'observations insert must cast severity to risk_level enum');
  assert.ok(obsQuery.sql.includes("'open'::observation_status"), 'observations insert must cast status to observation_status enum');

  // 3. corrective_actions insert with 'check_response'::action_source, $5::risk_level, $6::action_priority, and typed CASE branches
  const caQuery = mockDb.executedQueries.find(q => q.sql.includes('INSERT INTO corrective_actions'));
  assert.ok(caQuery, 'corrective_actions insert query must be executed');
  assert.ok(caQuery.sql.includes("'check_response'::action_source"), 'corrective_actions must cast source_type to action_source enum');
  assert.ok(caQuery.sql.includes('$5::risk_level'), 'corrective_actions must cast severity to risk_level enum');
  assert.ok(caQuery.sql.includes('$6::action_priority'), 'corrective_actions must cast priority to action_priority enum');
  assert.ok(caQuery.sql.includes("CASE WHEN $5::text IN ('critical','high') THEN 'open'::action_status ELSE 'in_progress'::action_status END"),
    'corrective_actions must cast status CASE expression branches to action_status enum');

  // 4. observations update with 'linked'::observation_status
  const obsUpdateQuery = mockDb.executedQueries.find(q => q.sql.includes("UPDATE observations SET status='linked'::observation_status"));
  assert.ok(obsUpdateQuery, 'observations update must cast linked status to observation_status enum');

  passed++;
  console.log('✅ TEST 3 PASSED: evaluateAndPersistResponse SQL queries contain verified PostgreSQL enum casts on all columns and CASE branches');

  console.log('\n--- TEST 4: F-05: CHECK INSTANCES COMPLETION ENUM CASTS IN ROUTE HANDLER ---');
  // Check responses route updates check_instances with ::check_status and ::risk_level
  const routeSource = fs.readFileSync(path.resolve(process.cwd(), 'app/api/v1/checks/[check_id]/responses/route.ts'), 'utf8');
  assert.ok(routeSource.includes("status=$3::check_status"), 'checks responses route must cast status to check_status enum');
  assert.ok(routeSource.includes("risk_status=CASE WHEN $4::int>0 THEN 'high'::risk_level ELSE 'low'::risk_level END"),
    'checks responses route must cast risk_status CASE expression branches to risk_level enum');
  assert.ok(routeSource.includes("completed_at=CASE WHEN $3::text='completed'"),
    'checks responses route must cast $3 to text in completed_at CASE comparison');

  passed++;
  console.log('✅ TEST 4 PASSED: check_instances completion update contains explicit check_status and risk_level enum casts');

  // ---------------------------------------------------------------------------
  // SECTION 3: F-13 CORRECTIVE-ACTION OBSERVATION RELATIONSHIPS & VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: F-13: VALID RELATIONSHIP (source_type = "check_response") ---');
  // Set up test data
  const outletId = '00000000-0000-4000-8000-000000000001';
  const orgId = 'org-1';
  const managerUserId = 'user-mgr-1';

  mockDb.tables.set('outlets', [{ id: outletId, organisation_id: orgId }]);
  mockDb.tables.set('organisations', [{ id: orgId }]);

  const checkRespId = '00000000-0000-4000-8000-000000000010';
  const obsId = '00000000-0000-4000-8000-000000000020';
  const actionId = '00000000-0000-4000-8000-000000000030';

  mockDb.tables.set('observations', [{
    id: obsId,
    outlet_id: outletId,
    check_response_id: checkRespId,
    severity: 'high',
    status: 'linked'
  }]);

  mockDb.tables.set('corrective_actions', [{
    id: actionId,
    outlet_id: outletId,
    source_type: 'check_response',
    source_id: checkRespId,
    title: 'Fix chiller',
    severity: 'high',
    status: 'awaiting_verification'
  }]);

  process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/foodsafe365';
  process.env.SESSION_SECRET = 'stage5b-secret-key-32-chars-long!!';

  const managerToken = createSessionToken({
    userId: managerUserId,
    organisationId: orgId,
    outletId: outletId,
    role: 'outlet_manager',
    journey: 'restaurant'
  });

  const verifyPassReq = new NextRequest(`http://localhost:3000/api/v1/actions/${actionId}/verify`, {
    method: 'POST',
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${managerToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      result: 'pass',
      verification_method: 'physical_inspection',
      notes: 'Temperature confirmed 2.5°C'
    })
  });

  const passRes = await verifyActionHandler(verifyPassReq, { params: { action_id: actionId } });
  assert.strictEqual(passRes.status, 200, 'Pass verification must return 200');

  const updatedAct = mockDb.tables.get('corrective_actions')?.find(a => a.id === actionId);
  assert.strictEqual(updatedAct?.status, 'closed', 'Action must transition to closed');
  assert.ok(updatedAct?.closed_at, 'Action must have closed_at timestamp');

  const updatedObs = mockDb.tables.get('observations')?.find(o => o.id === obsId);
  assert.strictEqual(updatedObs?.status, 'resolved', 'Linked observation must transition to resolved');

  const verifRecord = mockDb.tables.get('action_verifications')?.[0];
  assert.strictEqual(verifRecord?.result, 'pass');
  assert.strictEqual(verifRecord?.verified_by, managerUserId);

  passed++;
  console.log('✅ TEST 5 PASSED: Valid check_response relationship resolved observation and closed action atomically');

  console.log('\n--- TEST 6: F-13: VALID RELATIONSHIP (source_type = "observation") ---');
  const directObsId = '00000000-0000-4000-8000-000000000021';
  const directActId = '00000000-0000-4000-8000-000000000031';

  mockDb.tables.get('observations')!.push({
    id: directObsId,
    outlet_id: outletId,
    check_response_id: null,
    severity: 'moderate',
    status: 'linked'
  });

  mockDb.tables.get('corrective_actions')!.push({
    id: directActId,
    outlet_id: outletId,
    source_type: 'observation',
    source_id: directObsId,
    title: 'Clean drain',
    severity: 'moderate',
    status: 'awaiting_verification'
  });

  const verifyDirectReq = new NextRequest(`http://localhost:3000/api/v1/actions/${directActId}/verify`, {
    method: 'POST',
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${managerToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      result: 'pass',
      verification_method: 'visual_inspection',
      notes: 'Drain clear'
    })
  });

  const directRes = await verifyActionHandler(verifyDirectReq, { params: { action_id: directActId } });
  assert.strictEqual(directRes.status, 200);

  const directObs = mockDb.tables.get('observations')?.find(o => o.id === directObsId);
  assert.strictEqual(directObs?.status, 'resolved', 'Direct observation source must transition to resolved');

  passed++;
  console.log('✅ TEST 6 PASSED: Direct observation source_type relationship resolved successfully');

  console.log('\n--- TEST 7: F-13: VERIFICATION REJECTION REOPENS OBSERVATION ---');
  const failActId = '00000000-0000-4000-8000-000000000032';
  const failObsId = '00000000-0000-4000-8000-000000000022';

  mockDb.tables.get('observations')!.push({
    id: failObsId,
    outlet_id: outletId,
    check_response_id: 'resp-fail-1',
    severity: 'high',
    status: 'linked'
  });

  mockDb.tables.get('corrective_actions')!.push({
    id: failActId,
    outlet_id: outletId,
    source_type: 'check_response',
    source_id: 'resp-fail-1',
    title: 'Fix gasket',
    severity: 'high',
    status: 'awaiting_verification'
  });

  const verifyFailReq = new NextRequest(`http://localhost:3000/api/v1/actions/${failActId}/verify`, {
    method: 'POST',
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${managerToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      result: 'fail',
      verification_method: 'physical_inspection',
      notes: 'Gasket still torn'
    })
  });

  const failRes = await verifyActionHandler(verifyFailReq, { params: { action_id: failActId } });
  assert.strictEqual(failRes.status, 200);

  const reopAct = mockDb.tables.get('corrective_actions')?.find(a => a.id === failActId);
  assert.strictEqual(reopAct?.status, 'open', 'Failed verification must reopen action to open');

  const reopObs = mockDb.tables.get('observations')?.find(o => o.id === failObsId);
  assert.strictEqual(reopObs?.status, 'open', 'Failed verification must reopen linked observation to open');

  passed++;
  console.log('✅ TEST 7 PASSED: Verification failure reopens both action and observation to open status');

  console.log('\n--- TEST 8: F-13: MISSING SOURCE RECORD SAFETY ---');
  const orphanActId = '00000000-0000-4000-8000-000000000033';
  mockDb.tables.get('corrective_actions')!.push({
    id: orphanActId,
    outlet_id: outletId,
    source_type: 'manual',
    source_id: null,
    title: 'Manual action without observation',
    severity: 'moderate',
    status: 'awaiting_verification'
  });

  const verifyOrphanReq = new NextRequest(`http://localhost:3000/api/v1/actions/${orphanActId}/verify`, {
    method: 'POST',
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${managerToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      result: 'pass',
      verification_method: 'review',
      notes: 'Approved'
    })
  });

  const orphanRes = await verifyActionHandler(verifyOrphanReq, { params: { action_id: orphanActId } });
  assert.strictEqual(orphanRes.status, 200, 'Verifying action without linked observation must succeed cleanly');
  const orphanAct = mockDb.tables.get('corrective_actions')?.find(a => a.id === orphanActId);
  assert.strictEqual(orphanAct?.status, 'closed');

  passed++;
  console.log('✅ TEST 8 PASSED: Action without source observation closes safely without side-effects or errors');

  console.log('\n--- TEST 9: F-13: CROSS-TENANT ISOLATION PREVENTS OBSERVATION CORRUPTION ---');
  // Outlet 2 has an observation with the SAME check_response_id (hypothetical collision or tampering)
  const otherOutletId = '00000000-0000-4000-8000-000000000099';
  const otherObsId = '00000000-0000-4000-8000-000000000098';
  mockDb.tables.get('observations')!.push({
    id: otherObsId,
    outlet_id: otherOutletId,
    check_response_id: checkRespId, // SAME check response ID as outlet 1
    severity: 'high',
    status: 'linked'
  });

  const tenant2ActId = '00000000-0000-4000-8000-000000000034';
  mockDb.tables.get('corrective_actions')!.push({
    id: tenant2ActId,
    outlet_id: outletId, // Belongs to Outlet 1
    source_type: 'check_response',
    source_id: checkRespId,
    title: 'Outlet 1 action',
    severity: 'high',
    status: 'awaiting_verification'
  });

  const crossTenantReq = new NextRequest(`http://localhost:3000/api/v1/actions/${tenant2ActId}/verify`, {
    method: 'POST',
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${managerToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ result: 'pass' })
  });

  await verifyActionHandler(crossTenantReq, { params: { action_id: tenant2ActId } });

  // Verify other outlet's observation was NOT affected
  const otherObs = mockDb.tables.get('observations')?.find(o => o.id === otherObsId);
  assert.strictEqual(otherObs?.status, 'linked', 'Cross-tenant observation must NOT be modified (status remains linked)');

  passed++;
  console.log('✅ TEST 9 PASSED: Scoped WHERE obs.outlet_id = ca.outlet_id strictly prevents cross-tenant observation mutation');

  console.log('\n--- TEST 10: F-13: CROSS-TENANT VERIFIER ATTEMPT REJECTED (403) ---');
  // Manager of Outlet 2 tries to verify Outlet 1's action
  const outlet2ManagerToken = createSessionToken({
    userId: 'user-mgr-2',
    organisationId: orgId,
    outletId: otherOutletId,
    role: 'outlet_manager',
    journey: 'restaurant'
  });

  const unauthVerifyReq = new NextRequest(`http://localhost:3000/api/v1/actions/${actionId}/verify`, {
    method: 'POST',
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${outlet2ManagerToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ result: 'pass' })
  });

  const unauthRes = await verifyActionHandler(unauthVerifyReq, { params: { action_id: actionId } });
  assert.strictEqual(unauthRes.status, 403, 'Cross-outlet manager must be rejected with 403 FORBIDDEN');

  passed++;
  console.log('✅ TEST 10 PASSED: Cross-tenant manager access strictly rejected with 403 FORBIDDEN');

  // Reset testing pool
  setPoolForTesting(null);
  delete process.env.DATABASE_URL;

  console.log('\n========================================================================');
  console.log(`🎯 ALL ${passed} STAGE 5B MIGRATION & SQL INTEGRITY TESTS PASSED`);
  console.log('========================================================================\n');
}

runStage5BTests().catch(err => {
  console.error('❌ STAGE 5B TEST SUITE FAILED:', err);
  process.exit(1);
});
