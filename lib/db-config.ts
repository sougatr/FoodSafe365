/**
 * FoodSafe365 — Database Configuration & Environment Resolver
 * Pure utility module with zero dependencies. No circular imports.
 */

export interface DatabaseUrlOptions {
  customEnv?: NodeJS.ProcessEnv;
}

export interface MigrationTargetOptions {
  target?: 'preview' | 'production' | string;
  customEnv?: NodeJS.ProcessEnv;
}

/**
 * Sanitizes connection URLs for safe logging, masking passwords with asterisks.
 */
export function sanitizeDbUrl(url?: string): string {
  if (!url) return 'UNCONFIGURED';
  try {
    return url.replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/, '$1***$3');
  } catch {
    return 'REDACTED_URL';
  }
}

/**
 * Extracts host and database name for safe operator confirmation without credentials.
 */
export function getSanitizedTargetIdentity(url?: string): { host: string; database: string } {
  if (!url) return { host: 'unknown', database: 'unknown' };
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'unknown',
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'unknown'
    };
  } catch {
    return { host: 'unparseable', database: 'unparseable' };
  }
}

/**
 * Resolves the application runtime database connection URL.
 * - In Vercel Preview (VERCEL_ENV === 'preview'):
 *   Strictly mandates PREVIEW_DB_DATABASE_URL.
 *   Fails closed immediately if missing. Never falls back to DATABASE_URL.
 * - In Production & other environments:
 *   Returns DATABASE_URL unchanged.
 * Does NOT mutate process.env or any global state.
 */
export function getEffectiveDatabaseUrl(options?: DatabaseUrlOptions): string | undefined {
  const env = options?.customEnv || process.env;
  const isPreview = env.VERCEL_ENV === 'preview';

  if (isPreview) {
    const previewUrl = env.PREVIEW_DB_DATABASE_URL?.trim();
    if (!previewUrl) {
      throw new Error(
        'PREVIEW_CONFIGURATION_ERROR: PREVIEW_DB_DATABASE_URL is required on Vercel Preview deployments. Refusing fallback to shared DATABASE_URL.'
      );
    }
    return previewUrl;
  }

  return env.DATABASE_URL?.trim();
}

/**
 * Checks whether database is configured for the active environment.
 * Handles Vercel Preview (PREVIEW_DB_DATABASE_URL) and Production/Development (DATABASE_URL).
 */
export function isDatabaseConfigured(customEnv?: NodeJS.ProcessEnv): boolean {
  try {
    const url = getEffectiveDatabaseUrl({ customEnv });
    return Boolean(url && url.length > 0);
  } catch {
    return false;
  }
}

export type DatabaseConfigAssertion =
  | { ok: true; url: string }
  | { ok: false; code: 'CONFIGURATION_ERROR'; error: string };

/**
 * Validates database configuration according to environment:
 * - In Vercel Preview (VERCEL_ENV === 'preview'): Requires PREVIEW_DB_DATABASE_URL. Fails closed if missing.
 * - In Production (NODE_ENV === 'production' && VERCEL_ENV !== 'preview'): Requires DATABASE_URL. Fails closed if missing.
 * - In Development/Test: Returns ok: false if no database configured, allowing demo fallbacks.
 */
export function assertDatabaseConfigured(customEnv?: NodeJS.ProcessEnv): DatabaseConfigAssertion {
  const env = customEnv || process.env;
  const isPreview = env.VERCEL_ENV === 'preview';
  const isProd = env.NODE_ENV === 'production' && !isPreview;

  try {
    const url = getEffectiveDatabaseUrl({ customEnv: env });
    if (!url) {
      if (isProd) {
        return {
          ok: false,
          code: 'CONFIGURATION_ERROR',
          error: 'Production configuration error: DATABASE_URL is required.'
        };
      }
      return {
        ok: false,
        code: 'CONFIGURATION_ERROR',
        error: 'Database is not configured.'
      };
    }
    return { ok: true, url };
  } catch (err: any) {
    return {
      ok: false,
      code: 'CONFIGURATION_ERROR',
      error: err.message || 'Database configuration error'
    };
  }
}

