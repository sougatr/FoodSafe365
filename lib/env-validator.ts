/**
 * FoodSafe365 — Production Secrets & Boot Environment Validator
 * P0-5 Hardening: Enforces strict cryptographic secrets validation and fail-fast startup behavior.
 */

import { getEffectiveDatabaseUrl } from './db-config';

export const MIN_SESSION_SECRET_LENGTH = 32;

// Hard-coded development/test fallback secret — strictly forbidden in production
export const DEV_DEFAULT_SESSION_SECRET =
  'foodsafe365_secure_session_signing_secret_key_minimum_32_bytes_2026!';

// Development default database URLs — strictly forbidden in production
const INSECURE_DEV_DB_URLS = new Set([
  'postgresql://postgres:postgres@localhost:5432/foodsafes365',
  'postgresql://postgres:postgres@localhost:5432/foodsafe365',
  'postgresql://postgres:postgres@localhost:5432/foodsafe365_dev',
  'postgresql://postgres:postgres@localhost:5432/dev',
  'postgresql://postgres:postgres@localhost:5432/test',
  'postgresql://localhost:5432/foodsafe_dev'
]);

// Known placeholder patterns and weak sequences
const INSECURE_SECRET_SUBSTRINGS = [
  'changeme',
  'placeholder',
  'your-secret',
  'your_secret',
  'yoursecret',
  'secret-key',
  'default-secret',
  'development-secret',
  'test-secret',
  'example-secret',
  'sample-secret',
  'admin-secret',
  'mysecret',
  'password123',
  '12345678901234567890123456789012',
  'abcdefghijklmnopqrstuvwxyz123456'
];

export interface ValidationIssue {
  variable: 'DATABASE_URL' | 'SESSION_SECRET' | 'STORAGE_CONFIG';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  isProduction: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates DATABASE_URL for production readiness.
 * Sanitizes errors so no passwords, host credentials, or secret values are echoed.
 */
export function validateDatabaseUrl(dbUrl?: string, isProduction = false): ValidationIssue | null {
  if (!dbUrl || dbUrl.trim() === '') {
    if (isProduction) {
      return {
        variable: 'DATABASE_URL',
        message: 'Production configuration error: DATABASE_URL is missing or empty.'
      };
    }
    return null;
  }

  const trimmed = dbUrl.trim();

  // 1. Protocol check
  if (!trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgres://')) {
    if (isProduction) {
      return {
        variable: 'DATABASE_URL',
        message: 'Production configuration error: DATABASE_URL must use a valid postgresql:// or postgres:// scheme.'
      };
    }
    return null;
  }

  // 2. Reject known development defaults in production
  if (isProduction) {
    if (INSECURE_DEV_DB_URLS.has(trimmed)) {
      return {
        variable: 'DATABASE_URL',
        message: 'Production configuration error: DATABASE_URL is configured with a development default value.'
      };
    }

    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0') {
        return {
          variable: 'DATABASE_URL',
          message: 'Production configuration error: DATABASE_URL cannot point to a local loopback host (localhost/127.0.0.1) in production.'
        };
      }
      if (host.includes('example.com') || host.includes('dummy') || host.includes('placeholder')) {
        return {
          variable: 'DATABASE_URL',
          message: 'Production configuration error: DATABASE_URL host appears to be an example or placeholder.'
        };
      }
      if (!parsed.pathname || parsed.pathname === '/') {
        return {
          variable: 'DATABASE_URL',
          message: 'Production configuration error: DATABASE_URL is missing database name.'
        };
      }
    } catch {
      return {
        variable: 'DATABASE_URL',
        message: 'Production configuration error: DATABASE_URL is a malformed connection URI.'
      };
    }
  }

  return null;
}

/**
 * Validates SESSION_SECRET for cryptographic security and production suitability.
 * NEVER echoes the candidate secret value into returned messages.
 */
export function validateSessionSecret(secret?: string, isProduction = false): ValidationIssue | null {
  if (!secret || secret.trim() === '') {
    if (isProduction) {
      return {
        variable: 'SESSION_SECRET',
        message: 'Production configuration error: SESSION_SECRET is missing or empty.'
      };
    }
    return null;
  }

  const trimmed = secret.trim();

  if (isProduction) {
    // 1. Check if matching the hard-coded source fallback
    if (trimmed === DEV_DEFAULT_SESSION_SECRET) {
      return {
        variable: 'SESSION_SECRET',
        message: 'Production configuration error: SESSION_SECRET is using the hard-coded source repository default.'
      };
    }

    // 2. Minimum length check: 32 bytes (256 bits) for HMAC-SHA256
    if (trimmed.length < MIN_SESSION_SECRET_LENGTH) {
      return {
        variable: 'SESSION_SECRET',
        message: `Production configuration error: SESSION_SECRET is too short (${trimmed.length} chars). Minimum ${MIN_SESSION_SECRET_LENGTH} characters required for cryptographic security.`
      };
    }

    // 3. Known placeholder detection
    const lower = trimmed.toLowerCase();
    for (const placeholder of INSECURE_SECRET_SUBSTRINGS) {
      if (lower.includes(placeholder)) {
        return {
          variable: 'SESSION_SECRET',
          message: 'Production configuration error: SESSION_SECRET contains a known insecure placeholder or default pattern.'
        };
      }
    }

    // 4. Low entropy / single repeating character check (e.g. 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    const uniqueChars = new Set(trimmed);
    if (uniqueChars.size < 8) {
      return {
        variable: 'SESSION_SECRET',
        message: 'Production configuration error: SESSION_SECRET has insufficient entropy (too few unique characters).'
      };
    }
  }

  return null;
}

