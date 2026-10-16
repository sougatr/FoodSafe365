import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  _clearRevokedSessionsForTesting
} from '../lib/session';
import {
  createDemoAction,
  getDemoAction,
  resetDemoStore,
  updateDemoAction
} from '../lib/demo-store';
import { GET as getActionHandler, PATCH as patchActionHandler } from '../app/api/v1/actions/[action_id]/route';
import { POST as submitVerificationHandler } from '../app/api/v1/actions/[action_id]/submit-verification/route';
import { POST as verifyActionHandler } from '../app/api/v1/actions/[action_id]/verify/route';
import { setPoolForTesting, resetPool } from '../lib/db';

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
    init.body = JSON.stringify(body);
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
    init.body = JSON.stringify(body);
  }
  return new Request(url, init);
}

async function runActionVerificationSecuritySuite() {
  console.log('========================================================================');
  console.log('FOODSAFE365 — CORRECTIVE ACTION VERIFICATION & STATUS OVERRIDE SECURITY');
  console.log('========================================================================\n');

  _clearRevokedSessionsForTesting();
  delete process.env.DATABASE_URL; // Guarantee in-memory/demo mode for Part 1
  resetDemoStore();

  const managerSession = {
    userId: 'mgr-alice',
    organisationId: 'org-bandra',
    outletId: 'the-table',
    role: 'outlet_manager'
  };

  const otherOutletManagerSession = {
    userId: 'mgr-bob',
    organisationId: 'org-bandra',
    outletId: 'other-outlet',
    role: 'outlet_manager'
  };

  const otherOrgManagerSession = {
    userId: 'mgr-charlie',
    organisationId: 'org-competitor',
    outletId: 'the-table',
    role: 'outlet_manager'
  };

  const foodHandlerSession = {
    userId: 'staff-dave',
    organisationId: 'org-bandra',
    outletId: 'the-table',
    role: 'food_handler'
  };

  // ---------------------------------------------------------------------------
  // TEST A: PERMITTED GENERAL ACTION UPDATE (IN_PROGRESS)
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: PERMITTED GENERAL ACTION UPDATE ---');
  resetDemoStore();
  const actionA = createDemoAction({
    id: 'act-test-a',
    title: 'Chiller door gasket torn',
    description: 'Chiller 1 fluctuating temperature',
    status: 'open',
    outletId: 'the-table',
    organisationId: managerSession.organisationId,
    severity: 'high',
    priority: 'high'
  }, managerSession.userId);

  const reqA = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a',
    'PATCH',
    managerSession,
    {
      immediate_action: 'Moved high-risk dairy items to Unit B',
      corrective_action: 'Fitted replacement magnetic gasket',
      root_cause: 'Wear and tear after 18 months continuous service',
      status: 'in_progress'
    }
  );
  const resA = await patchActionHandler(reqA, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resA.status, 200, 'Permitted patch must return HTTP 200');
  const jsonA = await resA.json();
  assert.strictEqual(jsonA.data.status, 'in_progress', 'Status must transition to in_progress');
  assert.strictEqual(jsonA.data.immediateAction, 'Moved high-risk dairy items to Unit B');
  assert.strictEqual(jsonA.data.correctiveAction, 'Fitted replacement magnetic gasket');
  assert.strictEqual(jsonA.data.rootCause, 'Wear and tear after 18 months continuous service');
  console.log('✅ TEST A PASSED: Permitted action fields and in_progress transition updated successfully');

  // ---------------------------------------------------------------------------
  // TEST B: GENERAL PATCH ATTEMPTING STATUS "closed" STRICTLY REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: GENERAL PATCH ATTEMPTING STATUS "closed" REJECTED ---');
  const reqB = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a',
    'PATCH',
    managerSession,
    {
      status: 'closed'
    }
  );
  const resB = await patchActionHandler(reqB, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resB.status, 400, 'Attempting to PATCH status="closed" must return HTTP 400');
  const jsonB = await resB.json();
  assert.strictEqual(jsonB.error.code, 'INVALID_TRANSITION', 'Error code must be INVALID_TRANSITION');
  assert.ok(jsonB.error.message.includes('closed'), 'Error message must explain verification requirement');

  // Verify status in store remains unchanged
  const currentActionB = getDemoAction('act-test-a', managerSession.userId);
  assert.strictEqual(currentActionB?.status, 'in_progress', 'Action status must remain unchanged in store');
  console.log('✅ TEST B PASSED: Direct PATCH status="closed" strictly rejected with 400 INVALID_TRANSITION');

  // ---------------------------------------------------------------------------
  // TEST C: GENERAL PATCH ATTEMPTING STATUS "awaiting_verification" REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C: GENERAL PATCH ATTEMPTING STATUS "awaiting_verification" REJECTED ---');
  const reqC = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a',
    'PATCH',
    managerSession,
    {
      status: 'awaiting_verification'
    }
  );
  const resC = await patchActionHandler(reqC, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resC.status, 400, 'Attempting to PATCH status="awaiting_verification" must return HTTP 400');
  const jsonC = await resC.json();
  assert.strictEqual(jsonC.error.code, 'INVALID_TRANSITION', 'Error code must be INVALID_TRANSITION');
  console.log('✅ TEST C PASSED: Direct PATCH status="awaiting_verification" strictly rejected with 400 INVALID_TRANSITION');

  // ---------------------------------------------------------------------------
  // TEST D: DEDICATED SUBMIT-VERIFICATION WORKFLOW
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST D: DEDICATED SUBMIT-VERIFICATION WORKFLOW ---');
  const reqD = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/submit-verification',
    'POST',
    managerSession,
    {
      immediate_action: 'Final check of cold items',
      corrective_action: 'Gasket sealed and chilled at 3.4C'
    }
  );
  const resD = await submitVerificationHandler(reqD, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resD.status, 200, 'Submit for verification must return HTTP 200');
  const jsonD = await resD.json();
  assert.strictEqual(jsonD.data.status, 'awaiting_verification', 'Status must move to awaiting_verification');

  const currentActionD = getDemoAction('act-test-a', managerSession.userId);
  assert.strictEqual(currentActionD?.status, 'awaiting_verification', 'Action status in store must be awaiting_verification');
  console.log('✅ TEST D PASSED: Action successfully transitioned to awaiting_verification via dedicated endpoint');

  // ---------------------------------------------------------------------------
  // TEST E: UNAUTHENTICATED VERIFICATION REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST E: UNAUTHENTICATED VERIFICATION REJECTED ---');
  const reqE = makeUnauthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/verify',
    'POST',
    { result: 'pass', notes: 'Unauthenticated attempt' }
  );
  const resE = await verifyActionHandler(reqE, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resE.status, 401, 'Unauthenticated verification must return HTTP 401');
  const jsonE = await resE.json();
  assert.strictEqual(jsonE.error.code, 'UNAUTHENTICATED');
  console.log('✅ TEST E PASSED: Unauthenticated verification strictly rejected with 401 UNAUTHENTICATED');

  // ---------------------------------------------------------------------------
  // TEST F: NON-MANAGER ROLE VERIFICATION REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST F: NON-MANAGER ROLE VERIFICATION REJECTED ---');
  const reqF = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/verify',
    'POST',
    foodHandlerSession,
    { result: 'pass', notes: 'Food handler trying to self-verify' }
  );
  const resF = await verifyActionHandler(reqF, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resF.status, 403, 'Food handler role must return HTTP 403 FORBIDDEN');
  const jsonF = await resF.json();
  assert.strictEqual(jsonF.error.code, 'FORBIDDEN');
  console.log('✅ TEST F PASSED: Non-manager verification strictly rejected with 403 FORBIDDEN');

  // ---------------------------------------------------------------------------
  // TEST G: CROSS-TENANT & CROSS-OUTLET VERIFICATION REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST G: CROSS-TENANT & CROSS-OUTLET VERIFICATION REJECTED ---');
  // Cross-outlet within same organisation
  const reqG1 = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/verify',
    'POST',
    otherOutletManagerSession,
    { result: 'pass', notes: 'Cross outlet manager verify' }
  );
  const resG1 = await verifyActionHandler(reqG1, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resG1.status, 403, 'Cross-outlet manager must return HTTP 403');
  const jsonG1 = await resG1.json();
  assert.strictEqual(jsonG1.error.code, 'FORBIDDEN');

  // Cross-organisation
  const reqG2 = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/verify',
    'POST',
    otherOrgManagerSession,
    { result: 'pass', notes: 'Cross org manager verify' }
  );
  const resG2 = await verifyActionHandler(reqG2, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resG2.status, 403, 'Cross-org manager must return HTTP 403');
  console.log('✅ TEST G PASSED: Cross-outlet and cross-tenant verification strictly rejected with 403 FORBIDDEN');

  // ---------------------------------------------------------------------------
  // TEST H: VALID AUTHORISED MANAGER VERIFICATION ("pass") CLOSES ACTION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST H: VALID AUTHORISED MANAGER VERIFICATION ("pass") ---');
  const reqH = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/verify',
    'POST',
    managerSession,
    {
      result: 'pass',
      verification_method: 'physical_inspection',
      notes: 'Independently checked core temperatures at 3.2C across top, middle, and bottom shelves.'
    }
  );
  const resH = await verifyActionHandler(reqH, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resH.status, 200, 'Valid verification must return HTTP 200');
  const jsonH = await resH.json();
  assert.strictEqual(jsonH.data.result, 'pass');
  assert.strictEqual(jsonH.data.status, 'closed', 'Authoritative status must be closed');
  assert.ok(jsonH.data.closedAt, 'closedAt must be populated');
  assert.strictEqual(jsonH.data.verification.verifiedBy, 'mgr-alice', 'Verifier must be server-derived from auth context');

  // Check store state
  const closedActionH = getDemoAction('act-test-a', managerSession.userId);
  assert.strictEqual(closedActionH?.status, 'closed');
  assert.ok(closedActionH?.closedAt);
  assert.strictEqual(closedActionH?.verifications?.length, 1);
  console.log('✅ TEST H PASSED: Authoritative manager verification ("pass") successfully closed action and recorded verifier');

  // ---------------------------------------------------------------------------
  // TEST I: VALID AUTHORISED MANAGER VERIFICATION ("fail") REOPENS ACTION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST I: VALID AUTHORISED MANAGER VERIFICATION ("fail") REOPENS ACTION ---');
  const actionI = createDemoAction({
    id: 'act-test-i',
    title: 'Hot holding unit below 63C',
    status: 'awaiting_verification',
    outletId: 'the-table',
    organisationId: managerSession.organisationId,
    severity: 'high',
    priority: 'high'
  }, managerSession.userId);

  const reqI = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-i/verify',
    'POST',
    managerSession,
    {
      result: 'fail',
      verification_method: 'temperature_measurement',
      notes: 'Bain-marie probe measured 58C. Still out of compliance. Recalibration required.'
    }
  );
  const resI = await verifyActionHandler(reqI, { params: { action_id: 'act-test-i' } });
  assert.strictEqual(resI.status, 200, 'Verification rejection must return HTTP 200');
  const jsonI = await resI.json();
  assert.strictEqual(jsonI.data.result, 'fail');
  assert.strictEqual(jsonI.data.status, 'open', 'Rejection must reopen action to status="open"');
  assert.strictEqual(jsonI.data.closedAt, null, 'Reopened action must have closedAt=null');

  const actionInStoreI = getDemoAction('act-test-i', managerSession.userId);
  assert.strictEqual(actionInStoreI?.status, 'open');
  assert.strictEqual(actionInStoreI?.closedAt, null);
  console.log('✅ TEST I PASSED: Manager verification ("fail") authoritative reopening verified');

  // ---------------------------------------------------------------------------
  // TEST J: INVALID STATUS TRANSITIONS REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST J: INVALID STATUS TRANSITIONS REJECTED ---');
  // 1. Trying to verify action while still "open" (not awaiting_verification)
  const actionJOpen = createDemoAction({
    id: 'act-test-j-open',
    title: 'Sanitizer bottle missing',
    status: 'open',
    outletId: 'the-table',
    organisationId: managerSession.organisationId
  }, managerSession.userId);

  const reqJ1 = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-j-open/verify',
    'POST',
    managerSession,
    { result: 'pass', notes: 'Premature verify' }
  );
  const resJ1 = await verifyActionHandler(reqJ1, { params: { action_id: 'act-test-j-open' } });
  assert.strictEqual(resJ1.status, 409, 'Verifying open action must return HTTP 409 INVALID_STATE');
  const jsonJ1 = await resJ1.json();
  assert.strictEqual(jsonJ1.error.code, 'INVALID_STATE');

  // 2. Trying to verify action that is already "closed"
  const reqJ2 = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/verify', // act-test-a was closed in Test H
    'POST',
    managerSession,
    { result: 'pass', notes: 'Re-verifying closed action' }
  );
  const resJ2 = await verifyActionHandler(reqJ2, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resJ2.status, 409, 'Verifying already closed action must return HTTP 409 INVALID_STATE');

  // 3. Trying to submit a closed action for verification
  const reqJ3 = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a/submit-verification',
    'POST',
    managerSession,
    {}
  );
  const resJ3 = await submitVerificationHandler(reqJ3, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resJ3.status, 409, 'Submitting closed action for verification must return HTTP 409');

  // 4. Trying to PATCH a closed action
  const reqJ4 = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-a',
    'PATCH',
    managerSession,
    { corrective_action: 'Modifying closed action' }
  );
  const resJ4 = await patchActionHandler(reqJ4, { params: { action_id: 'act-test-a' } });
  assert.strictEqual(resJ4.status, 409, 'Modifying closed action via PATCH must return HTTP 409 INVALID_STATE');
  console.log('✅ TEST J PASSED: Invariant state guards (premature verify, double verify, modify closed) strictly enforced');

  // ---------------------------------------------------------------------------
  // TEST K: CLIENT CANNOT INJECT VERIFIER IDENTITY OR TIMESTAMP
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST K: CLIENT CANNOT FORGE VERIFIER IDENTITY ---');
  const actionK = createDemoAction({
    id: 'act-test-k',
    title: 'Handwash basin tap loose',
    status: 'awaiting_verification',
    outletId: 'the-table',
    organisationId: managerSession.organisationId
  }, managerSession.userId);

  const reqK = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/act-test-k/verify',
    'POST',
    managerSession, // managerSession has userId: 'mgr-alice'
    {
      result: 'pass',
      verified_by: 'forged-auditor-id', // Attacker attempt to forge verifier identity
      verified_at: '2020-01-01T00:00:00.000Z' // Attacker attempt to backdate
    }
  );
  const resK = await verifyActionHandler(reqK, { params: { action_id: 'act-test-k' } });
  assert.strictEqual(resK.status, 200);
  const jsonK = await resK.json();
  assert.strictEqual(jsonK.data.verification.verifiedBy, 'mgr-alice', 'Server must ignore client verified_by and use session user');
  assert.notStrictEqual(jsonK.data.verification.verifiedAt, '2020-01-01T00:00:00.000Z', 'Server must ignore client backdated timestamp');
  console.log('✅ TEST K PASSED: Verified server-authoritative verifier identity and timestamp tamper resistance');

  // ---------------------------------------------------------------------------
  // TEST L: SIMULATED POSTGRESQL TRANSACTION PERSISTENCE HARNESS
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST L: SIMULATED POSTGRESQL TRANSACTION PERSISTENCE ---');
  process.env.DATABASE_URL = 'postgresql://test_user:test_pass@localhost:5432/foodsafe365_test';

  const mockDbActions: any[] = [
    {
      id: 'pg-action-1',
      outlet_id: 'the-table',
      organisation_id: 'org-bandra',
      status: 'awaiting_verification',
      title: 'PostgreSQL Refrigeration Action',
      source_type: 'check_response',
      source_id: 'obs-1'
    }
  ];
  const mockDbVerifications: any[] = [];
  const mockDbAuditLogs: any[] = [];

  const mockPool = {
    query: async (sql: string, params: any[] = []) => {
      const q = sql.trim().replace(/\s+/g, ' ');
      if (q.includes('FROM corrective_actions ca JOIN outlets o')) {
        const id = params[0];
        const match = mockDbActions.find(a => a.id === id);
        return { rows: match ? [match] : [] };
      }
      return { rows: [] };
    },
    connect: async () => {
      return {
        query: async (sql: string, params: any[] = []) => {
          const q = sql.trim().replace(/\s+/g, ' ');
          if (q.startsWith('BEGIN') || q.startsWith('COMMIT') || q.startsWith('ROLLBACK')) {
            return { rows: [] };
          }
          if (q.includes('INSERT INTO action_verifications')) {
            const verif = {
              id: 'verif-pg-1',
              corrective_action_id: params[0],
              verified_by: params[1],
              verification_method: params[2],
              result: params[3],
              notes: params[4],
              verified_at: new Date().toISOString()
            };
            mockDbVerifications.push(verif);
            return { rows: [verif] };
          }
          if (q.includes('UPDATE corrective_actions SET status')) {
            const id = params[0];
            const nextStatus = params[1];
            const act = mockDbActions.find(a => a.id === id);
            if (act) {
              act.status = nextStatus;
              act.closed_at = nextStatus === 'closed' ? new Date().toISOString() : null;
            }
            return { rows: [{ id, status: nextStatus, closed_at: act?.closed_at }] };
          }
          if (q.includes('UPDATE observations')) {
            return { rows: [] };
          }
          if (q.includes('INSERT INTO audit_logs')) {
            mockDbAuditLogs.push({ orgId: params[0], userId: params[1], entityId: params[2], action: params[3], value: params[4] });
            return { rows: [] };
          }
          if (q.includes('INSERT INTO system_events')) {
            return { rows: [] };
          }
          return { rows: [] };
        },
        release: () => {}
      };
    }
  };

  setPoolForTesting(mockPool);

  const reqL = makeAuthRequest(
    'http://localhost:3000/api/v1/actions/pg-action-1/verify',
    'POST',
    managerSession,
    {
      result: 'pass',
      verification_method: 'system_record_review',
      notes: 'PostgreSQL simulated manager inspection passed'
    }
  );
  const resL = await verifyActionHandler(reqL, { params: { action_id: 'pg-action-1' } });
  assert.strictEqual(resL.status, 200, 'PostgreSQL verify route must return HTTP 200');
  const jsonL = await resL.json();
  assert.strictEqual(jsonL.data.status, 'closed');
  assert.strictEqual(mockDbActions[0].status, 'closed');
  assert.strictEqual(mockDbVerifications.length, 1);
  assert.strictEqual(mockDbAuditLogs.length, 1);
  assert.strictEqual(mockDbAuditLogs[0].userId, 'mgr-alice');

  resetPool();
  delete process.env.DATABASE_URL;
  console.log('✅ TEST L PASSED: PostgreSQL transactional verification & audit persistence verified');

  // ---------------------------------------------------------------------------
  // TEST M: ZERO LOCALSTORAGE STATUS OVERRIDE IN UI SOURCE CODE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST M: ZERO LOCALSTORAGE STATUS OVERRIDES IN ACTION DETAIL UI ---');
  const pagePath = path.resolve(process.cwd(), 'app/actions/[action_id]/page.tsx');
  const pageCode = fs.readFileSync(pagePath, 'utf8');

  // Ensure saveState is not called to modify status
  assert.ok(!pageCode.includes("saveState("), 'UI must not call saveState to override status');
  // Ensure the page calls submit-verification and verify API endpoints
  assert.ok(pageCode.includes('/submit-verification'), 'UI must call server submit-verification endpoint');
  assert.ok(pageCode.includes('/verify'), 'UI must call server verify endpoint');
  console.log('✅ TEST M PASSED: UI source audit confirms zero localStorage status overrides and full server routing');

  console.log('\n========================================================================');
  console.log('🎯 ALL 13 ACTION VERIFICATION SECURITY TESTS (TEST A - TEST M) PASSED (13/13)');
  console.log('========================================================================\n');
}

runActionVerificationSecuritySuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
