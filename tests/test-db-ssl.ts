import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { getDatabaseSslConfig, sanitizeDbUrl } from '../lib/db';

async function runSslTestSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — POSTGRESQL SSL CONFIGURATION & VERIFICATION SUITE');
  console.log('================================================================\n');

  // Sample dummy PEM certificate for testing CA parsing
  const mockCaPem = `-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAL0p...MOCK...CA...CERTIFICATE...\n-----END CERTIFICATE-----`;

  // ---------------------------------------------------------------------------
  // TEST A: VALID PRODUCTION CA -> SSL CONFIG INCLUDES REJECT_UNAUTHORIZED TRUE & CA
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: VALID PRODUCTION CA CONFIGURATION ---');
  const envWithCa: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://foodsafe_app:secret@db.foodsafe365.internal:5432/foodsafe365',
    DATABASE_CA_CERT: mockCaPem
  };

  const sslConfigA = getDatabaseSslConfig(envWithCa);
  assert.ok(sslConfigA && typeof sslConfigA === 'object', 'SSL configuration object must be returned');
  assert.strictEqual((sslConfigA as any).rejectUnauthorized, true, 'Must enforce rejectUnauthorized: true');
  assert.strictEqual((sslConfigA as any).ca, mockCaPem, 'Must attach provider CA certificate');
  console.log('✅ TEST A PASSED: Valid CA certificate correctly configured with rejectUnauthorized: true');

  // ---------------------------------------------------------------------------
  // TEST B: INSECURE PRODUCTION CONFIGURATION ATTEMPT -> FAILS HARD
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: INSECURE PRODUCTION CONFIGURATION BLOCKED ---');
  const insecureEnvs = [
    {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://foodsafe_app:secret@db.internal:5432/foodsafe365?sslmode=disable'
    },
    {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://foodsafe_app:secret@db.internal:5432/foodsafe365?rejectUnauthorized=false'
    },
    {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://foodsafe_app:secret@db.internal:5432/foodsafe365?sslmode=allow'
    }
  ];

  for (const env of insecureEnvs) {
    assert.throws(
      () => getDatabaseSslConfig(env as any),
      /DATABASE_SSL_CONFIGURATION_ERROR/,
      'Production must reject insecure sslmode=disable or bypass parameters'
    );
  }
  console.log('✅ TEST B PASSED: Insecure sslmode=disable / bypass attempts rejected with error');

  // ---------------------------------------------------------------------------
  // TEST C: MISSING CA WHEN REQUIRED -> FAILS SAFELY
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C: MISSING CA CERTIFICATE WHEN REQUIRED ---');
  const envMissingCa: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://foodsafe_app:secret@db.foodsafe365.internal:5432/foodsafe365',
    DATABASE_SSL_REQUIRE_CA: 'true'
    // Neither DATABASE_CA_CERT nor PGSSLROOTCERT provided
  };

  assert.throws(
    () => getDatabaseSslConfig(envMissingCa),
    /Custom CA certificate required/,
    'Must fail safely when DATABASE_SSL_REQUIRE_CA=true but CA is missing'
  );
  console.log('✅ TEST C PASSED: Missing mandatory CA certificate halts connection safely');

  // ---------------------------------------------------------------------------
  // TEST D: ZERO PRODUCTION CONFIGURATION SILENTLY DISABLES CERTIFICATE VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST D: VERIFY NO SILENT TLS BYPASS IN PRODUCTION ---');
  // In production with standard managed database without custom CA:
  const envStandardProd: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://foodsafe_app:secret@aws-rds.internal:5432/foodsafe365'
  };

  const sslConfigD = getDatabaseSslConfig(envStandardProd);
  assert.ok(sslConfigD && typeof sslConfigD === 'object');
  assert.strictEqual((sslConfigD as any).rejectUnauthorized, true, 'rejectUnauthorized must NEVER be false in production');
  assert.notStrictEqual((sslConfigD as any).rejectUnauthorized, false, 'rejectUnauthorized cannot be false');
  console.log('✅ TEST D PASSED: Production configuration strictly mandates rejectUnauthorized: true without bypass');

  // ---------------------------------------------------------------------------
  // TEST E: LOCAL DEVELOPMENT ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST E: LOCAL DEVELOPMENT ISOLATION ---');
  const envLocalDev: NodeJS.ProcessEnv = {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://localhost:5432/foodsafe_dev'
  };

  const sslConfigE = getDatabaseSslConfig(envLocalDev);
  assert.strictEqual(sslConfigE, undefined, 'Local development without TLS should return undefined ssl config');

  // But if explicit SSL is requested in development, rejectUnauthorized is still true:
  const envDevExplicitSsl: NodeJS.ProcessEnv = {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://db.remote-staging:5432/foodsafe',
    DATABASE_SSL_REQUIRED: 'true'
  };
  const sslConfigDevSsl = getDatabaseSslConfig(envDevExplicitSsl);
  assert.strictEqual((sslConfigDevSsl as any)?.rejectUnauthorized, true);
  console.log('✅ TEST E PASSED: Local dev isolated; remote/explicit environments enforce verified TLS');

  // ---------------------------------------------------------------------------
  // TEST F: CREDENTIAL SANITIZATION IN LOGS
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST F: DATABASE URL CREDENTIAL SANITIZATION ---');
  const sensitiveUrl = 'postgresql://admin_user:super_secret_password_123@db.prod.internal:5432/foodsafe365_prod';
  const sanitized = sanitizeDbUrl(sensitiveUrl);
  assert.ok(!sanitized.includes('super_secret_password_123'), 'Sanitized URL must NEVER leak password');
  assert.ok(sanitized.includes('admin_user:***@db.prod.internal'), 'Must mask password with asterisks');
  console.log('✅ TEST F PASSED: Connection string password masking verified');

  console.log('\n================================================================');
  console.log('🎯 ALL SSL TESTS (TEST A THROUGH TEST F) PASSED (6/6)');
  console.log('================================================================\n');
}

runSslTestSuite().catch(err => {
  console.error('❌ SSL TEST SUITE FAILED:', err);
  process.exit(1);
});
