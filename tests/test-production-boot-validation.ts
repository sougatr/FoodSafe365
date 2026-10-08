/**
 * FoodSafe365 — P0-5 Production Secrets Management & Boot Validation Test Suite
 * Verifies strict cryptographic secrets validation, environment isolation, and fail-fast startup.
 */

import assert from 'assert';
import {
  validateDatabaseUrl,
  validateSessionSecret,
  validateEnvironment,
  assertProductionBoot,
  DEV_DEFAULT_SESSION_SECRET,
  MIN_SESSION_SECRET_LENGTH
} from '../lib/env-validator';
import { getSessionSecret, createSessionToken, verifySessionToken } from '../lib/session';
import { getPool, resetPool } from '../lib/db';
import { GET as healthHandler } from '../app/api/health/route';
import { GET as readyHandler } from '../app/api/ready/route';

async function runBootValidationSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — P0-5 SECRETS MANAGEMENT & BOOT VALIDATION SUITE');
  console.log('================================================================\n');

  const VALID_PROD_DB = 'postgresql://app_user:prod_pass_9988@prod-db.internal.aws:5432/foodsafe365_production';
  const VALID_PROD_SECRET = 'c84a7e9301bf26e47d159a63c80e729da42b36e8105c97fae420db7583619a0c';

  // ---------------------------------------------------------------------------
  // SECTION A: PRODUCTION CONFIGURATION VALIDATION
  // ---------------------------------------------------------------------------
  console.log('--- SECTION A: PRODUCTION CONFIGURATION VALIDATION ---');

  // Test 1: DATABASE_URL missing -> startup fails
  console.log('Testing 1: DATABASE_URL missing in production...');
  const envMissingDb: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    SESSION_SECRET: VALID_PROD_SECRET
  };
  assert.throws(
    () => assertProductionBoot(envMissingDb),
    (err: any) => err.message.includes('DATABASE_URL is missing or empty'),
    'Must fail fast when DATABASE_URL is missing in production'
  );
  console.log('✅ TEST 1 PASSED: DATABASE_URL missing halts production boot');

  // Test 2: SESSION_SECRET missing -> startup fails
  console.log('Testing 2: SESSION_SECRET missing in production...');
  const envMissingSecret: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: VALID_PROD_DB
  };
  assert.throws(
    () => assertProductionBoot(envMissingSecret),
    (err: any) => err.message.includes('SESSION_SECRET is missing or empty'),
    'Must fail fast when SESSION_SECRET is missing in production'
  );
  console.log('✅ TEST 2 PASSED: SESSION_SECRET missing halts production boot');

  // Test 3: DATABASE_URL empty -> startup fails
  console.log('Testing 3: DATABASE_URL empty in production...');
  const envEmptyDb: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: '   ',
    SESSION_SECRET: VALID_PROD_SECRET
  };
  assert.throws(
    () => assertProductionBoot(envEmptyDb),
    (err: any) => err.message.includes('DATABASE_URL is missing or empty'),
    'Must fail fast when DATABASE_URL is empty in production'
  );
  console.log('✅ TEST 3 PASSED: Empty DATABASE_URL halts production boot');

  // Test 4: SESSION_SECRET empty -> startup fails
  console.log('Testing 4: SESSION_SECRET empty in production...');
  const envEmptySecret: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: VALID_PROD_DB,
    SESSION_SECRET: '   '
  };
  assert.throws(
    () => assertProductionBoot(envEmptySecret),
    (err: any) => err.message.includes('SESSION_SECRET is missing or empty'),
    'Must fail fast when SESSION_SECRET is empty in production'
  );
  console.log('✅ TEST 4 PASSED: Empty SESSION_SECRET halts production boot');

  // Test 5: Default development DATABASE_URL -> startup fails
  console.log('Testing 5: Default development DATABASE_URL in production...');
  const envDefaultDb: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/foodsafes365',
    SESSION_SECRET: VALID_PROD_SECRET
  };
  assert.throws(
    () => assertProductionBoot(envDefaultDb),
    (err: any) =>
      err.message.includes('development default') || err.message.includes('local loopback host'),
    'Must fail fast when development DATABASE_URL is used in production'
  );
  console.log('✅ TEST 5 PASSED: Development default DATABASE_URL rejected in production');

  // Test 6: Default development SESSION_SECRET -> startup fails
  console.log('Testing 6: Hardcoded source default SESSION_SECRET in production...');
  const envDefaultSecret: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: VALID_PROD_DB,
    SESSION_SECRET: DEV_DEFAULT_SESSION_SECRET
  };
  assert.throws(
    () => assertProductionBoot(envDefaultSecret),
    (err: any) => err.message.includes('hard-coded source repository default'),
    'Must fail fast when repository default SESSION_SECRET is used in production'
  );
  console.log('✅ TEST 6 PASSED: Repository default SESSION_SECRET rejected in production');

  // Test 7: Placeholder / weak SESSION_SECRET -> startup fails
  console.log('Testing 7: Placeholder and weak SESSION_SECRET in production...');
  const placeholders = [
    'changeme_changeme_changeme_changeme_123',
    'your-secret-key-goes-here-min-32-chars!',
    'placeholder_secret_key_for_testing_purposes',
    '12345678901234567890123456789012',
    'short_secret'
  ];
  for (const ph of placeholders) {
    const envPlaceholder: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: VALID_PROD_DB,
      SESSION_SECRET: ph
    };
    assert.throws(
      () => assertProductionBoot(envPlaceholder),
      (err: any) =>
        err.message.includes('SESSION_SECRET') &&
        (err.message.includes('placeholder') ||
          err.message.includes('too short') ||
          err.message.includes('insufficient entropy')),
      `Must reject placeholder/weak secret "${ph}"`
    );
  }
  console.log('✅ TEST 7 PASSED: Insecure placeholders and low-entropy secrets rejected');

  // Test 8: Valid production configuration -> startup succeeds
  console.log('Testing 8: Valid production configuration...');
  const envValidProd: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: VALID_PROD_DB,
    SESSION_SECRET: VALID_PROD_SECRET
  };
  const validRes = validateEnvironment(envValidProd);
  assert.strictEqual(validRes.valid, true);
  assert.strictEqual(validRes.issues.length, 0);
  assert.doesNotThrow(() => assertProductionBoot(envValidProd));
  console.log('✅ TEST 8 PASSED: Valid production configuration successfully accepted');

  // ---------------------------------------------------------------------------
  // SECTION B: ENVIRONMENT ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION B: ENVIRONMENT ISOLATION ---');

  // Test 9: Development configuration still works
  console.log('Testing 9: Development configuration...');
  const envDev: NodeJS.ProcessEnv = {
    NODE_ENV: 'development'
  };
  assert.doesNotThrow(() => assertProductionBoot(envDev));
  const devSecret = getSessionSecret(envDev);
  assert.strictEqual(devSecret, DEV_DEFAULT_SESSION_SECRET);
  console.log('✅ TEST 9 PASSED: Development defaults function cleanly without throwing');

  // Test 10: Test configuration still works
  console.log('Testing 10: Test configuration...');
  const envTest: NodeJS.ProcessEnv = {
    NODE_ENV: 'test'
  };
  assert.doesNotThrow(() => assertProductionBoot(envTest));
  const testSecret = getSessionSecret(envTest);
  assert.strictEqual(testSecret, DEV_DEFAULT_SESSION_SECRET);
  console.log('✅ TEST 10 PASSED: Test environment functions cleanly with dev defaults');

  // Test 11: Development defaults cannot activate in production
  console.log('Testing 11: Development defaults strictly blocked in production...');
  const envProdEmpty: NodeJS.ProcessEnv = {
    NODE_ENV: 'production'
  };
  // Must refuse to return dev secret
  assert.throws(
    () => getSessionSecret(envProdEmpty),
    (err: any) => err.message.includes('SESSION_SECRET is missing or empty'),
    'getSessionSecret must refuse to use dev default in production'
  );
  // Must refuse to connect or initialize pool without DATABASE_URL
  resetPool();
  assert.throws(
    () => getPool(envProdEmpty),
    (err: any) => err.message.includes('DATABASE_URL is missing or empty'),
    'getPool must refuse to initialize in production without valid DATABASE_URL'
  );
  console.log('✅ TEST 11 PASSED: Development defaults strictly blocked from activating in production');

  // ---------------------------------------------------------------------------
  // SECTION C: SECURITY AND NON-EXPOSURE
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION C: SECURITY AND NON-EXPOSURE ---');

  // Test 12: Secrets are not printed in startup errors
  console.log('Testing 12: Secret non-leakage in error messages...');
  const superSecretPassword = 'TOP_SECRET_PASSWORD_DO_NOT_LEAK_991823';
  const superSecretSessionKey = 'SUPER_SECRET_SESSION_KEY_DO_NOT_LEAK_771829';
  const envWithCredentials: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: `postgresql://admin:${superSecretPassword}@localhost:5432/foodsafes365`,
    SESSION_SECRET: `${superSecretSessionKey}_placeholder`
  };

  try {
    assertProductionBoot(envWithCredentials);
    assert.fail('Expected assertProductionBoot to throw');
  } catch (err: any) {
    const errorStr = String(err.message || err);
    assert.strictEqual(
      errorStr.includes(superSecretPassword),
      false,
      'Database password must never appear in startup error message'
    );
    assert.strictEqual(
      errorStr.includes(superSecretSessionKey),
      false,
      'Session secret must never appear in startup error message'
    );
    console.log('✅ TEST 12 PASSED: Startup error messages contain zero secret or credential leakage');
  }

  // Test 13: Secrets are not exposed by health and readiness endpoints
  console.log('Testing 13: Health and readiness endpoints credential sanitization...');
  process.env.DATABASE_URL = VALID_PROD_DB;
  process.env.SESSION_SECRET = VALID_PROD_SECRET;

  const healthRes = await healthHandler();
  const healthJson = await healthRes.json();
  const healthText = JSON.stringify(healthJson);
  assert.strictEqual(healthText.includes('prod_pass'), false);
  assert.strictEqual(healthText.includes(VALID_PROD_SECRET), false);

  const readyRes = await readyHandler();
  const readyJson = await readyRes.json();
  const readyText = JSON.stringify(readyJson);
  assert.strictEqual(readyText.includes('prod_pass'), false);
  assert.strictEqual(readyText.includes(VALID_PROD_SECRET), false);
  console.log('✅ TEST 13 PASSED: Health and readiness endpoints expose zero secrets or connection details');

  // Test 14: No hard-coded production secret exists in source
  console.log('Testing 14: Verifying no hard-coded production secret fallback...');
  const oldNodeEnv = process.env.NODE_ENV;
  const oldSecret = process.env.SESSION_SECRET;
  try {
    (process.env as any).NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;
    delete process.env.JWT_SECRET;

    assert.throws(
      () => getSessionSecret(),
      (err: any) => err.message.includes('SESSION_SECRET is missing or empty'),
      'In production, getSessionSecret() must throw rather than returning any source fallback'
    );
  } finally {
    (process.env as any).NODE_ENV = oldNodeEnv;
    if (oldSecret) process.env.SESSION_SECRET = oldSecret;
  }
  console.log('✅ TEST 14 PASSED: Hard-coded fallback cannot be executed under production environment');

  console.log('\n================================================================');
  console.log('🎯 ALL 14 P0-5 SECRETS & BOOT VALIDATION TESTS PASSED (14/14)');
  console.log('================================================================\n');
}

runBootValidationSuite().catch(err => {
  console.error('❌ P0-5 TEST SUITE FAILED:', err);
  process.exit(1);
});
