import assert from 'node:assert';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  _clearRevokedSessionsForTesting
} from '../lib/session';
import {
  getDemoPlan,
  updateDemoPlan
} from '../lib/demo-haccp';
import {
  listDemoMonitoring
} from '../lib/demo-monitoring';
import {
  resetDemoStore
} from '../lib/demo-store';
import { setPoolForTesting, resetPool } from '../lib/db';
import { GET as getMonitoringHandler, POST as postMonitoringHandler } from '../app/api/v1/haccp/monitoring/route';

// Helper to create authenticated Request with signed session token
function makeAuthRequest(
  url: string,
  method: string,
  sessionData: { userId: string; organisationId: string; outletId: string; role: string },
  body?: any
): Request {
  const token = createSessionToken(sessionData);
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      'cookie': `${SESSION_COOKIE_NAME}=${token}`
    }
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request(url, init);
}

// Helper to create unauthenticated Request
function makeUnauthRequest(url: string, method: string, body?: any): Request {
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      'x-foodsafe-reject-spoofed': 'true'
    }
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request(url, init);
}

async function runHaccpMonitoringPersistenceSuite() {
  console.log('========================================================================');
  console.log('FOODSAFE365 — HACCP MONITORING PERSISTENCE & ACCESS CONTROL TEST SUITE');
  console.log('========================================================================\n');

  _clearRevokedSessionsForTesting();
  delete process.env.DATABASE_URL; // Guarantee demo mode initially
  resetDemoStore();

  const supervisorSession = {
    userId: 'usr-fss-1',
    organisationId: 'org-bandra',
    outletId: 'demo-outlet',
    role: 'food_safety_supervisor'
  };

  const managerSession = {
    userId: 'usr-mgr-1',
    organisationId: 'org-bandra',
    outletId: 'demo-outlet',
    role: 'outlet_manager'
  };

  const auditorSession = {
    userId: 'usr-auditor-1',
    organisationId: 'org-bandra',
    outletId: 'demo-outlet',
    role: 'auditor'
  };

  const foodHandlerSession = {
    userId: 'usr-handler-1',
    organisationId: 'org-bandra',
    outletId: 'demo-outlet',
    role: 'food_handler'
  };

  const otherOutletSession = {
    userId: 'usr-fss-2',
    organisationId: 'org-bandra',
    outletId: 'outlet-other',
    role: 'food_safety_supervisor'
  };

  const otherOrgSession = {
    userId: 'usr-fss-3',
    organisationId: 'org-competitor',
    outletId: 'outlet-competitor',
    role: 'food_safety_supervisor'
  };

  // ---------------------------------------------------------------------------
  // TEST 1: UNAUTHENTICATED ACCESS REJECTED (401)
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: UNAUTHENTICATED ACCESS REJECTED (401) ---');
  const unauthGetReq = makeUnauthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'GET');
  const unauthGetRes = await getMonitoringHandler(unauthGetReq);
  assert.strictEqual(unauthGetRes.status, 401, 'Unauthenticated GET must return HTTP 401');
  const unauthGetJson = await unauthGetRes.json();
  assert.strictEqual(unauthGetJson.error.code, 'UNAUTHENTICATED');

  const unauthPostReq = makeUnauthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', { ccpId: 'ccp-1', observedValue: 75 });
  const unauthPostRes = await postMonitoringHandler(unauthPostReq);
  assert.strictEqual(unauthPostRes.status, 401, 'Unauthenticated POST must return HTTP 401');
  const unauthPostJson = await unauthPostRes.json();
  assert.strictEqual(unauthPostJson.error.code, 'UNAUTHENTICATED');
  console.log('✅ TEST 1 PASSED: Unauthenticated access rejected with HTTP 401 on both GET and POST');

  // ---------------------------------------------------------------------------
  // TEST 2: FORBIDDEN ROLE ACCESS REJECTED (403)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: FORBIDDEN ROLE ACCESS REJECTED (403) ---');
  // Food handler lacks haccp:read
  const handlerGetReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'GET', foodHandlerSession);
  const handlerGetRes = await getMonitoringHandler(handlerGetReq);
  assert.strictEqual(handlerGetRes.status, 403, 'Food handler must not have haccp:read (HTTP 403)');
  const handlerGetJson = await handlerGetRes.json();
  assert.strictEqual(handlerGetJson.error.code, 'FORBIDDEN');

  // Food handler lacks haccp:write
  const handlerPostReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', foodHandlerSession, { ccpId: 'ccp-1', observedValue: 75 });
  const handlerPostRes = await postMonitoringHandler(handlerPostReq);
  assert.strictEqual(handlerPostRes.status, 403, 'Food handler must not have haccp:write (HTTP 403)');

  // Auditor has haccp:read but lacks haccp:write
  const auditorGetReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'GET', auditorSession);
  const auditorGetRes = await getMonitoringHandler(auditorGetReq);
  assert.strictEqual(auditorGetRes.status, 200, 'Auditor must be permitted haccp:read (HTTP 200)');

  const auditorPostReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', auditorSession, { ccpId: 'ccp-1', observedValue: 75 });
  const auditorPostRes = await postMonitoringHandler(auditorPostReq);
  assert.strictEqual(auditorPostRes.status, 403, 'Auditor must be forbidden haccp:write (HTTP 403)');
  console.log('✅ TEST 2 PASSED: Strict role-based permissions enforced (food_handler rejected, auditor read-only)');

  // ---------------------------------------------------------------------------
  // TEST 3: INVALID PAYLOADS VALIDATION (400)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: INVALID PAYLOADS VALIDATION (400) ---');
  // 3a: Non-JSON body
  const malformedReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, 'NOT_VALID_JSON{');
  const malformedRes = await postMonitoringHandler(malformedReq);
  assert.strictEqual(malformedRes.status, 400);
  const malformedJson = await malformedRes.json();
  assert.strictEqual(malformedJson.error.code, 'VALIDATION_ERROR');

  // 3b: Missing ccpId
  const noCcpReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, { observedValue: 72 });
  const noCcpRes = await postMonitoringHandler(noCcpReq);
  assert.strictEqual(noCcpRes.status, 400);
  const noCcpJson = await noCcpRes.json();
  assert.strictEqual(noCcpJson.error.code, 'VALIDATION_ERROR');

  // 3c: Missing or non-numeric observedValue
  const nanReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, { ccpId: 'ccp-1', observedValue: 'seventy-five' });
  const nanRes = await postMonitoringHandler(nanReq);
  assert.strictEqual(nanRes.status, 400);
  const nanJson = await nanRes.json();
  assert.strictEqual(nanJson.error.code, 'VALIDATION_ERROR');
  console.log('✅ TEST 3 PASSED: Malformed JSON, missing ccpId, and non-numeric reading rejected with HTTP 400');

  // ---------------------------------------------------------------------------
  // TEST 4: IN-MEMORY DEMO FALLBACK (DATABASE_URL UNSET)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 4: IN-MEMORY DEMO FALLBACK BEHAVIOUR ---');
  // Prepare validated demo CCP in demo plan
  const plan = getDemoPlan();
  const ccpCooking = plan.ccps.find(c => c.id === 'ccp-1')!;
  ccpCooking.criticalLimitMin = 75;
  ccpCooking.unit = '°C';
  ccpCooking.validationStatus = 'validated';

  // 4a: Non-existent CCP
  const missingCcpReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, { ccpId: 'ccp-nonexistent', observedValue: 80 });
  const missingCcpRes = await postMonitoringHandler(missingCcpReq);
  assert.strictEqual(missingCcpRes.status, 404, 'Nonexistent CCP must return 404');

  // 4b: Unvalidated CCP (ccp-2 has no validationStatus)
  const unvalidatedReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, { ccpId: 'ccp-2', observedValue: 4 });
  const unvalidatedRes = await postMonitoringHandler(unvalidatedReq);
  assert.strictEqual(unvalidatedRes.status, 409, 'Unvalidated CCP must return 409 INVALID_STATE');

  // 4c: Valid compliant monitoring entry
  const compliantReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, { ccpId: 'ccp-1', observedValue: 78 });
  const compliantRes = await postMonitoringHandler(compliantReq);
  assert.strictEqual(compliantRes.status, 200, 'Compliant demo record should return 200');
  const compliantJson = await compliantRes.json();
  assert.strictEqual(compliantJson.data.demo, true);
  assert.strictEqual(compliantJson.data.withinLimit, true);
  assert.strictEqual(compliantJson.data.actionRequired, false);
  assert.strictEqual(compliantJson.data.correctiveActionId, null);
  assert.strictEqual(compliantJson.data.record.observedValue, 78);

  // 4d: Critical limit deviation creates corrective action
  const breachReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, { ccpId: 'ccp-1', observedValue: 68 });
  const breachRes = await postMonitoringHandler(breachReq);
  assert.strictEqual(breachRes.status, 200);
  const breachJson = await breachRes.json();
  assert.strictEqual(breachJson.data.withinLimit, false);
  assert.strictEqual(breachJson.data.actionRequired, true);
  assert.ok(breachJson.data.correctiveActionId, 'Breach must link a created corrective action');

  // 4e: GET retrieves demo records
  const getDemoReq = makeAuthRequest('http://localhost:3000/api/v1/haccp/monitoring?ccp_id=ccp-1', 'GET', supervisorSession);
  const getDemoRes = await getMonitoringHandler(getDemoReq);
  assert.strictEqual(getDemoRes.status, 200);
  const getDemoJson = await getDemoRes.json();
  assert.strictEqual(getDemoJson.data.demo, true);
  assert.ok(getDemoJson.data.records.length >= 2);
  console.log('✅ TEST 4 PASSED: In-memory demo fallback fully functional (cleanly identified with demo: true)');

  // ---------------------------------------------------------------------------
  // TEST 5: POSTGRESQL PERSISTENCE HARNESS (DATABASE_URL CONFIGURED)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: POSTGRESQL PERSISTENCE (DATABASE_URL CONFIGURED) ---');
  process.env.DATABASE_URL = 'postgresql://foodsafe_app:secret@localhost:5432/foodsafe365_prod';

  // Seed simulated database records for test
  const dbCcps = [
    {
      id: 'ccp-pg-1',
      haccp_plan_id: 'plan-pg-1',
      process_step: 'Cooking',
      critical_limit: 'Minimum core temperature 75°C for 2 minutes',
      unit: '°C',
      critical_limit_min: 75.0,
      critical_limit_max: null,
      validation_status: 'validated',
      outlet_id: 'demo-outlet',
      organisation_id: 'org-bandra'
    },
    {
      id: 'ccp-pg-pending',
      haccp_plan_id: 'plan-pg-1',
      process_step: 'Cooling',
      critical_limit: 'Cool from 60°C to 21°C within 2 hours',
      unit: '°C',
      critical_limit_min: null,
      critical_limit_max: 21.0,
      validation_status: 'pending', // NOT validated
      outlet_id: 'demo-outlet',
      organisation_id: 'org-bandra'
    },
    {
      id: 'ccp-pg-competitor',
      haccp_plan_id: 'plan-pg-competitor',
      process_step: 'Cooking',
      critical_limit: '75°C core',
      unit: '°C',
      critical_limit_min: 75.0,
      critical_limit_max: null,
      validation_status: 'validated',
      outlet_id: 'outlet-competitor',
      organisation_id: 'org-competitor'
    }
  ];

  const dbMonitoringRecords: any[] = [];
  const dbCorrectiveActions: any[] = [];
  const dbAuditLogs: any[] = [];
  let dbQueriesExecuted: string[] = [];

  const mockDbPool = {
    query: async (sqlText: string, params: any[] = []) => {
      const q = sqlText.trim().replace(/\s+/g, ' ');
      dbQueriesExecuted.push(q);

      // CCP lookup query
      if (q.includes('FROM ccps c JOIN haccp_plans hp')) {
        const ccpId = params[0];
        const match = dbCcps.find(c => c.id === ccpId);
        return { rows: match ? [match] : [] };
      }

      // GET monitoring records query
      if (q.includes('FROM monitoring_records mr')) {
        let results = [...dbMonitoringRecords];
        // Outlet filter
        if (q.includes('mr.outlet_id = $1')) {
          const outletId = params[0];
          results = results.filter(r => r.outlet_id === outletId);
        }
        // CCP filter
        if (q.includes('mr.ccp_id = $')) {
          const ccpIdParam = params.find(p => typeof p === 'string' && p.startsWith('ccp-pg'));
          if (ccpIdParam) {
            results = results.filter(r => r.ccp_id === ccpIdParam);
          }
        }
        return {
          rows: results.map(r => ({
            id: r.id,
            ccpId: r.ccp_id,
            outletId: r.outlet_id,
            recordedBy: r.recorded_by,
            observedValue: r.observed_value,
            unit: r.unit,
            withinLimit: r.within_limit,
            observationTime: r.observation_time,
            actionRequired: r.action_required,
            correctiveActionId: r.corrective_action_id,
            processStep: 'Cooking',
            criticalLimit: '75°C'
          }))
        };
      }

      return { rows: [] };
    },

    connect: async () => {
      return {
        query: async (sqlText: string, params: any[] = []) => {
          const q = sqlText.trim().replace(/\s+/g, ' ');
          dbQueriesExecuted.push(q);

          if (q === 'BEGIN' || q === 'COMMIT' || q === 'ROLLBACK') {
            return { rows: [] };
          }

          // INSERT INTO corrective_actions
          if (q.includes('INSERT INTO corrective_actions')) {
            const action = {
              id: `act-pg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              outlet_id: params[0],
              source_type: 'haccp_monitoring',
              source_id: params[1],
              title: params[2],
              description: params[3],
              severity: 'high',
              priority: 'high',
              assigned_to: params[4],
              due_date: new Date().toISOString().slice(0, 10),
              status: 'open',
              immediate_action: params[5],
              corrective_action: params[6],
              root_cause: params[7],
              source_check_code: params[8],
              created_at: new Date().toISOString()
            };
            dbCorrectiveActions.push(action);
            return { rows: [{ id: action.id }] };
          }

          // INSERT INTO monitoring_records
          if (q.includes('INSERT INTO monitoring_records')) {
            const mon = {
              id: `mon-pg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              ccp_id: params[0],
              outlet_id: params[1],
              recorded_by: params[2],
              observed_value: params[3],
              unit: params[4],
              within_limit: params[5],
              action_required: params[6],
              corrective_action_id: params[7],
              observation_time: new Date().toISOString()
            };
            dbMonitoringRecords.push(mon);
            return {
              rows: [{
                id: mon.id,
                ccpId: mon.ccp_id,
                outletId: mon.outlet_id,
                recordedBy: mon.recorded_by,
                observedValue: mon.observed_value,
                unit: mon.unit,
                withinLimit: mon.within_limit,
                observationTime: mon.observation_time,
                actionRequired: mon.action_required,
                correctiveActionId: mon.corrective_action_id
              }]
            };
          }

          // INSERT INTO audit_logs
          if (q.includes('INSERT INTO audit_logs')) {
            const log = {
              id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              organisation_id: params[0],
              user_id: params[1],
              entity_type: params[2],
              entity_id: params[3],
              action: params[4],
              new_value: params[5],
              occurred_at: new Date().toISOString()
            };
            dbAuditLogs.push(log);
            return { rows: [{ id: log.id }] };
          }

          return { rows: [] };
        },
        release: () => {}
      };
    }
  };

  setPoolForTesting(mockDbPool);

  // ---------------------------------------------------------------------------
  // TEST 5A: POSTGRESQL RECORD CREATION — WITHIN CRITICAL LIMIT
  // ---------------------------------------------------------------------------
  console.log('--- TEST 5A: POSTGRESQL CREATION WITHIN LIMIT ---');
  const pgCompliantReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'POST',
    supervisorSession,
    { ccpId: 'ccp-pg-1', observedValue: 79.5, unit: '°C' }
  );
  const pgCompliantRes = await postMonitoringHandler(pgCompliantReq);
  assert.notStrictEqual(pgCompliantRes.status, 501, 'Must NOT return 501 NOT_IMPLEMENTED');
  assert.strictEqual(pgCompliantRes.status, 201, 'Valid creation must return HTTP 201');
  const pgCompliantJson = await pgCompliantRes.json();

  assert.strictEqual(pgCompliantJson.data.demo, false, 'Production persistence must set demo: false');
  assert.strictEqual(pgCompliantJson.data.withinLimit, true);
  assert.strictEqual(pgCompliantJson.data.actionRequired, false);
  assert.strictEqual(pgCompliantJson.data.correctiveActionId, null);
  assert.strictEqual(pgCompliantJson.data.record.observedValue, 79.5);
  assert.strictEqual(pgCompliantJson.data.record.recordedBy, supervisorSession.userId);
  assert.strictEqual(pgCompliantJson.data.record.outletId, supervisorSession.outletId);

  assert.strictEqual(dbMonitoringRecords.length, 1);
  assert.strictEqual(dbCorrectiveActions.length, 0, 'No corrective action when within limit');
  assert.strictEqual(dbAuditLogs.length, 1, 'Audit log emitted for monitoring record');
  console.log('✅ TEST 5A PASSED: Compliant monitoring record persisted to PostgreSQL with recordedBy & audit trail');

  // ---------------------------------------------------------------------------
  // TEST 5B: POSTGRESQL RECORD CREATION — CRITICAL LIMIT BREACH (DEVIATION)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5B: POSTGRESQL CREATION WITH DEVIATION (CREATES ACTION) ---');
  const pgBreachReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'POST',
    supervisorSession,
    { ccpId: 'ccp-pg-1', observedValue: 69.0, unit: '°C' }
  );
  const pgBreachRes = await postMonitoringHandler(pgBreachReq);
  assert.notStrictEqual(pgBreachRes.status, 501, 'Must NOT return 501 NOT_IMPLEMENTED');
  assert.strictEqual(pgBreachRes.status, 201);
  const pgBreachJson = await pgBreachRes.json();

  assert.strictEqual(pgBreachJson.data.demo, false);
  assert.strictEqual(pgBreachJson.data.withinLimit, false);
  assert.strictEqual(pgBreachJson.data.actionRequired, true);
  assert.ok(pgBreachJson.data.correctiveActionId, 'Must link created corrective action ID');
  assert.strictEqual(pgBreachJson.data.record.correctiveActionId, pgBreachJson.data.correctiveActionId);

  assert.strictEqual(dbMonitoringRecords.length, 2);
  assert.strictEqual(dbCorrectiveActions.length, 1, 'Corrective action created in corrective_actions table');
  const createdAction = dbCorrectiveActions[0];
  assert.strictEqual(createdAction.id, pgBreachJson.data.correctiveActionId);
  assert.strictEqual(createdAction.assigned_to, supervisorSession.userId);
  assert.strictEqual(createdAction.source_type, 'haccp_monitoring');
  assert.strictEqual(createdAction.status, 'open');

  // Audit logs: 1 from 5A + 2 from 5B (corrective action + monitoring record) = 3
  assert.strictEqual(dbAuditLogs.length, 3);
  console.log('✅ TEST 5B PASSED: Deviation atomically created corrective action, linked actionId, and logged audit trail');

  // ---------------------------------------------------------------------------
  // TEST 5C: POSTGRESQL GET RETRIEVAL
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5C: POSTGRESQL GET RETRIEVAL ---');
  const pgGetReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring?ccp_id=ccp-pg-1',
    'GET',
    supervisorSession
  );
  const pgGetRes = await getMonitoringHandler(pgGetReq);
  assert.notStrictEqual(pgGetRes.status, 501, 'GET must NOT return 501 NOT_IMPLEMENTED');
  assert.strictEqual(pgGetRes.status, 200);
  const pgGetJson = await pgGetRes.json();
  assert.strictEqual(pgGetJson.data.demo, false);
  assert.strictEqual(pgGetJson.data.records.length, 2);
  assert.strictEqual(pgGetJson.data.records[0].outletId, supervisorSession.outletId);
  console.log('✅ TEST 5C PASSED: PostgreSQL monitoring retrieval functional and scoped to tenant outlet');

  // ---------------------------------------------------------------------------
  // TEST 5D: UNVALIDATED CCP REJECTED IN POSTGRESQL (409)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5D: UNVALIDATED CCP REJECTED IN POSTGRESQL (409) ---');
  const pgUnvalidatedReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'POST',
    supervisorSession,
    { ccpId: 'ccp-pg-pending', observedValue: 18.0 }
  );
  const pgUnvalidatedRes = await postMonitoringHandler(pgUnvalidatedReq);
  assert.strictEqual(pgUnvalidatedRes.status, 409, 'Unvalidated CCP must return HTTP 409 INVALID_STATE');
  const pgUnvalJson = await pgUnvalidatedRes.json();
  assert.strictEqual(pgUnvalJson.error.code, 'INVALID_STATE');
  console.log('✅ TEST 5D PASSED: Unvalidated CCP rejected with HTTP 409 INVALID_STATE in PostgreSQL mode');

  // ---------------------------------------------------------------------------
  // TEST 5E: NON-EXISTENT CCP IN POSTGRESQL (404)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5E: NON-EXISTENT CCP IN POSTGRESQL (404) ---');
  const pgMissingReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'POST',
    supervisorSession,
    { ccpId: 'ccp-does-not-exist', observedValue: 80.0 }
  );
  const pgMissingRes = await postMonitoringHandler(pgMissingReq);
  assert.strictEqual(pgMissingRes.status, 404, 'Missing CCP must return HTTP 404 NOT_FOUND');
  console.log('✅ TEST 5E PASSED: Nonexistent CCP rejected with HTTP 404 NOT_FOUND in PostgreSQL mode');

  // ---------------------------------------------------------------------------
  // TEST 5F: CROSS-TENANT ISOLATION ENFORCED (403)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5F: CROSS-TENANT ISOLATION ENFORCED (403) ---');
  // Attempting to record monitoring for competitor's CCP
  const crossTenantPostReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'POST',
    supervisorSession, // supervisor belongs to org-bandra
    { ccpId: 'ccp-pg-competitor', observedValue: 82.0 } // belongs to org-competitor
  );
  const crossTenantPostRes = await postMonitoringHandler(crossTenantPostReq);
  assert.strictEqual(crossTenantPostRes.status, 403, 'Cross-tenant POST must return HTTP 403 FORBIDDEN');
  const crossTenantPostJson = await crossTenantPostRes.json();
  assert.strictEqual(crossTenantPostJson.error.code, 'FORBIDDEN');

  // Attempting to access competitor records via GET with competitor outlet
  const crossTenantGetReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'GET',
    otherOrgSession // belongs to org-competitor
  );
  const crossTenantGetRes = await getMonitoringHandler(crossTenantGetReq);
  assert.strictEqual(crossTenantGetRes.status, 200);
  const crossTenantGetJson = await crossTenantGetRes.json();
  // Competitor must NOT see Bandra records
  assert.strictEqual(crossTenantGetJson.data.records.length, 0, 'Competitor tenant must see 0 records from Bandra');
  console.log('✅ TEST 5F PASSED: Strict cross-tenant isolation enforced on both write (403) and read (empty partition)');

  // ---------------------------------------------------------------------------
  // TEST 5G: DATABASE FAILURE HANDLED SAFELY (500)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5G: DATABASE FAILURE HANDLED SAFELY (500) ---');
  const failingPool = {
    query: async () => {
      throw new Error('SIMULATED_PG_CONNECTION_TIMEOUT: Connection to database terminated');
    },
    connect: async () => {
      throw new Error('SIMULATED_PG_CONNECTION_REFUSED: Pool exhausted');
    }
  };
  setPoolForTesting(failingPool);

  const failPostReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'POST',
    supervisorSession,
    { ccpId: 'ccp-pg-1', observedValue: 80.0 }
  );
  const failPostRes = await postMonitoringHandler(failPostReq);
  assert.strictEqual(failPostRes.status, 500, 'Database failure must return HTTP 500');
  const failPostJson = await failPostRes.json();
  assert.strictEqual(failPostJson.error.code, 'DATABASE_ERROR');
  assert.ok(!JSON.stringify(failPostJson).includes('secret'), 'Must never leak database credentials');

  const failGetReq = makeAuthRequest(
    'http://localhost:3000/api/v1/haccp/monitoring',
    'GET',
    supervisorSession
  );
  const failGetRes = await getMonitoringHandler(failGetReq);
  assert.strictEqual(failGetRes.status, 500);
  const failGetJson = await failGetRes.json();
  assert.strictEqual(failGetJson.error.code, 'DATABASE_ERROR');
  console.log('✅ TEST 5G PASSED: Database connectivity failure handled safely with HTTP 500 DATABASE_ERROR and zero credential leaks');

  // Cleanup
  resetPool();
  delete process.env.DATABASE_URL;

  console.log('\n========================================================================');
  console.log('🎯 ALL 12 HACCP MONITORING PERSISTENCE TESTS PASSED (12/12)');
  console.log('========================================================================\n');
}

runHaccpMonitoringPersistenceSuite().catch(err => {
  console.error('❌ HACCP MONITORING PERSISTENCE TEST SUITE FAILED:', err);
  process.exit(1);
});