/**
 * Resolves and validates the database target URL for schema migrations.
 * - Enforces explicit target specification (target === 'preview' or target === 'production').
 * - Validates and rejects conflicting target definitions between CLI argument and TARGET_DB.
 * - Does NOT infer Preview target from ambient VERCEL_ENV alone.
 * - For Preview:
 *   1. Requires an explicitly configured direct unpooled connection URL
 *      (PREVIEW_DB_MIGRATION_URL, PREVIEW_DB_DIRECT_URL, or an already unpooled PREVIEW_DB_DATABASE_URL).
 *   2. Rejects pooled endpoints (-pooler.) with a clear error; does NOT rewrite hostnames.
 *   3. Rejects collision if the candidate URL equals the production DATABASE_URL.
 * - For Production:
 *   Resolves DATABASE_MIGRATION_URL, DIRECT_URL, or DATABASE_URL.
 */
export function getMigrationDatabaseUrl(options?: MigrationTargetOptions): string {
  const env = options?.customEnv || process.env;
  const cliTarget = options?.target?.trim();
  const envTarget = env.TARGET_DB?.trim();

  // Validate for conflicts between explicit target parameter and TARGET_DB environment variable
  if (cliTarget && envTarget && cliTarget.toLowerCase() !== envTarget.toLowerCase()) {
    throw new Error(
      `CONFLICTING_MIGRATION_TARGETS: Target specified in option/CLI flag ("${cliTarget}") conflicts with TARGET_DB environment variable ("${envTarget}").`
    );
  }

  const rawTarget = cliTarget || envTarget;

  if (!rawTarget) {
    throw new Error(
      'MIGRATION_TARGET_REQUIRED: Explicit target is required for migrations. Specify --target=preview or --target=production (or set TARGET_DB). Do not rely on ambient environment variables.'
    );
  }

  const target = rawTarget.toLowerCase();

  if (target !== 'preview' && target !== 'production') {
    throw new Error(
      `INVALID_MIGRATION_TARGET: Unknown target "${rawTarget}". Allowed targets are "preview" or "production".`
    );
  }

  if (target === 'preview') {
    const directConfiguredUrl =
      env.PREVIEW_DB_MIGRATION_URL?.trim() ||
      env.PREVIEW_DB_DIRECT_URL?.trim() ||
      env.PREVIEW_DB_DATABASE_URL_UNPOOLED?.trim() ||
      env.PREVIEW_DB_POSTGRES_URL_NON_POOLING?.trim();

    let candidateUrl = directConfiguredUrl;

    if (!candidateUrl) {
      const fallbackUrl = env.PREVIEW_DB_DATABASE_URL?.trim();
      if (!fallbackUrl) {
        throw new Error(
          'PREVIEW_MIGRATION_CONFIG_ERROR: PREVIEW_DB_MIGRATION_URL (or PREVIEW_DB_DIRECT_URL / PREVIEW_DB_DATABASE_URL_UNPOOLED / PREVIEW_DB_DATABASE_URL) is required for Preview migrations.'
        );
      }

      if (fallbackUrl.includes('-pooler.')) {
        throw new Error(
          'DIRECT_MIGRATION_URL_REQUIRED: Configured Preview URL points to a pooled connection (-pooler.). Schema migrations require a direct, unpooled connection. Please configure PREVIEW_DB_MIGRATION_URL, PREVIEW_DB_DIRECT_URL, or PREVIEW_DB_DATABASE_URL_UNPOOLED with Neon direct connection.'
        );
      }

      candidateUrl = fallbackUrl;
    } else if (candidateUrl.includes('-pooler.')) {
      throw new Error(
        'DIRECT_MIGRATION_URL_REQUIRED: Configured direct migration URL contains a pooled host (-pooler.). Direct unpooled connection is required for DDL migrations.'
      );
    }

    const prodUrl = env.DATABASE_URL?.trim() || env.PROD_DATABASE_URL?.trim();
    if (prodUrl && candidateUrl === prodUrl) {
      throw new Error(
        'PREVIEW_MIGRATION_TARGET_COLLISION: Preview migration URL matches Production database URL. Execution halted to prevent accidental production DDL.'
      );
    }

    return candidateUrl;
  }

  // target === 'production'
  const prodMigrationUrl =
    env.DATABASE_MIGRATION_URL?.trim() ||
    env.DIRECT_URL?.trim() ||
    env.DATABASE_URL?.trim();

  if (!prodMigrationUrl) {
    throw new Error(
      'PRODUCTION_MIGRATION_CONFIG_ERROR: DATABASE_URL (or DATABASE_MIGRATION_URL) is required for production migrations.'
    );
  }

  return prodMigrationUrl;
}
