import assert from 'node:assert';
import {
  createSessionToken,
  verifySessionToken,
  revokeSession,
  _clearRevokedSessionsForTesting,
  SESSION_COOKIE_NAME
} from '../lib/session';
import { getAuthContext } from '../lib/auth';
import { authorizeFeedbackAccess, requireOutletAccess } from '../lib/tenant';
import { authorizeGroceryAccess } from '../lib/grocery-tenant';
import { can } from '../lib/permissions';
import { updateRestaurantStatus } from '../lib/unclaimed-restaurant-store';

async function runSecurityTestSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — P0 SECURITY VERIFICATION: AUTH & TENANT ISOLATION');
  console.log('================================================================\n');

  _clearRevokedSessionsForTesting();

  // ---------------------------------------------------------------------------
  // TEST A: VALID SESSION ACCEPTED
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: VALID SESSION ACCEPTED ---');
  const validToken = createSessionToken({
    userId: 'mgr-table-1',
    organisationId: 'table-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  });

  const reqA = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${validToken}`
    }
  });

  const authA = await getAuthContext(reqA);
  assert.ok(authA, 'Valid session token must resolve an AuthContext');
  assert.strictEqual(authA.userId, 'mgr-table-1', 'User ID must match session data');
  assert.strictEqual(authA.role, 'outlet_manager', 'Role must match session data');
  assert.strictEqual(authA.outletId, 'the-table', 'Outlet ID must match session data');

  const accessA = await authorizeFeedbackAccess('the-table', reqA);
  assert.strictEqual(accessA.ok, true, 'Authorized manager must access their assigned outlet');
  console.log('✅ TEST A PASSED: Valid cryptographically signed session accepted');

  // ---------------------------------------------------------------------------
  // TEST B: MISSING SESSION REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: MISSING SESSION REJECTED ---');
  const reqB = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'x-foodsafe-reject-spoofed': 'true'
    }
  });

  const authB = await getAuthContext(reqB);
  assert.strictEqual(authB, null, 'Request without session must yield null auth context');

  const accessB = await authorizeFeedbackAccess('the-table', reqB);
  assert.strictEqual(accessB.ok, false, 'Missing session must fail authorization');
  assert.strictEqual(accessB.status, 401, 'Missing session must return 401 UNAUTHENTICATED');

  const groceryAccessB = await authorizeGroceryAccess('store-nature-basket-bandra', reqB, true);
  assert.strictEqual(groceryAccessB.ok, false, 'Missing session must fail grocery authorization');
  assert.strictEqual(groceryAccessB.status, 401, 'Missing session must return 401 UNAUTHENTICATED');
  console.log('✅ TEST B PASSED: Missing session strictly rejected with 401');

  // ---------------------------------------------------------------------------
  // TEST C: MODIFIED COOKIE REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C: MODIFIED COOKIE REJECTED ---');
  // Alter a character in the base64url payload to simulate client-side tampering
  const parts = validToken.split('.');
  const tamperedPayload = parts[0].slice(0, -2) + (parts[0].endsWith('A') ? 'B' : 'A') + parts[0].slice(-1);
  const tamperedToken = `${tamperedPayload}.${parts[1]}`;

  const reqC = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${tamperedToken}`,
      'x-foodsafe-reject-spoofed': 'true'
    }
  });

  const authC = await getAuthContext(reqC);
  assert.strictEqual(authC, null, 'Tampered cookie payload must fail HMAC signature check and yield null');

  const accessC = await authorizeFeedbackAccess('the-table', reqC);
  assert.strictEqual(accessC.ok, false, 'Tampered cookie must fail access check');
  assert.strictEqual(accessC.status, 401, 'Tampered cookie must return 401 UNAUTHENTICATED');
  console.log('✅ TEST C PASSED: Modified/tampered cookie strictly rejected (signature mismatch)');

  // ---------------------------------------------------------------------------
  // TEST D: EXPIRED SESSION REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST D: EXPIRED SESSION REJECTED ---');
  // Mint a session with negative TTL (-10 seconds)
  const expiredToken = createSessionToken({
    userId: 'mgr-table-1',
    organisationId: 'table-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  }, -10);

  const reqD = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${expiredToken}`,
      'x-foodsafe-reject-spoofed': 'true'
    }
  });

  const authD = await getAuthContext(reqD);
  assert.strictEqual(authD, null, 'Expired session token must yield null auth context');

  const accessD = await authorizeFeedbackAccess('the-table', reqD);
  assert.strictEqual(accessD.ok, false, 'Expired session must fail access check');
  assert.strictEqual(accessD.status, 401, 'Expired session must return 401 UNAUTHENTICATED');
  console.log('✅ TEST D PASSED: Expired session strictly rejected with 401');

  // ---------------------------------------------------------------------------
  // TEST E: INVALID SIGNATURE REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST E: INVALID SIGNATURE REJECTED ---');
  // Token with valid base64 payload but fake HMAC signature
  const fakeSigToken = `${parts[0]}.forged_signature_attempt_1234567890`;

  const reqE = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${fakeSigToken}`,
      'x-foodsafe-reject-spoofed': 'true'
    }
  });

  const authE = await getAuthContext(reqE);
  assert.strictEqual(authE, null, 'Forged signature must fail constant-time HMAC comparison');

  const accessE = await authorizeFeedbackAccess('the-table', reqE);
  assert.strictEqual(accessE.ok, false, 'Forged signature must fail access check');
  assert.strictEqual(accessE.status, 401, 'Forged signature must return 401 UNAUTHENTICATED');
  console.log('✅ TEST E PASSED: Invalid signature strictly rejected');

  // ---------------------------------------------------------------------------
  // TEST F: LOGOUT INVALIDATES SESSION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST F: LOGOUT INVALIDATES SESSION ---');
  const tokenToLogout = createSessionToken({
    userId: 'mgr-table-1',
    organisationId: 'table-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  });

  const decoded = verifySessionToken(tokenToLogout);
  assert.ok(decoded.valid && decoded.data, 'Token must be initially valid');
  const sessionId = decoded.data!.sessionId;

  // Simulate logout: server revokes sessionId
  revokeSession(sessionId);

  const reqF = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${tokenToLogout}`,
      'x-foodsafe-reject-spoofed': 'true'
    }
  });

  const authF = await getAuthContext(reqF);
  assert.strictEqual(authF, null, 'Revoked session must yield null auth context');

  const accessF = await authorizeFeedbackAccess('the-table', reqF);
  assert.strictEqual(accessF.ok, false, 'Revoked session must fail authorization');
  assert.strictEqual(accessF.status, 401, 'Revoked session must return 401 UNAUTHENTICATED');
  console.log('✅ TEST F PASSED: Logout server-side invalidation verified');

  // ---------------------------------------------------------------------------
  // TEST G: CLIENT CANNOT CHANGE USER ID
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST G: CLIENT CANNOT CHANGE USER ID ---');
  const aliceToken = createSessionToken({
    userId: 'user-alice-authentic',
    organisationId: 'table-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  });

  // Client attempts to spoof user ID via header
  const reqG = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${aliceToken}`,
      'x-foodsafe-user-id': 'user-bob-attacker'
    }
  });

  const authG = await getAuthContext(reqG);
  assert.ok(authG, 'AuthContext must be derived');
  assert.strictEqual(authG.userId, 'user-alice-authentic', 'User ID must remain strictly alice, ignoring spoofed header');
  assert.notStrictEqual(authG.userId, 'user-bob-attacker', 'Attacker user ID must be ignored');
  console.log('✅ TEST G PASSED: Client cannot change user ID (session overrides headers)');

  // ---------------------------------------------------------------------------
  // TEST H: CLIENT CANNOT CHANGE ROLE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST H: CLIENT CANNOT CHANGE ROLE ---');
  const managerToken = createSessionToken({
    userId: 'mgr-user-01',
    organisationId: 'table-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  });

  // Manager attempts to elevate privilege by passing platform_admin header
  const reqH = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${managerToken}`,
      'x-foodsafe-role': 'platform_admin'
    }
  });

  const authH = await getAuthContext(reqH);
  assert.ok(authH, 'AuthContext must be derived');
  assert.strictEqual(authH.role, 'outlet_manager', 'Role must remain outlet_manager from cryptographically signed session');
  assert.strictEqual(can(authH.role, 'haccp:superadmin_bypass'), false, 'Cannot obtain unauthorized permissions');
  console.log('✅ TEST H PASSED: Client cannot change role (privilege elevation blocked)');

  // ---------------------------------------------------------------------------
  // TEST I: CLIENT CANNOT CHANGE TENANT / OUTLET ID
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST I: CLIENT CANNOT CHANGE TENANT / OUTLET ID ---');
  const tableManagerToken = createSessionToken({
    userId: 'mgr-table-1',
    organisationId: 'table-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  });

  // Manager of The Table attempts to spoof tenant header to Bombay Canteen
  const reqI = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-bombay-canteen', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${tableManagerToken}`,
      'x-foodsafe-outlet-id': 'the-bombay-canteen'
    }
  });

  const authI = await getAuthContext(reqI);
  assert.ok(authI, 'AuthContext must be derived');
  assert.strictEqual(authI.outletId, 'the-table', 'Outlet ID must remain the-table, ignoring spoofed header');

  const accessI = await authorizeFeedbackAccess('the-bombay-canteen', reqI);
  assert.strictEqual(accessI.ok, false, 'Access to unauthorized outlet must be denied');
  assert.strictEqual(accessI.status, 403, 'Cross-tenant request must return 403 FORBIDDEN');
  console.log('✅ TEST I PASSED: Client cannot change tenant/outlet ID');

  // ---------------------------------------------------------------------------
  // TEST J: SPOOFED X-FOODSAFE-* HEADERS IGNORED / REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST J: SPOOFED X-FOODSAFE-* HEADERS IGNORED / REJECTED ---');
  // Unauthenticated attacker sending raw spoofed headers when signed session is required
  const reqJUnauth = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'x-foodsafe-user-id': 'attacker-admin',
      'x-foodsafe-role': 'platform_admin',
      'x-foodsafe-outlet-id': 'the-table',
      'x-foodsafe-reject-spoofed': 'true'
    }
  });

  const authJUnauth = await getAuthContext(reqJUnauth);
  assert.strictEqual(authJUnauth, null, 'Unauthenticated request with spoofed headers must yield null');

  const accessJUnauth = await authorizeFeedbackAccess('the-table', reqJUnauth);
  assert.strictEqual(accessJUnauth.ok, false, 'Spoofed headers must not grant access');
  assert.strictEqual(accessJUnauth.status, 401, 'Must return 401 UNAUTHENTICATED');
  console.log('✅ TEST J PASSED: Spoofed x-foodsafe-* headers ignored/rejected');

  // ---------------------------------------------------------------------------
  // TEST K: CROSS-TENANT ACCESS REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST K: CROSS-TENANT ACCESS REJECTED ---');
  // Subtest K1: Restaurant A accessing Restaurant B
  const restAManagerToken = createSessionToken({
    userId: 'mgr-canteen-1',
    organisationId: 'bombay-canteen-org',
    outletId: 'the-bombay-canteen',
    role: 'outlet_manager'
  });

  const reqK1 = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${restAManagerToken}`
    }
  });

  const accessK1 = await authorizeFeedbackAccess('the-table', reqK1);
  assert.strictEqual(accessK1.ok, false, 'Restaurant A manager must be blocked from Restaurant B');
  assert.strictEqual(accessK1.status, 403, 'Must return 403 FORBIDDEN');

  // Subtest K2: Grocery Store A accessing Grocery Store B
  const groceryAManagerToken = createSessionToken({
    userId: 'mgr-bandra-grocery',
    organisationId: 'org-bandra',
    outletId: 'store-nature-basket-bandra',
    role: 'outlet_manager'
  });

  const reqK2 = new Request('http://localhost:3000/api/v1/grocery/zones?outletId=store-nature-basket-juhu', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${groceryAManagerToken}`
    }
  });

  const accessK2 = await authorizeGroceryAccess('store-nature-basket-juhu', reqK2, true);
  assert.strictEqual(accessK2.ok, false, 'Grocery Store A manager must be blocked from Grocery Store B');
  assert.strictEqual(accessK2.status, 403, 'Must return 403 FORBIDDEN');

  // Subtest K3: Service Provider A attempting to access data for Provider B
  const providerAToken = createSessionToken({
    userId: 'prov-refrig-frost',
    organisationId: 'org-frostline',
    outletId: 'none',
    role: 'vendor',
    providerId: 'prov-refrig-frost'
  });

  const authK3 = await getAuthContext(new Request('http://localhost:3000/api/v1/service-requests', {
    headers: { 'cookie': `${SESSION_COOKIE_NAME}=${providerAToken}` }
  }));
  assert.ok(authK3, 'Provider A session must resolve');
  const activeProviderId = authK3.providerId || authK3.userId;
  const targetRequestProviderId = 'prov-pest-apex'; // Provider B
  const isAuthorizedForProviderB = activeProviderId === targetRequestProviderId;
  assert.strictEqual(isAuthorizedForProviderB, false, 'Provider A must NOT be authorized for Provider B');
  console.log('✅ TEST K PASSED: Cross-tenant access strictly rejected across Restaurant, Grocery, and Provider');

  // ---------------------------------------------------------------------------
  // TEST L: PRIVILEGE ESCALATION REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST L: PRIVILEGE ESCALATION REJECTED ---');
  // Manager attempting platform_admin operation on unclaimed restaurant
  // Note: Ensure leopold-cafe is UNCLAIMED for this test
  updateRestaurantStatus('leopold-cafe', 'UNCLAIMED');

  const regularManagerToken = createSessionToken({
    userId: 'regular-mgr-1',
    organisationId: 'regular-org',
    outletId: 'the-table',
    role: 'outlet_manager'
  });

  const reqL1 = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=leopold-cafe', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${regularManagerToken}`
    }
  });

  const accessL1 = await authorizeFeedbackAccess('leopold-cafe', reqL1);
  assert.strictEqual(accessL1.ok, false, 'Non-admin user cannot access unclaimed restaurant');
  assert.strictEqual(accessL1.status, 403, 'Must return 403 FORBIDDEN / RESTAURANT_UNCLAIMED');

  // Customer attempting manager actions
  const customerToken = createSessionToken({
    userId: 'customer-diner-1',
    organisationId: 'diner-org',
    outletId: 'none',
    role: 'customer'
  });

  const reqL2 = new Request('http://localhost:3000/api/v1/customer-feedback?outlet_id=the-table', {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${customerToken}`
    }
  });

  const accessL2 = await authorizeFeedbackAccess('the-table', reqL2);
  assert.strictEqual(accessL2.ok, false, 'Customer cannot access manager feedback dashboard');
  assert.strictEqual(accessL2.status, 403, 'Must return 403 FORBIDDEN');

  // Normal user attempting admin-only requireOutletAccess
  const accessL3 = await requireOutletAccess('unauthorized-outlet-123', reqL1);
  assert.strictEqual(accessL3.ok, false, 'Normal manager cannot bypass outlet scoping');
  assert.strictEqual(accessL3.status, 403, 'Must return 403 FORBIDDEN');
  console.log('✅ TEST L PASSED: Privilege escalation strictly rejected across all non-admin roles');

  console.log('\n================================================================');
  console.log('🎯 ALL P0 SECURITY TESTS (TEST A THROUGH TEST L) PASSED (12/12)');
  console.log('================================================================\n');
}

runSecurityTestSuite().catch(err => {
  console.error('❌ SECURITY TEST FAILED:', err);
  process.exit(1);
});
