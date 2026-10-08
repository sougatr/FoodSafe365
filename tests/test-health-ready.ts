import assert from 'assert';
import { GET as healthHandler } from '../app/api/health/route';
import { GET as readyHandler } from '../app/api/ready/route';
import { setPoolForTesting, resetPool } from '../lib/db';

async function runHealthReadyTests() {
  console.log('================================================================');
  console.log('FOODSAFE365 — HEALTH & READINESS PROBES VERIFICATION');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST A: /api/health LIVENESS PROBE
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: /api/health LIVENESS PROBE ---');
  const healthRes = await healthHandler();
  assert.strictEqual(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.status, 'healthy');
  assert.ok(typeof healthJson.uptime === 'number');
  assert.ok(healthJson.timestamp);
  console.log('✅ TEST A PASSED: /api/health returned 200 OK with process uptime');

  // ---------------------------------------------------------------------------
  // TEST B: /api/ready CONNECTED TO DATABASE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: /api/ready DATABASE CONNECTED ---');
  process.env.DATABASE_URL = 'postgresql://foodsafe_app:secret@localhost:5432/foodsafe365_prod';
  const healthyMockPool = {
    query: async (text: string) => {
      assert.ok(text.includes('SELECT 1'));
      return { rows: [{ ping: 1 }] };
    }
  };
  setPoolForTesting(healthyMockPool);

  const readyRes = await readyHandler();
  assert.strictEqual(readyRes.status, 200);
  const readyJson = await readyRes.json();
  assert.strictEqual(readyJson.status, 'ready');
  assert.strictEqual(readyJson.database, 'connected');
  console.log('✅ TEST B PASSED: /api/ready returned 200 OK when database responds');

  // ---------------------------------------------------------------------------
  // TEST C: /api/ready DATABASE UNREACHABLE -> 503 SERVICE UNAVAILABLE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C: /api/ready DATABASE UNREACHABLE ---');
  const failingMockPool = {
    query: async () => {
      throw new Error('Connection refused: server at 10.0.0.1:5432 unreachable');
    }
  };
  setPoolForTesting(failingMockPool);

  const unreadyRes = await readyHandler();
  assert.strictEqual(unreadyRes.status, 503, 'Must return 503 when database fails');
  const unreadyJson = await unreadyRes.json();
  assert.strictEqual(unreadyJson.status, 'not_ready');
  assert.strictEqual(unreadyJson.database, 'unreachable');

  // Verify zero sensitive info leakage
  const stringified = JSON.stringify(unreadyJson);
  assert.ok(!stringified.includes('10.0.0.1'), 'Must not leak host or IP');
  assert.ok(!stringified.includes('Connection refused'), 'Must not leak SQL driver error');
  console.log('✅ TEST C PASSED: /api/ready returned sanitized 503 Service Unavailable');

  // ---------------------------------------------------------------------------
  // TEST D: /api/ready PRODUCTION WITHOUT DATABASE_URL -> 503
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST D: /api/ready PRODUCTION MISSING DATABASE_URL ---');
  const originalEnv = process.env.NODE_ENV;
  const originalDb = process.env.DATABASE_URL;
  (process.env as any).NODE_ENV = 'production';
  delete process.env.DATABASE_URL;
  resetPool();

  const missingDbRes = await readyHandler();
  assert.strictEqual(missingDbRes.status, 503);
  const missingDbJson = await missingDbRes.json();
  assert.strictEqual(missingDbJson.status, 'not_ready');
  assert.strictEqual(missingDbJson.database, 'unconfigured');

  // Restore env
  (process.env as any).NODE_ENV = originalEnv;
  if (originalDb) process.env.DATABASE_URL = originalDb;
  console.log('✅ TEST D PASSED: Production missing DATABASE_URL returns 503 not_ready');

  console.log('\n================================================================');
  console.log('🎯 ALL HEALTH & READINESS PROBE TESTS PASSED (4/4)');
  console.log('================================================================\n');
}

runHealthReadyTests().catch(err => {
  console.error('❌ HEALTH/READY TEST FAILED:', err);
  process.exit(1);
});
