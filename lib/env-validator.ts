/**
 * FoodSafe365 — Production Secrets & Boot Environment Validator
 * P0-5 Hardening: Enforces strict cryptographic secrets validation and fail-fast startup behavior.
 */

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
  variable: 'DATABASE_URL' | 'SESSION_SECRET';
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
 * Validates the full server environment.
 */
export function validateEnvironment(customEnv?: NodeJS.ProcessEnv): ValidationResult {
  const env = customEnv || process.env;
  const isProduction = env.NODE_ENV === 'production';
  const issues: ValidationIssue[] = [];

  const dbIssue = validateDatabaseUrl(env.DATABASE_URL, isProduction);
  if (dbIssue) issues.push(dbIssue);

  const secretIssue = validateSessionSecret(env.SESSION_SECRET || env.JWT_SECRET, isProduction);
  if (secretIssue) issues.push(secretIssue);

  return {
    valid: issues.length === 0,
    isProduction,
    issues
  };
}

/**
 * Asserts production environment validity.
 * If in production and any validation fails, FAILS FAST by throwing an Error immediately.
 * In development or test, returns silently if defaults are acceptable.
 */
export function assertProductionBoot(customEnv?: NodeJS.ProcessEnv): void {
  const res = validateEnvironment(customEnv);
  if (!res.valid && res.isProduction) {
    const errorMessages = res.issues.map(i => i.message).join('\n');
    const combinedError = new Error(
      `[FATAL BOOT CONFIGURATION ERROR]\n${errorMessages}\nApplication startup halted to prevent insecure operation.`
    );
    throw combinedError;
  }
}