/**
 * Validates S3-compatible storage configuration for production.
 * Ensures required S3 credentials, bucket, and endpoint are present, and forbids memory driver in production.
 * NEVER echoes credentials, secrets, or keys into returned messages.
 */
export function validateStorageConfig(customEnv?: NodeJS.ProcessEnv, isProduction = false): ValidationIssue | null {
  const env = customEnv || process.env;
  if (!isProduction) return null;

  const rawDriver = (env.STORAGE_DRIVER || '').trim().toLowerCase();
  if (rawDriver === 'memory') {
    return {
      variable: 'STORAGE_CONFIG',
      message: 'Production configuration error: STORAGE_DRIVER=memory is forbidden in production. S3-compatible storage is required.'
    };
  }

  const missing: string[] = [];
  if (!env.STORAGE_BUCKET || env.STORAGE_BUCKET.trim() === '') missing.push('STORAGE_BUCKET');
  if (!env.STORAGE_ACCESS_KEY_ID || env.STORAGE_ACCESS_KEY_ID.trim() === '') missing.push('STORAGE_ACCESS_KEY_ID');
  if (!env.STORAGE_SECRET_ACCESS_KEY || env.STORAGE_SECRET_ACCESS_KEY.trim() === '') missing.push('STORAGE_SECRET_ACCESS_KEY');
  if (!env.STORAGE_ENDPOINT || env.STORAGE_ENDPOINT.trim() === '') missing.push('STORAGE_ENDPOINT');

  if (missing.length > 0) {
    return {
      variable: 'STORAGE_CONFIG',
      message: `Production configuration error: Required S3 storage configuration missing (${missing.join(', ')}).`
    };
  }

  return null;
}

export interface ValidateEnvironmentOptions {
  requireStorage?: boolean;
}

/**
 * Validates the full server environment.
 */
export function validateEnvironment(
  customEnv?: NodeJS.ProcessEnv,
  options?: ValidateEnvironmentOptions
): ValidationResult {
  const env = customEnv || process.env;
  const isProduction = env.NODE_ENV === 'production';
  const issues: ValidationIssue[] = [];

  let activeDbUrl: string | undefined;
  try {
    activeDbUrl = getEffectiveDatabaseUrl({ customEnv: env });
  } catch (err: any) {
    issues.push({
      variable: 'DATABASE_URL',
      message: err?.message || 'Database configuration error: Failed to resolve database URL.'
    });
  }

  if (activeDbUrl !== undefined) {
    const dbIssue = validateDatabaseUrl(activeDbUrl, isProduction);
    if (dbIssue) issues.push(dbIssue);
  }

  const secretIssue = validateSessionSecret(env.SESSION_SECRET || env.JWT_SECRET, isProduction);
  if (secretIssue) issues.push(secretIssue);

  const shouldCheckStorage =
    options?.requireStorage ||
    Boolean(env.STORAGE_DRIVER || env.STORAGE_BUCKET || env.STORAGE_ENDPOINT || env.REQUIRE_STORAGE_VALIDATION === 'true');
  if (shouldCheckStorage) {
    const storageIssue = validateStorageConfig(env, isProduction);
    if (storageIssue) issues.push(storageIssue);
  }

  return {
    valid: issues.length === 0,
    isProduction,
    issues
  };
}

/**
 * Asserts production environment validity.
 * If in production or Vercel preview and any validation fails, FAILS FAST by throwing an Error immediately.
 * In development or test, returns silently if defaults are acceptable.
 */
export function assertProductionBoot(
  customEnv?: NodeJS.ProcessEnv,
  options?: ValidateEnvironmentOptions
): void {
  const env = customEnv || process.env;
  const res = validateEnvironment(env, options);
  if (!res.valid && (res.isProduction || env.VERCEL_ENV === 'preview')) {
    const errorMessages = res.issues.map(i => i.message).join('\n');
    const combinedError = new Error(
      `[FATAL BOOT CONFIGURATION ERROR]\n${errorMessages}\nApplication startup halted to prevent insecure operation.`
    );
    throw combinedError;
  }
}


