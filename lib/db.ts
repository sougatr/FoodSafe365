import type { PoolClient, QueryResultRow } from 'pg';
import pg from 'pg';
import fs from 'fs';

let pool: any = null;
export type { PoolClient, QueryResultRow };

export function setPoolForTesting(mockPool: any) {
  pool = mockPool;
}

export function resetPool() {
  if (pool && typeof pool.end === 'function') {
    try {
      pool.end();
    } catch {
      // ignore
    }
  }
  pool = null;
}

/**
 * Sanitize database connection string for safe logging and error reporting.
 * Strips out user credentials (password/secret) to prevent accidental credential leakage.
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
 * Resolves SSL configuration for PostgreSQL connections.
 * Strict rules:
 * - Production connections MUST NEVER disable SSL or bypass certificate verification (rejectUnauthorized: false is forbidden).
 * - If custom CA is provided via DATABASE_CA_CERT or PGSSLROOTCERT, it is validated with rejectUnauthorized: true.
 * - If DATABASE_SSL_REQUIRE_CA is set and no CA is provided, connection configuration fails safely.
 * - In production without custom CA, standard trusted root CAs are used with rejectUnauthorized: true.
 * - In local development (localhost / 127.0.0.1) when SSL is not required, TLS is omitted cleanly.
 */
export function getDatabaseSslConfig(customEnv?: NodeJS.ProcessEnv): pg.PoolConfig['ssl'] {
  const env = customEnv || process.env;
  const isProd = env.NODE_ENV === 'production';
  const dbUrl = env.DATABASE_URL || '';
  const requireCa = env.DATABASE_SSL_REQUIRE_CA === 'true';
  const sslRequired = env.DATABASE_SSL_REQUIRED === 'true';

  // 1. Guard against insecure overrides in production
  if (isProd) {
    if (dbUrl.includes('sslmode=disable') || dbUrl.includes('sslmode=allow') || dbUrl.includes('sslmode=prefer') || dbUrl.includes('rejectUnauthorized=false')) {
      throw new Error(`DATABASE_SSL_CONFIGURATION_ERROR: Insecure SSL mode detected in DATABASE_URL. Production requires verified TLS (rejectUnauthorized: true).`);
    }
  }

  // 2. Resolve CA certificate if provided via environment or filesystem
  let caCert: string | undefined;
  if (env.DATABASE_CA_CERT) {
    const raw = env.DATABASE_CA_CERT.trim();
    if (raw.startsWith('-----BEGIN CERTIFICATE-----')) {
      caCert = raw;
    } else if (raw.startsWith('/') || raw.startsWith('.')) {
      if (fs.existsSync(raw)) {
        caCert = fs.readFileSync(raw, 'utf8');
      }
    } else {
      // Possible base64 encoded PEM
      try {
        const decoded = Buffer.from(raw, 'base64').toString('utf8');
        if (decoded.includes('-----BEGIN CERTIFICATE-----')) {
          caCert = decoded;
        }
      } catch {
        // Not base64
      }
    }
  } else if (env.PGSSLROOTCERT) {
    const certPath = env.PGSSLROOTCERT.trim();
    if (fs.existsSync(certPath)) {
      caCert = fs.readFileSync(certPath, 'utf8');
    } else if (certPath.startsWith('-----BEGIN CERTIFICATE-----')) {
      caCert = certPath;
    }
  }

  // 3. Handle requirement for explicit custom CA
  if ((isProd || sslRequired) && requireCa && !caCert) {
    throw new Error(
      `DATABASE_SSL_CONFIGURATION_ERROR: Custom CA certificate required (DATABASE_SSL_REQUIRE_CA=true) but neither DATABASE_CA_CERT nor PGSSLROOTCERT provided a valid CA certificate.`
    );
  }

  // 4. Determine if environment is local non-production development
  const isLocalDev =
    !isProd &&
    !sslRequired &&
    (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('sslmode=disable') || !dbUrl);

  if (isLocalDev) {
    return undefined;
  }

  // 5. In production or explicit SSL environments:
  // ALWAYS rejectUnauthorized: true. Never bypass certificate validation.
  if (caCert) {
    return {
      rejectUnauthorized: true,
      ca: caCert
    };
  }

  // Public root CA verification (e.g. AWS RDS, Neon, Google Cloud SQL, Supabase with public certs)
  return {
    rejectUnauthorized: true
  };
}

import { validateDatabaseUrl } from './env-validator';

export function getPool(customEnv?: NodeJS.ProcessEnv) {
  if (pool) return pool;
  const env = customEnv || process.env;
  const isProd = env.NODE_ENV === 'production';

  if (isProd) {
    const issue = validateDatabaseUrl(env.DATABASE_URL, true);
    if (issue) {
      throw new Error(issue.message);
    }
  } else if (!env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    const ssl = getDatabaseSslConfig(env);
    pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      ssl
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  if (!p) throw new Error('DATABASE_NOT_CONFIGURED');
  const r = await (p as any).query(text, params);
  return r.rows;
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const p = getPool();
  if (!p) throw new Error('DATABASE_NOT_CONFIGURED');
  const client = await (p as any).connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
