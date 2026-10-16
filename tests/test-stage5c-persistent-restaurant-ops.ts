import assert from 'assert';
import { NextRequest } from 'next/server';

import { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME } from '../lib/session';
import { hashPassword, verifyPassword } from '../lib/passwords';
import { setPoolForTesting, resetPool } from '../lib/db';
import { resetMockRateLimits } from '../lib/rate-limiter';

import { POST as orgOnboardingHandler } from '../app/api/v1/organisations/route';
import { GET as getActionsHandler, POST as postActionsHandler } from '../app/api/v1/actions/route';
import { PATCH as patchActionHandler } from '../app/api/v1/actions/[action_id]/route';
import { POST as submitVerificationHandler } from '../app/api/v1/actions/[action_id]/submit-verification/route';
import { POST as verifyActionHandler } from '../app/api/v1/actions/[action_id]/verify/route';
import { GET as getDashboardTodayHandler } from '../app/api/v1/dashboard/today/route';
import { GET as getTodayChecksHandler } from '../app/api/v1/outlets/[outlet_id]/checks/today/route';
import { GET as getCheckHandler } from '../app/api/v1/checks/[check_id]/route';
import { POST as checkResponsesHandler } from '../app/api/v1/checks/[check_id]/responses/route';
import { GET as getRecordsHandler } from '../app/api/v1/records/route';

