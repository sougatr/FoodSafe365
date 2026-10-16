import assert from 'assert';
import {
  getEffectiveDatabaseUrl,
  getMigrationDatabaseUrl,
  sanitizeDbUrl,
  getSanitizedTargetIdentity,
  isDatabaseConfigured,
  assertDatabaseConfigured
} from '../lib/db-config';
import { validateEnvironment, assertProductionBoot } from '../lib/env-validator';

async function runPreviewDbWiringTests() {
  console.log('================================================================');
  console.log('FOODSAFE365 — PREVIEW DATABASE WIRING & ISOLATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void) {
    try {
      console.log(`--- RUNNING: ${name} ---`);
      fn();
      console.log(`✅ PASSED: ${name}\n`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAILED: ${name}`);
      console.error(err.message || err);
      console.error('');
      failed++;
    }
  }

  // 1. Production runtime preserves DATABASE_URL
  runTest('1. Production runtime resolves DATABASE_URL without modification', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      DATABASE_URL: 'postgresql://prod_user:secret_prod_pw@ep-prod-123.eu-central-1.aws.neon.tech/foodsafe_prod?sslmode=require',
      PREVIEW_DB_DATABASE_URL: 'postgresql://preview_user:secret_preview_pw@ep-preview-456.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require'
    };

    const url = getEffectiveDatabaseUrl({ customEnv: env });
    assert.strictEqual(url, env.DATABASE_URL, 'Production runtime must use DATABASE_URL');
  });

  // 2. Preview runtime routes strictly to PREVIEW_DB_DATABASE_URL
  runTest('2. Vercel Preview runtime strictly uses PREVIEW_DB_DATABASE_URL', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      DATABASE_URL: 'postgresql://prod_user:secret_prod_pw@ep-prod-123.eu-central-1.aws.neon.tech/foodsafe_prod?sslmode=require',
      PREVIEW_DB_DATABASE_URL: 'postgresql://preview_user:secret_preview_pw@ep-preview-456-pooler.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require'
    };

    const url = getEffectiveDatabaseUrl({ customEnv: env });
    assert.strictEqual(url, env.PREVIEW_DB_DATABASE_URL, 'Preview runtime must select PREVIEW_DB_DATABASE_URL');
  });

  // 3. Fail closed on missing PREVIEW_DB_DATABASE_URL in Preview
  runTest('3. Preview runtime fails closed when PREVIEW_DB_DATABASE_URL is missing', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      DATABASE_URL: 'postgresql://prod_user:secret_prod_pw@ep-prod-123.eu-central-1.aws.neon.tech/foodsafe_prod?sslmode=require'
    };

    assert.throws(
      () => getEffectiveDatabaseUrl({ customEnv: env }),
      (err: any) => {
        assert.ok(err.message.includes('PREVIEW_CONFIGURATION_ERROR'), 'Must throw PREVIEW_CONFIGURATION_ERROR');
        assert.ok(err.message.includes('Refusing fallback to shared DATABASE_URL'), 'Must explicitly refuse fallback');
        return true;
      }
    );
  });

  // 4. Migration requires explicit target; rejects missing target
  runTest('4. Migration resolver rejects execution when explicit target is omitted', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      VERCEL_ENV: 'preview',
      DATABASE_URL: 'postgresql://prod_user:secret@ep-prod.neon.tech/prod',
      PREVIEW_DB_DATABASE_URL: 'postgresql://preview_user:secret@ep-preview.neon.tech/preview'
    };

    assert.throws(
      () => getMigrationDatabaseUrl({ customEnv: env }),
      /MIGRATION_TARGET_REQUIRED/,
      'Must require explicit target and not infer Preview target from ambient VERCEL_ENV'
    );
  });

  // 5. Migration rejects conflicting CLI target and TARGET_DB
  runTest('5. Migration resolver rejects conflicting CLI argument and TARGET_DB variable', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      TARGET_DB: 'production'
    };

    assert.throws(
      () => getMigrationDatabaseUrl({ target: 'preview', customEnv: env }),
      /CONFLICTING_MIGRATION_TARGETS/,
      'Must reject conflicting targets before attempting connection'
    );
  });

  // 6. Preview migration enforces direct unpooled connection (rejects -pooler.)
  runTest('6. Preview migration rejects pooled endpoints and requires direct URL', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      PREVIEW_DB_DATABASE_URL: 'postgresql://preview_user:secret@ep-preview-pooler.eu-central-1.aws.neon.tech/preview'
    };

    assert.throws(
      () => getMigrationDatabaseUrl({ target: 'preview', customEnv: env }),
      /DIRECT_MIGRATION_URL_REQUIRED/,
      'Must reject pooled connection string for DDL migrations'
    );

    // Now test with configured PREVIEW_DB_MIGRATION_URL (direct)
    const envWithDirect: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      PREVIEW_DB_DATABASE_URL: 'postgresql://preview_user:secret@ep-preview-pooler.eu-central-1.aws.neon.tech/preview',
      PREVIEW_DB_MIGRATION_URL: 'postgresql://preview_user:secret@ep-preview.eu-central-1.aws.neon.tech/preview'
    };

    const migrationUrl = getMigrationDatabaseUrl({ target: 'preview', customEnv: envWithDirect });
    assert.strictEqual(migrationUrl, envWithDirect.PREVIEW_DB_MIGRATION_URL, 'Must resolve direct migration URL');

    // Test with configured PREVIEW_DB_DATABASE_URL_UNPOOLED (direct)
    const envWithUnpooled: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      PREVIEW_DB_DATABASE_URL: 'postgresql://preview_user:secret@ep-preview-pooler.eu-central-1.aws.neon.tech/preview',
      PREVIEW_DB_DATABASE_URL_UNPOOLED: 'postgresql://preview_user:secret@ep-preview.eu-central-1.aws.neon.tech/preview'
    };

    const unpooledMigrationUrl = getMigrationDatabaseUrl({ target: 'preview', customEnv: envWithUnpooled });
    assert.strictEqual(unpooledMigrationUrl, envWithUnpooled.PREVIEW_DB_DATABASE_URL_UNPOOLED, 'Must resolve PREVIEW_DB_DATABASE_URL_UNPOOLED');
  });

  // 7. Preview migration halts on production URL collision
  runTest('7. Preview migration halts if resolved target collides with Production URL', () => {
    const sharedUrl = 'postgresql://user:secret@ep-shared.neon.tech/db';
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      DATABASE_URL: sharedUrl,
      PREVIEW_DB_DIRECT_URL: sharedUrl
    };

    assert.throws(
      () => getMigrationDatabaseUrl({ target: 'preview', customEnv: env }),
      /PREVIEW_MIGRATION_TARGET_COLLISION/,
      'Must halt if Preview target collides with Production URL'
    );
  });

  // 8. Credentials masking in logs
  runTest('8. Sanitization functions mask credentials safely', () => {
    const rawUrl = 'postgresql://foodsafe_admin:VerySecretPass123!@ep-demo.neon.tech:5432/foodsafe_db?sslmode=require';
    const sanitized = sanitizeDbUrl(rawUrl);

    assert.ok(!sanitized.includes('VerySecretPass123!'), 'Must not leak password');
    assert.ok(sanitized.includes('***'), 'Must mask password with asterisks');
    assert.ok(sanitized.includes('foodsafe_admin'), 'Keeps username for context');
    assert.ok(sanitized.includes('ep-demo.neon.tech'), 'Keeps host for identification');

    const identity = getSanitizedTargetIdentity(rawUrl);
    assert.strictEqual(identity.host, 'ep-demo.neon.tech');
    assert.strictEqual(identity.database, 'foodsafe_db');
  });

  // 9. Environment validation and boot fail-fast on missing Preview DB
  runTest('9. validateEnvironment & assertProductionBoot fail fast on Preview misconfiguration', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      SESSION_SECRET: 'a_very_secure_random_session_secret_32_bytes_long_12345!',
      DATABASE_URL: 'postgresql://user:pass@ep-prod.neon.tech/prod'
      // Missing PREVIEW_DB_DATABASE_URL
    };

    const res = validateEnvironment(env);
    assert.strictEqual(res.valid, false, 'Environment validation must fail in preview without PREVIEW_DB_DATABASE_URL');
    assert.ok(
      res.issues.some(i => i.variable === 'DATABASE_URL' && i.message.includes('PREVIEW_CONFIGURATION_ERROR')),
      'Must record PREVIEW_CONFIGURATION_ERROR issue'
    );

    assert.throws(
      () => assertProductionBoot(env),
      /PREVIEW_CONFIGURATION_ERROR/,
      'assertProductionBoot must fail fast'
    );
  });

  // 10. Preview succeeds with PREVIEW_DB_DATABASE_URL and no DATABASE_URL
  runTest('10. Preview succeeds with PREVIEW_DB_DATABASE_URL and no DATABASE_URL', () => {
    const previewDbUrl = 'postgresql://preview_user:secret_preview_pw@ep-preview-456.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require';
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      PREVIEW_DB_DATABASE_URL: previewDbUrl
      // DATABASE_URL intentionally undefined
    };

    const isConfigured = isDatabaseConfigured(env);
    assert.strictEqual(isConfigured, true, 'isDatabaseConfigured must return true when PREVIEW_DB_DATABASE_URL is present in Preview');

    const result = assertDatabaseConfigured(env);
    assert.strictEqual(result.ok, true, 'assertDatabaseConfigured must succeed in Preview');
    if (result.ok) {
      assert.strictEqual(result.url, previewDbUrl, 'Resolved URL must match PREVIEW_DB_DATABASE_URL');
    }
  });

  // 11. Preview fails closed when its database URL is missing
  runTest('11. Preview fails closed when its database URL is missing', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview'
      // No PREVIEW_DB_DATABASE_URL, no DATABASE_URL
    };

    const isConfigured = isDatabaseConfigured(env);
    assert.strictEqual(isConfigured, false, 'isDatabaseConfigured must return false when PREVIEW_DB_DATABASE_URL is missing in Preview');

    const result = assertDatabaseConfigured(env);
    assert.strictEqual(result.ok, false, 'assertDatabaseConfigured must fail closed when PREVIEW_DB_DATABASE_URL is missing in Preview');
    if (!result.ok) {
      assert.strictEqual(result.code, 'CONFIGURATION_ERROR');
      assert.ok(
        result.error.includes('PREVIEW_CONFIGURATION_ERROR'),
        'Error message must indicate PREVIEW_CONFIGURATION_ERROR'
      );
    }
  });

  // 12. Non-Preview production fails closed when DATABASE_URL is missing
  runTest('12. Non-Preview production fails closed when DATABASE_URL is missing', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'production'
      // Missing DATABASE_URL
    };

    const isConfigured = isDatabaseConfigured(env);
    assert.strictEqual(isConfigured, false, 'isDatabaseConfigured must return false when DATABASE_URL is missing in production');

    const result = assertDatabaseConfigured(env);
    assert.strictEqual(result.ok, false, 'assertDatabaseConfigured must fail closed when DATABASE_URL is missing in production');
    if (!result.ok) {
      assert.strictEqual(result.code, 'CONFIGURATION_ERROR');
      assert.strictEqual(
        result.error,
        'Production configuration error: DATABASE_URL is required.',
        'Must return production configuration error message'
      );
    }
  });

  // 13. Onboarding and provider registration use Preview DB configuration without error
  runTest('13. Onboarding and provider registration validation check uses Preview DB without DATABASE_URL error', () => {
    const previewDbUrl = 'postgresql://preview_user:secret_preview_pw@ep-preview-456.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require';
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      PREVIEW_DB_DATABASE_URL: previewDbUrl
      // DATABASE_URL is intentionally absent
    };

    // Simulate the pre-flight check executed by /api/v1/organisations, /api/v1/providers/register, /api/v1/grocery/onboarding:
    const dbConfig = assertDatabaseConfigured(env);

    // It must NOT fail with 'Production configuration error: DATABASE_URL is required.'
    assert.strictEqual(dbConfig.ok, true, 'Pre-flight check must succeed in Preview with PREVIEW_DB_DATABASE_URL');
    if (dbConfig.ok) {
      assert.strictEqual(dbConfig.url, previewDbUrl, 'Pre-flight check must resolve to the preview database URL');
    }
  });

  // 14. Service provider registration query includes explicit $9::text[] cast
  runTest('14. Service provider registration query contains verified $9::text[] array cast for PostgreSQL', () => {
    const fs = require('fs');
    const path = require('path');
    const spStoreSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'service-provider-store.ts'), 'utf8');

    assert.ok(
      spStoreSrc.includes('$9::text[]'),
      'registerServiceProvider INSERT query must explicitly cast $9 to ::text[] for PostgreSQL compatibility'
    );

    assert.ok(
      spStoreSrc.includes('$18::jsonb'),
      'createServiceRequest INSERT query must explicitly cast $18 to ::jsonb for PostgreSQL compatibility'
    );
  });

  // 15. Grocery onboarding query includes explicit $11::jsonb cast
  runTest('15. Grocery onboarding query contains verified $11::jsonb JSONB cast for PostgreSQL', () => {
    const fs = require('fs');
    const path = require('path');
    const groceryStoreSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'grocery-store.ts'), 'utf8');

    assert.ok(
      groceryStoreSrc.includes('$11::jsonb'),
      'saveGroceryOutletAsync INSERT query must explicitly cast $11 to ::jsonb for PostgreSQL compatibility'
    );

    assert.ok(
      groceryStoreSrc.includes('$18::jsonb'),
      'recordReceivingItemAsync INSERT query must explicitly cast $18 to ::jsonb for PostgreSQL compatibility'
    );

    assert.ok(
      groceryStoreSrc.includes('$13::jsonb'),
      'recordReceivingItemAsync inventory batch INSERT query must explicitly cast $13 to ::jsonb for PostgreSQL compatibility'
    );
  });

  // 16. Service requests and auth login endpoints validate Preview DB configuration without DATABASE_URL
  runTest('16. Service requests and auth login endpoints validate Preview DB configuration without DATABASE_URL', () => {
    const previewDbUrl = 'postgresql://preview_user:secret_preview_pw@ep-preview-456.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require';
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      PREVIEW_DB_DATABASE_URL: previewDbUrl
      // DATABASE_URL is intentionally absent
    };

    const dbConfig = assertDatabaseConfigured(env);
    assert.strictEqual(dbConfig.ok, true, 'assertDatabaseConfigured must return true for Preview');

    // Confirm that fail-closed behavior is strictly maintained when PREVIEW_DB_DATABASE_URL is missing
    const missingEnv: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview'
    };
    const missingDbConfig = assertDatabaseConfigured(missingEnv);
    assert.strictEqual(missingDbConfig.ok, false, 'assertDatabaseConfigured must return false when Preview DB is missing');
    if (!missingDbConfig.ok) {
      assert.ok(missingDbConfig.error.includes('PREVIEW_CONFIGURATION_ERROR'), 'Must contain PREVIEW_CONFIGURATION_ERROR');
    }
  });

  console.log('================================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPreviewDbWiringTests().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
