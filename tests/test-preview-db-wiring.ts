import assert from 'assert';
import {
  getEffectiveDatabaseUrl,
  getMigrationDatabaseUrl,
  sanitizeDbUrl,
  getSanitizedTargetIdentity,
  isDatabaseConfigured,
  assertDatabaseConfigured
} from '../lib/db-config';
import { validateEnvironment, assertProductionBoot, validateSessionSecret, DEV_DEFAULT_SESSION_SECRET, MIN_SESSION_SECRET_LENGTH } from '../lib/env-validator';
import { getSessionSecret, createSessionToken, verifySessionToken } from '../lib/session';

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

  // 17. Preview environment fails closed when SESSION_SECRET is missing or empty
  runTest('17. Preview environment fails closed when SESSION_SECRET is missing or empty', () => {
    const previewDbUrl = 'postgresql://preview_user:secret_preview_pw@ep-preview-456.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require';

    // A: SESSION_SECRET is missing entirely
    const envMissingSecret: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      PREVIEW_DB_DATABASE_URL: previewDbUrl
    };

    assert.throws(
      () => getSessionSecret(envMissingSecret),
      (err: any) => err.message.includes('Production configuration error: SESSION_SECRET is missing or empty.'),
      'getSessionSecret must fail fast when SESSION_SECRET is missing in Preview runtime'
    );

    const resMissing = validateEnvironment(envMissingSecret);
    assert.strictEqual(resMissing.valid, false, 'validateEnvironment must fail when SESSION_SECRET is missing in Preview');
    assert.ok(
      resMissing.issues.some(i => i.variable === 'SESSION_SECRET' && i.message.includes('SESSION_SECRET is missing or empty.')),
      'Must record exact missing SESSION_SECRET error issue'
    );

    // B: SESSION_SECRET is empty string
    const envEmptySecret: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      PREVIEW_DB_DATABASE_URL: previewDbUrl,
      SESSION_SECRET: '   '
    };

    assert.throws(
      () => getSessionSecret(envEmptySecret),
      (err: any) => err.message.includes('Production configuration error: SESSION_SECRET is missing or empty.'),
      'getSessionSecret must fail fast when SESSION_SECRET is blank whitespace in Preview runtime'
    );

    const resEmpty = validateEnvironment(envEmptySecret);
    assert.strictEqual(resEmpty.valid, false, 'validateEnvironment must fail when SESSION_SECRET is empty');
  });

  // 18. Preview environment succeeds when valid SESSION_SECRET and PREVIEW_DB_DATABASE_URL are configured
  runTest('18. Preview environment succeeds when valid SESSION_SECRET and PREVIEW_DB_DATABASE_URL are configured', () => {
    const previewDbUrl = 'postgresql://preview_user:secret_preview_pw@ep-preview-456.eu-central-1.aws.neon.tech/foodsafe_preview?sslmode=require';
    const validSecret = 'preview_cryptographic_signing_secret_min_32_characters_long_2026!';
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      PREVIEW_DB_DATABASE_URL: previewDbUrl,
      SESSION_SECRET: validSecret
      // DATABASE_URL is intentionally absent
    };

    const resolvedSecret = getSessionSecret(env);
    assert.strictEqual(resolvedSecret, validSecret, 'getSessionSecret must return the configured secret');

    const envValidation = validateEnvironment(env);
    assert.strictEqual(envValidation.valid, true, 'Environment validation must pass with valid Preview DB and SESSION_SECRET');
    assert.strictEqual(envValidation.issues.length, 0, 'Must have zero issues');

    const dbConfig = assertDatabaseConfigured(env);
    assert.strictEqual(dbConfig.ok, true, 'assertDatabaseConfigured must succeed');
  });

  // 19. Preview environment rejects weak, placeholder, and default development SESSION_SECRET
  runTest('19. Preview environment rejects weak, placeholder, and default development SESSION_SECRET', () => {
    // Hard-coded dev fallback
    assert.throws(
      () => getSessionSecret({ NODE_ENV: 'production', VERCEL_ENV: 'preview', SESSION_SECRET: DEV_DEFAULT_SESSION_SECRET }),
      (err: any) => err.message.includes('SESSION_SECRET is using the hard-coded source repository default.'),
      'Must reject repository default secret'
    );

    // Insecure placeholder
    assert.throws(
      () => getSessionSecret({ NODE_ENV: 'production', VERCEL_ENV: 'preview', SESSION_SECRET: 'my_awesome_changeme_secret_32_chars_long!!' }),
      (err: any) => err.message.includes('SESSION_SECRET contains a known insecure placeholder'),
      'Must reject known placeholder'
    );

    // Too short (< 32 chars)
    assert.throws(
      () => getSessionSecret({ NODE_ENV: 'production', VERCEL_ENV: 'preview', SESSION_SECRET: 'too_short_key' }),
      (err: any) => err.message.includes(`too short (13 chars). Minimum ${MIN_SESSION_SECRET_LENGTH} characters required`),
      'Must reject short secret'
    );

    // Low entropy
    assert.throws(
      () => getSessionSecret({ NODE_ENV: 'production', VERCEL_ENV: 'preview', SESSION_SECRET: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }),
      (err: any) => err.message.includes('SESSION_SECRET has insufficient entropy'),
      'Must reject low-entropy secret'
    );
  });

  // 20. Onboarding and provider registration session issuance reproduces exact Preview error when SESSION_SECRET is missing
  runTest('20. Onboarding and provider registration session issuance reproduces exact Preview error when SESSION_SECRET is missing', () => {
    const savedNodeEnv = process.env.NODE_ENV;
    const savedVercelEnv = process.env.VERCEL_ENV;
    const savedSessionSecret = process.env.SESSION_SECRET;
    const savedJwtSecret = process.env.JWT_SECRET;

    try {
      // Simulate live Preview deployment environment where SESSION_SECRET was not added to Preview
      (process.env as any).NODE_ENV = 'production';
      (process.env as any).VERCEL_ENV = 'preview';
      delete process.env.SESSION_SECRET;
      delete process.env.JWT_SECRET;

      // When grocery onboarding or service provider registration calls createSessionToken:
      assert.throws(
        () => {
          createSessionToken({
            userId: 'test-user-id',
            organisationId: 'test-org-id',
            outletId: 'test-outlet-id',
            role: 'outlet_manager',
            journey: 'grocery'
          });
        },
        (err: any) => {
          return err.message === 'Production configuration error: SESSION_SECRET is missing or empty.';
        },
        'createSessionToken must throw exact Production configuration error: SESSION_SECRET is missing or empty.'
      );

      // Now configure a valid SESSION_SECRET in the simulated environment
      process.env.SESSION_SECRET = 'valid_preview_secret_32_characters_long_entropy_verified!';

      const token = createSessionToken({
        userId: 'test-user-id',
        organisationId: 'test-org-id',
        outletId: 'test-outlet-id',
        role: 'outlet_manager',
        journey: 'grocery'
      });

      assert.ok(typeof token === 'string' && token.includes('.'), 'Must generate a valid dot-separated session token');
      const verified = verifySessionToken(token);
      assert.strictEqual(verified.valid, true, 'Generated token must verify cleanly');
      assert.strictEqual(verified.data?.userId, 'test-user-id');
      assert.strictEqual(verified.data?.journey, 'grocery');
    } finally {
      (process.env as any).NODE_ENV = savedNodeEnv;
      (process.env as any).VERCEL_ENV = savedVercelEnv;
      if (savedSessionSecret !== undefined) process.env.SESSION_SECRET = savedSessionSecret;
      else delete process.env.SESSION_SECRET;
      if (savedJwtSecret !== undefined) process.env.JWT_SECRET = savedJwtSecret;
      else delete process.env.JWT_SECRET;
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