function extractCookieToken(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Stateful Mock PostgreSQL Database for Stage 5C Persistence Testing
 */
class Stage5CMockDatabase {
  public tables: Map<string, any[]> = new Map();
  public executedQueries: { sql: string; params: any[] }[] = [];
  public inTransaction: boolean = false;

  constructor() {
    this.tables.set('users', []);
    this.tables.set('organisations', []);
    this.tables.set('outlets', []);
    this.tables.set('roles', [
      { id: '11111111-1111-1111-1111-111111111101', code: 'org_admin', name: 'Org Admin' },
      { id: '11111111-1111-1111-1111-111111111102', code: 'outlet_manager', name: 'Outlet Manager' },
      { id: '11111111-1111-1111-1111-111111111103', code: 'food_handler', name: 'Food Handler' },
      { id: '11111111-1111-1111-1111-111111111104', code: 'food_safety_supervisor', name: 'Supervisor' }
    ]);
    this.tables.set('restaurant_types', [
      { id: '22222222-2222-2222-2222-222222222201', code: 'restaurant', name: 'Restaurant / Dine-In' }
    ]);
    this.tables.set('outlet_users', []);
    this.tables.set('user_roles', []);
    this.tables.set('check_templates', [
      { id: '33333333-3333-3333-3333-333333333301', code: 'DAILY_FOOD_SAFETY', name: 'Daily Food Safety Check', active: true, version: 1 }
    ]);
    this.tables.set('rules', [
      {
        id: '44444444-4444-4444-4444-444444444401',
        rule_code: 'FS-CLN-001',
        title: 'Clean surfaces',
        description: 'Clean food contact surfaces',
        domain: 'cleaning',
        risk_level: 'high',
        evaluation_config: null,
        active: true
      },
      {
        id: '44444444-4444-4444-4444-444444444402',
        rule_code: 'FS-STO-005',
        title: 'Chilled Storage',
        description: 'Chilled storage temperature under 5C',
        domain: 'storage',
        risk_level: 'critical',
        evaluation_config: JSON.stringify({ numeric_max: 5, unit: '°C' }),
        active: true
      }
    ]);
    this.tables.set('check_template_items', [
      {
        id: '55555555-5555-5555-5555-555555555501',
        check_template_id: '33333333-3333-3333-3333-333333333301',
        rule_id: '44444444-4444-4444-4444-444444444401',
        question: 'Are surfaces clean?',
        response_type: 'yes_no',
        required: true,
        active: true
      },
      {
        id: '55555555-5555-5555-5555-555555555502',
        check_template_id: '33333333-3333-3333-3333-333333333301',
        rule_id: '44444444-4444-4444-4444-444444444402',
        question: 'Record chilled storage temperature',
        response_type: 'temperature',
        required: true,
        active: true
      }
    ]);
    this.tables.set('rule_conditions', []);
    this.tables.set('outlet_processes', []);
    this.tables.set('equipment', []);
    this.tables.set('check_instances', []);
    this.tables.set('check_responses', []);
    this.tables.set('observations', []);
    this.tables.set('corrective_actions', []);
    this.tables.set('action_verifications', []);
    this.tables.set('audit_logs', []);
    this.tables.set('system_events', []);
    this.tables.set('restaurant_activity', []);
    this.tables.set('monitoring_records', []);
  }

  async connect() {
    return this;
  }

  release() {}

  async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    this.executedQueries.push({ sql, params });
    const s = sql.trim();

    if (s.toUpperCase() === 'BEGIN') {
      this.inTransaction = true;
      return { rows: [], rowCount: 0 };
    }
    if (s.toUpperCase() === 'COMMIT' || s.toUpperCase() === 'ROLLBACK') {
      this.inTransaction = false;
      return { rows: [], rowCount: 0 };
    }

    // SELECT roles
    if (/SELECT\s+id\s+FROM\s+roles\s+WHERE\s+code\s*=\s*'org_admin'/i.test(s)) {
      const r = this.tables.get('roles')!.find(x => x.code === 'org_admin');
      return { rows: r ? [{ id: r.id }] : [], rowCount: r ? 1 : 0 };
    }

    // SELECT restaurant_types
    if (/SELECT\s+id\s+FROM\s+restaurant_types/i.test(s)) {
      const match = this.tables.get('restaurant_types')!.find(x => x.id === params[0] || x.code === params[0]);
      return { rows: match ? [{ id: match.id }] : [], rowCount: match ? 1 : 0 };
    }

    // SELECT users by lower(email)
    if (/SELECT\s+id\s+FROM\s+users\s+WHERE\s+lower\(email\)\s*=\s*lower\(\$1\)/i.test(s)) {
      const u = this.tables.get('users')!.find(x => String(x.email).toLowerCase() === String(params[0]).toLowerCase());
      return { rows: u ? [{ id: u.id }] : [], rowCount: u ? 1 : 0 };
    }

    // INSERT INTO users
    if (/INSERT\s+INTO\s+users/i.test(s)) {
      const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rec = { id, name: params[0], mobile: params[1], email: params[2], password_hash: params[3], status: 'active' };
      this.tables.get('users')!.push(rec);
      return { rows: [{ id }], rowCount: 1 };
    }

    // INSERT INTO organisations
    if (/INSERT\s+INTO\s+organisations/i.test(s)) {
      const id = `org-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rec = { id, name: params[0], owner_user_id: params[1], status: 'active' };
      this.tables.get('organisations')!.push(rec);
      return { rows: [{ id }], rowCount: 1 };
    }

    // INSERT INTO outlets
    if (/INSERT\s+INTO\s+outlets/i.test(s)) {
      const id = `outlet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rec = { id, organisation_id: params[0], name: params[1], city: params[2], restaurant_type_id: params[3], status: 'active' };
      this.tables.get('outlets')!.push(rec);
      return { rows: [{ id }], rowCount: 1 };
    }

    // INSERT INTO outlet_users
    if (/INSERT\s+INTO\s+outlet_users/i.test(s)) {
      this.tables.get('outlet_users')!.push({ outlet_id: params[0], user_id: params[1], role_id: params[2], status: 'active' });
      return { rows: [], rowCount: 1 };
    }

    // INSERT INTO user_roles
    if (/INSERT\s+INTO\s+user_roles/i.test(s)) {
      this.tables.get('user_roles')!.push({ user_id: params[0], role_id: params[1], organisation_id: params[2] });
      return { rows: [], rowCount: 1 };
    }

    // SELECT outlets for access check
    if (/SELECT\s+id\s+FROM\s+outlets\s+WHERE\s+id\s*=\s*\$1\s+AND\s+organisation_id\s*=\s*\$2\s+AND\s+status\s*=\s*'active'/i.test(s)) {
      const match = this.tables.get('outlets')!.find(o => o.id === params[0] && o.organisation_id === params[1] && o.status === 'active');
      return { rows: match ? [{ id: match.id }] : [], rowCount: match ? 1 : 0 };
    }

    // SELECT outlet name
    if (/SELECT\s+id,\s*name\s+FROM\s+outlets\s+WHERE\s+id\s*=\s*\$1/i.test(s)) {
      const match = this.tables.get('outlets')!.find(o => o.id === params[0]);
      return { rows: match ? [{ id: match.id, name: match.name }] : [], rowCount: match ? 1 : 0 };
    }

    // SELECT check_templates
    if (/SELECT\s+id,\s*code,\s*name,\s*frequency,\s*role_code\s+FROM\s+check_templates\s+WHERE\s+code\s*=\s*'DAILY_FOOD_SAFETY'/i.test(s)) {
      const t = this.tables.get('check_templates')!.find(x => x.code === 'DAILY_FOOD_SAFETY');
      return { rows: t ? [t] : [], rowCount: t ? 1 : 0 };
    }

    // SELECT check_instances
    if (/SELECT\s+ci\.id.*FROM\s+check_instances\s+ci/i.test(s)) {
      const insts = this.tables.get('check_instances')!.filter(ci => ci.outlet_id === params[0]);
      return {
        rows: insts.map(ci => ({
          id: ci.id,
          template_code: 'DAILY_FOOD_SAFETY',
          name: 'Daily Food Safety Check',
          status: ci.status,
          completion_percentage: ci.completion_percentage,
          started_at: ci.started_at,
          completed_at: ci.completed_at
        })),
        rowCount: insts.length
      };
    }

    // INSERT INTO check_instances
    if (/INSERT\s+INTO\s+check_instances/i.test(s)) {
      const id = `chk-inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rec = {
        id,
        outlet_id: params[0],
        check_template_id: params[1],
        assigned_to: params[2],
        started_at: new Date().toISOString(),
        status: 'not_started',
        completion_percentage: 0
      };
      this.tables.get('check_instances')!.push(rec);
      return { rows: [{ id }], rowCount: 1 };
    }

    // SELECT check_instances WHERE id = $1
    if (/SELECT\s+id,\s*outlet_id,\s*status\s+FROM\s+check_instances\s+WHERE\s+id\s*=\s*\$1/i.test(s)) {
      const match = this.tables.get('check_instances')!.find(ci => ci.id === params[0]);
      return { rows: match ? [match] : [], rowCount: match ? 1 : 0 };
    }

    // evaluateAndPersistResponse check_template_items query
    if (/SELECT\s+cti\.\*.*FROM\s+check_template_items\s+cti\s+JOIN\s+check_instances\s+ci/i.test(s)) {
      const itemId = params[0];
      const checkId = params[1];
      const ci = this.tables.get('check_instances')!.find(x => x.id === checkId);
      const cti = this.tables.get('check_template_items')!.find(x => x.id === itemId);
      const rule = cti ? this.tables.get('rules')!.find(r => r.id === cti.rule_id) : null;
      if (ci && cti && rule) {
        return {
          rows: [{
            ...cti,
            outlet_id: ci.outlet_id,
            check_status: ci.status,
            rule_code: rule.rule_code,
            rule_title: rule.title,
            rule_description: rule.description,
            risk_level: rule.risk_level,
            evaluation_config: rule.evaluation_config,
            rule_active: rule.active,
            ccp_id: null
          }],
          rowCount: 1
        };
      }
      return { rows: [], rowCount: 0 };
    }

    // INSERT INTO check_responses
    if (/INSERT\s+INTO\s+check_responses/i.test(s)) {
      const id = `resp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rec = {
        id,
        check_instance_id: params[0],
        check_template_item_id: params[1],
        response_value: params[2],
        numeric_value: params[3],
        temperature_value: params[4],
        status: params[5],
        observation: params[6],
        responded_at: new Date().toISOString(),
        responded_by: params[7]
      };
      this.tables.get('check_responses')!.push(rec);
      return { rows: [{ id }], rowCount: 1 };
    }

    // INSERT INTO observations
    if (/INSERT\s+INTO\s+observations/i.test(s)) {
      const id = `obs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      this.tables.get('observations')!.push({
        id,
        outlet_id: params[0],
        rule_id: params[1],
        check_response_id: params[2],
        severity: params[3],
        description: params[4],
        observed_by: params[5],
        status: 'open'
      });
      return { rows: [{ id }], rowCount: 1 };
    }

    // INSERT INTO corrective_actions
    if (/INSERT\s+INTO\s+corrective_actions/i.test(s)) {
      const id = `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rec = {
        id,
        outlet_id: params[0],
        source_type: params[1],
        source_id: params[2],
        title: params[3],
        description: params[4],
        severity: params[5],
        priority: params[6],
        assigned_to: params[7],
        status: params[5] === 'critical' ? 'open' : 'in_progress',
        created_at: new Date().toISOString()
      };
      this.tables.get('corrective_actions')!.push(rec);
      return { rows: [{ ...rec, outletId: params[0] }], rowCount: 1 };
    }

    // UPDATE check_instances
    if (/UPDATE\s+check_instances/i.test(s)) {
      const ci = this.tables.get('check_instances')!.find(x => x.id === params[0]);
      if (ci) {
        ci.completion_percentage = params[1];
        ci.status = params[2];
      }
      return { rows: [], rowCount: ci ? 1 : 0 };
    }

    // UPDATE observations
    if (/UPDATE\s+observations/i.test(s)) {
      return { rows: [], rowCount: 1 };
    }

    // INSERT INTO system_events
    if (/INSERT\s+INTO\s+system_events/i.test(s)) {
      return { rows: [], rowCount: 1 };
    }

    // INSERT INTO audit_logs
    if (/INSERT\s+INTO\s+audit_logs/i.test(s)) {
      return { rows: [], rowCount: 1 };
    }

    // Counts queries for check completion
    if (/SELECT\s+COUNT\(\*\)\s+FILTER/i.test(s)) {
      return { rows: [{ required_count: 2, answered_count: 1, issue_count: 0, pass_count: 1 }], rowCount: 1 };
    }

    // SELECT profile processes & equipment for outlet
    if (/FROM\s+outlet_processes\s+op.*JOIN\s+food_processes\s+fp/i.test(s) || /SELECT\s+COALESCE\(\(SELECT\s+json_agg\(fp\.code\)/i.test(s)) {
      return {
        rows: [{
          processes: ['cooking', 'refrigerated_storage'],
          equipment: ['refrigerator', 'cooking_equipment']
        }],
        rowCount: 1
      };
    }

    // SELECT check_template_items for template
    if (/FROM\s+check_template_items\s+i/i.test(s) || /SELECT\s+cti\.id,\s*cti\.required/i.test(s)) {
      const items = this.tables.get('check_template_items')!;
      return {
        rows: items.map(it => ({
          id: it.id,
          rule_id: it.rule_id,
          question: it.question,
          response_type: it.response_type,
          required: it.required,
          evidence_required: it.evidence_required,
          applicability: ''
        })),
        rowCount: items.length
      };
    }

    // SELECT counts FROM corrective_actions
    if (/SELECT\s+count\(\*\)\s+FILTER\s+\(WHERE\s+status\s*=\s*'open'\)/i.test(s)) {
      const actions = this.tables.get('corrective_actions')!.filter(a => a.outlet_id === params[0]);
      return {
        rows: [{
          open: actions.filter(a => a.status === 'open').length,
          inProgress: actions.filter(a => a.status === 'in_progress').length,
          awaitingVerification: actions.filter(a => a.status === 'awaiting_verification').length,
          overdue: 0,
          closed: actions.filter(a => a.status === 'closed').length,
          total: actions.length
        }],
        rowCount: 1
      };
    }

    // SELECT corrective_actions for single action lookup joined with outlets
    if (/FROM\s+corrective_actions\s+ca\s+JOIN\s+outlets\s+o/i.test(s) || /SELECT\s+ca\.\*,[\s\S]*FROM\s+corrective_actions\s+ca[\s\S]*WHERE\s+ca\.id\s*=\s*\$1/i.test(s)) {
      const a = this.tables.get('corrective_actions')!.find(x => x.id === params[0]);
      if (!a) return { rows: [], rowCount: 0 };
      const outlet = this.tables.get('outlets')!.find(o => o.id === a.outlet_id);
      return {
        rows: [{
          ...a,
          organisation_id: outlet?.organisation_id || (this.tables.get('organisations')![0]?.id)
        }],
        rowCount: 1
      };
    }

    // SELECT corrective_actions list
    if (/FROM\s+corrective_actions\s+ca/i.test(s)) {
      const actions = this.tables.get('corrective_actions')!.filter(a => !params[0] || a.outlet_id === params[0]);
      return {
        rows: actions.map(a => ({
          id: a.id,
          outletId: a.outlet_id,
          title: a.title,
          description: a.description,
          severity: a.severity,
          priority: a.priority,
          status: a.status,
          sourceType: a.source_type,
          createdAt: a.created_at,
          closedAt: a.closed_at || null
        })),
        rowCount: actions.length
      };
    }

    // INSERT INTO action_verifications
    if (/INSERT\s+INTO\s+action_verifications/i.test(s)) {
      return { rows: [{ id: 'verif-1', verified_at: new Date().toISOString() }], rowCount: 1 };
    }

    // UPDATE corrective_actions
    if (/UPDATE\s+corrective_actions/i.test(s)) {
      const id = params[0] || params[params.length - 1];
      const a = this.tables.get('corrective_actions')!.find(x => x.id === id);
      if (a) {
        if (s.includes("status = 'in_progress'") || params.includes('in_progress')) a.status = 'in_progress';
        if (s.includes("status = 'awaiting_verification'") || params.includes('awaiting_verification')) a.status = 'awaiting_verification';
        if (s.includes("status = 'closed'") || s.includes("closed") || params.includes('closed')) {
          a.status = 'closed';
          a.closed_at = new Date().toISOString();
        }
      }
      return { rows: a ? [a] : [], rowCount: a ? 1 : 0 };
    }

    // SELECT dashboard/today aggregations
    if (/SELECT\s+count\(\*\)::int\s+total,\s*count\(\*\)\s+FILTER\(WHERE\s+status\s+IN\s+\('completed','verified'\)\)/i.test(s)) {
      const checks = this.tables.get('check_instances')!.filter(x => x.outlet_id === params[0]);
      return {
        rows: [{
          total: checks.length,
          completed: checks.filter(x => x.status === 'completed').length,
          pending: checks.filter(x => x.status !== 'completed').length
        }],
        rowCount: 1
      };
    }
    if (/SELECT\s+count\(\*\)::int\s+open.*FROM\s+observations/i.test(s)) {
      return { rows: [{ open: 0, high_priority: 0 }], rowCount: 1 };
    }
    if (/SELECT\s+count\(\*\)::int\s+open.*FROM\s+corrective_actions/i.test(s)) {
      const actions = this.tables.get('corrective_actions')!.filter(a => a.outlet_id === params[0]);
      return { rows: [{ open: actions.filter(a => a.status !== 'closed').length, overdue: 0 }], rowCount: 1 };
    }
    if (/SELECT\s+count\(\*\)::int\s+expiring_soon\s+FROM\s+documents/i.test(s)) {
      return { rows: [{ expiring_soon: 0 }], rowCount: 1 };
    }
    if (/SELECT\s+count\(\*\)\s+FILTER\(WHERE\s+cr\.status\s+IN\s+\('pass','na'\)\)/i.test(s)) {
      return { rows: [{ good: 1, warning: 0, fail: 0 }], rowCount: 1 };
    }

    // SELECT records queries (check_responses, corrective_actions, audit_logs, monitoring_records)
    if (/FROM\s+check_responses\s+cr\s+JOIN\s+check_instances\s+ci/i.test(s)) {
      const responses = this.tables.get('check_responses')!;
      return {
        rows: responses.map(cr => ({
          id: cr.id,
          check_instance_id: cr.check_instance_id,
          date: '2026-10-13',
          time: cr.responded_at,
          area: 'kitchen',
          template: 'Daily Food Safety Check',
          completedBy: 'Staff',
          code: 'FS-CLN-001',
          title: 'Clean surfaces',
          result: cr.status,
          value: cr.response_value,
          note: cr.observation
        })),
        rowCount: responses.length
      };
    }

    if (/FROM\s+audit_logs\s+al/i.test(s)) {
      return {
        rows: [{
          id: 'log-1',
          at: new Date().toISOString(),
          type: 'check_completed',
          entityType: 'check',
          entityId: 'chk-1',
          detail: 'Check completed',
          userName: 'Manager'
        }],
        rowCount: 1
      };
    }

    if (/FROM\s+monitoring_records\s+mr/i.test(s)) {
      return { rows: [], rowCount: 0 };
    }

    return { rows: [], rowCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// TEST RUNNER
// ---------------------------------------------------------------------------

async function runStage5CTests() {
  console.log('\n======================================================');
  console.log(' FoodSafe365 — Stage 5C Persistent Restaurant Ops Tests');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err?.message || err}`);
      if (err?.stack) console.error(`    ${err.stack.split('\n')[1]}`);
    }
  }

  const mockDb = new Stage5CMockDatabase();
  setPoolForTesting(mockDb as any);
  process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock_foodsafe';

  // 1. Onboarding persistence and session issuance
  await test('1. Organisation onboarding creates user, org, outlet, hashes password, and issues session cookie', async () => {
    resetMockRateLimits();
    const req = new NextRequest('http://localhost:3000/api/v1/organisations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        user: {
          name: 'Pooja Nair',
          mobile: '9876543210',
          email: 'pooja@bombaykitchen.com',
          password: 'Password123!'
        },
        organisation: { name: 'Bombay Kitchen Hospitality' },
        outlet: { name: 'Bombay Kitchen Bandra', city: 'Mumbai', restaurantTypeId: 'restaurant' }
      })
    });

    const res = await orgOnboardingHandler(req);
    assert.strictEqual(res.status, 201, 'Should return HTTP 201 Created');
    const json = await res.json();
    assert.ok(json.data?.organisationId, 'Should return organisationId');
    assert.ok(json.data?.outletId, 'Should return outletId');
    assert.ok(json.data?.userId, 'Should return userId');

    // Verify session cookie
    const setCookie = res.headers.get('set-cookie');
    const token = extractCookieToken(setCookie);
    assert.ok(token, 'Should set session cookie');
    const session = verifySessionToken(token);
    assert.strictEqual(session.valid, true, 'Session token must be cryptographically valid');
    assert.strictEqual(session.data?.role, 'org_admin', 'Session role must be org_admin');
    assert.strictEqual(session.data?.journey, 'restaurant', 'Session journey must be restaurant');

    // Verify hashed password
    const user = mockDb.tables.get('users')!.find(u => u.email === 'pooja@bombaykitchen.com');
    assert.ok(user, 'User must be persisted in database');
    assert.ok(user.password_hash, 'Password must be hashed');
    assert.notStrictEqual(user.password_hash, 'Password123!', 'Plaintext password must never be stored');
    const verified = await verifyPassword('Password123!', user.password_hash);
    assert.strictEqual(verified, true, 'Hashed password must verify against plaintext');
  });

  // 2. Onboarding duplicate prevention and validation
  await test('2. Onboarding rejects duplicate email with 409 DUPLICATE_ACCOUNT without false success', async () => {
    resetMockRateLimits();
    const req = new NextRequest('http://localhost:3000/api/v1/organisations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        user: {
          name: 'Duplicate Attempt',
          mobile: '9876543211',
          email: 'pooja@bombaykitchen.com',
          password: 'Password123!'
        },
        organisation: { name: 'Another Org' },
        outlet: { name: 'Another Outlet', city: 'Mumbai', restaurantTypeId: 'restaurant' }
      })
    });

    const res = await orgOnboardingHandler(req);
    assert.strictEqual(res.status, 409, 'Should return 409 Conflict');
    const json = await res.json();
    assert.strictEqual(json.error?.code, 'DUPLICATE_ACCOUNT');
  });

  // 3. Daily check instance retrieval
  const testOrgId = mockDb.tables.get('organisations')![0].id;
  const testOutletId = mockDb.tables.get('outlets')![0].id;
  const testUserId = mockDb.tables.get('users')![0].id;

  const managerToken = createSessionToken({
    userId: testUserId,
    organisationId: testOrgId,
    outletId: testOutletId,
    role: 'outlet_manager',
    journey: 'restaurant'
  });

  let checkInstanceId = '';

  await test('3. Today checks endpoint generates and returns check instance for authenticated outlet', async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/outlets/${testOutletId}/checks/today`, {
      method: 'GET',
      headers: { cookie: `${SESSION_COOKIE_NAME}=${managerToken}` }
    });

    const res = await getTodayChecksHandler(req, { params: { outlet_id: testOutletId } });
    assert.strictEqual(res.status, 200, 'Should return 200');
    const json = await res.json();
    assert.ok(json.data?.checks?.length > 0, 'Should return at least one check instance');
    checkInstanceId = json.data.checks[0].id;
    assert.ok(checkInstanceId, 'Check instance ID must be present');
  });

  // 4. Check response persistence and evaluation
  await test('4. Check response submission persists to database and evaluates outcome server-side', async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/checks/${checkInstanceId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${managerToken}`
      },
      body: JSON.stringify({
        item_id: '55555555-5555-5555-5555-555555555501',
        response_value: 'pass'
      })
    });

    const res = await checkResponsesHandler(req, { params: { check_id: checkInstanceId } });
    assert.strictEqual(res.status, 200, 'Should return HTTP 200');
    const json = await res.json();
    assert.strictEqual(json.data?.outcome, 'GOOD', 'Outcome must be evaluated as GOOD');
    assert.strictEqual(json.data?.responseStatus, 'pass', 'Response status must be pass');

    // Verify database record
    const recorded = mockDb.tables.get('check_responses')!.find(r => r.check_instance_id === checkInstanceId);
    assert.ok(recorded, 'Check response must be persisted in database');
    assert.strictEqual(recorded.status, 'pass');
  });

  // 5. Corrective action creation and server authority
  let createdActionId = '';

  await test('5. Corrective action creation persists to database and enforces role authorisation', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${managerToken}`
      },
      body: JSON.stringify({
        title: 'Chiller temperature above limit',
        description: 'Chilled storage unit 2 reading 9.2°C exceeds 5°C threshold.',
        severity: 'critical',
        priority: 'critical',
        outletId: testOutletId,
        sourceCheckCode: 'FS-STO-005',
        sourceType: 'operational_check'
      })
    });

    const res = await postActionsHandler(req);
    assert.strictEqual(res.status, 201, 'Should return HTTP 201 Created');
    const json = await res.json();
    createdActionId = json.data?.id;
    assert.ok(createdActionId, 'Created action ID must be returned');

    // Verify database record
    const action = mockDb.tables.get('corrective_actions')!.find(a => a.id === createdActionId);
    assert.ok(action, 'Action must be in database');
    assert.strictEqual(action.status, 'open', 'Initial status must be open');
  });

  // 6. Action status transition: in_progress -> awaiting_verification
  await test('6. Action status transition to in_progress and submit-verification', async () => {
    // Transition to in_progress
    const patchReq = new NextRequest(`http://localhost:3000/api/v1/actions/${createdActionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${managerToken}`
      },
      body: JSON.stringify({ status: 'in_progress' })
    });

    const patchRes = await patchActionHandler(patchReq, { params: { action_id: createdActionId } });
    assert.strictEqual(patchRes.status, 200, 'Should update to in_progress');

    // Submit for verification
    const subReq = new NextRequest(`http://localhost:3000/api/v1/actions/${createdActionId}/submit-verification`, {
      method: 'POST',
      headers: { cookie: `${SESSION_COOKIE_NAME}=${managerToken}` }
    });

    const subRes = await submitVerificationHandler(subReq, { params: { action_id: createdActionId } });
    assert.strictEqual(subRes.status, 200, 'Should transition to awaiting_verification');

    const action = mockDb.tables.get('corrective_actions')!.find(a => a.id === createdActionId);
    assert.strictEqual(action.status, 'awaiting_verification');
  });

  // 7. General PATCH cannot self-close or bypass verification
  await test('7. Client cannot bypass verification by PATCHing status to closed', async () => {
    const patchReq = new NextRequest(`http://localhost:3000/api/v1/actions/${createdActionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${managerToken}`
      },
      body: JSON.stringify({ status: 'closed' })
    });

    const res = await patchActionHandler(patchReq, { params: { action_id: createdActionId } });
    assert.strictEqual(res.status, 400, 'Server must reject direct PATCH to closed');
    const json = await res.json();
    assert.strictEqual(json.error?.code, 'INVALID_TRANSITION');
  });

  // 8. Manager verification approval
  await test('8. Manager verification verifies correction and closes action', async () => {
    const vReq = new NextRequest(`http://localhost:3000/api/v1/actions/${createdActionId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${managerToken}`
      },
      body: JSON.stringify({ result: 'pass', notes: 'Temperature verified at 3.4°C on re-test.' })
    });

    const vRes = await verifyActionHandler(vReq, { params: { action_id: createdActionId } });
    assert.strictEqual(vRes.status, 200, 'Manager verification must succeed');

    const action = mockDb.tables.get('corrective_actions')!.find(a => a.id === createdActionId);
    assert.strictEqual(action.status, 'closed', 'Action status must be closed');
    assert.ok(action.closed_at, 'closed_at must be populated');
  });

  // 9. Unauthorized role verification rejection
  await test('9. Food handler cannot verify action (403 FORBIDDEN)', async () => {
    const handlerToken = createSessionToken({
      userId: 'handler-user',
      organisationId: testOrgId,
      outletId: testOutletId,
      role: 'food_handler',
      journey: 'restaurant'
    });

    const vReq = new NextRequest(`http://localhost:3000/api/v1/actions/${createdActionId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${handlerToken}`
      },
      body: JSON.stringify({ result: 'pass' })
    });

    const vRes = await verifyActionHandler(vReq, { params: { action_id: createdActionId } });
    assert.strictEqual(vRes.status, 403, 'Should return 403 Forbidden for unauthorized role');
  });

  // 10. Cross-tenant isolation on dashboard & actions
  await test('10. Cross-tenant access is rejected with 403 FORBIDDEN', async () => {
    const otherOrgToken = createSessionToken({
      userId: 'other-user',
      organisationId: 'other-org-id',
      outletId: 'other-outlet-id',
      role: 'outlet_manager',
      journey: 'restaurant'
    });

    // Attempt to access testOutletId dashboard
    const dashReq = new NextRequest(`http://localhost:3000/api/v1/dashboard/today?outlet_id=${testOutletId}`, {
      method: 'GET',
      headers: { cookie: `${SESSION_COOKIE_NAME}=${otherOrgToken}` }
    });

    const dashRes = await getDashboardTodayHandler(dashReq);
    assert.strictEqual(dashRes.status, 403, 'Cross-tenant dashboard request must return 403');

    // Attempt to access testOutletId actions
    const actReq = new NextRequest(`http://localhost:3000/api/v1/actions?outletId=${testOutletId}`, {
      method: 'GET',
      headers: { cookie: `${SESSION_COOKIE_NAME}=${otherOrgToken}` }
    });

    const actRes = await getActionsHandler(actReq);
    assert.strictEqual(actRes.status, 403, 'Cross-tenant actions request must return 403');
  });

  // 11. Traceable Records API retrieves persisted database records
  await test('11. Records API retrieves verified checks, actions, and audit trail', async () => {
    const recReq = new NextRequest(`http://localhost:3000/api/v1/records?outlet_id=${testOutletId}`, {
      method: 'GET',
      headers: { cookie: `${SESSION_COOKIE_NAME}=${managerToken}` }
    });

    const recRes = await getRecordsHandler(recReq);
    assert.strictEqual(recRes.status, 200, 'Should return 200');
    const json = await recRes.json();
    assert.ok(json.data?.checks?.length > 0, 'Should return persisted checks');
    assert.ok(json.data?.actions?.length > 0, 'Should return persisted actions');
    assert.ok(json.data?.timeline?.length > 0, 'Should return audit timeline');
    assert.strictEqual(json.data?.outlet?.id, testOutletId, 'Must be scoped to requested outlet');
  });

  // 12. Fresh session data persistence
  await test('12. Fresh session retains access to previously persisted records', async () => {
    // Generate a fresh session token for the same user/outlet
    const freshSessionToken = createSessionToken({
      userId: testUserId,
      organisationId: testOrgId,
      outletId: testOutletId,
      role: 'outlet_manager',
      journey: 'restaurant'
    });

    const recReq = new NextRequest(`http://localhost:3000/api/v1/records?outlet_id=${testOutletId}`, {
      method: 'GET',
      headers: { cookie: `${SESSION_COOKIE_NAME}=${freshSessionToken}` }
    });

    const recRes = await getRecordsHandler(recReq);
    assert.strictEqual(recRes.status, 200, 'Fresh session must successfully authenticate');
    const json = await recRes.json();
    const closedAction = json.data?.actions?.find((a: any) => a.id === createdActionId);
    assert.ok(closedAction, 'Persisted action must be present in fresh session');
    assert.strictEqual(closedAction.status, 'closed', 'Persisted status must remain closed');
  });

  // 13. Unauthenticated requests are rejected with 401
  await test('13. Unauthenticated requests to records and dashboard return 401', async () => {
    const unauthRecords = await getRecordsHandler(new NextRequest('http://localhost:3000/api/v1/records'));
    assert.strictEqual(unauthRecords.status, 401, 'Records API must return 401 for unauthenticated request');

    const unauthDashboard = await getDashboardTodayHandler(new NextRequest('http://localhost:3000/api/v1/dashboard/today'));
    assert.strictEqual(unauthDashboard.status, 401, 'Dashboard API must return 401 for unauthenticated request');
  });

  // 14. Fail-closed production safety without DATABASE_URL
  await test('14. Production fail-closed enforcement when DATABASE_URL is missing', async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevDb = process.env.DATABASE_URL;
    const prevSecret = process.env.SESSION_SECRET;

    (process.env as any).NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'a_secure_production_session_secret_at_least_32_chars!';
    delete process.env.DATABASE_URL;

    try {
      const prodToken = createSessionToken({
        userId: testUserId,
        organisationId: testOrgId,
        outletId: testOutletId,
        role: 'outlet_manager',
        journey: 'restaurant'
      });
      const recReq = new NextRequest(`http://localhost:3000/api/v1/records`, {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${prodToken}` }
      });
      const res = await getRecordsHandler(recReq);
      assert.strictEqual(res.status, 500, 'Must return 500 in production without DB');
      const json = await res.json();
      assert.strictEqual(json.error?.code, 'CONFIGURATION_ERROR');
    } finally {
      (process.env as any).NODE_ENV = prevEnv;
      process.env.DATABASE_URL = prevDb;
      process.env.SESSION_SECRET = prevSecret;
    }
  });

  resetPool();
  console.log(`\nStage 5C Results: ${passed}/${total} passed.\n`);
  if (passed < total) {
    process.exit(1);
  }
}

runStage5CTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
