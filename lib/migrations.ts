import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPool, sanitizeDbUrl } from './db';
import type { PoolClient } from 'pg';

export interface MigrationFile {
  version: string;
  name: string;
  filepath: string;
  content: string;
  checksum: string;
}

export interface MigrationRecord {
  version: string;
  name: string;
  checksum: string;
  applied_at: string;
  execution_time_ms: number;
}

export interface MigrationStatusItem {
  version: string;
  name: string;
  checksum: string;
  applied: boolean;
  appliedAt?: string;
  executionTimeMs?: number;
  checksumMatches?: boolean;
}

export interface MigrationResult {
  success: boolean;
  applied: string[];
  alreadyApplied: string[];
  currentVersion: string | null;
  error?: string;
}

const DEFAULT_MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations');

/**
 * Calculates SHA-256 hash of migration file content for drift detection.
 */
export function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

/**
 * Discovers and parses all .sql migration files in deterministic alphabetical order.
 */
export function getMigrationFiles(dir: string = DEFAULT_MIGRATIONS_DIR): MigrationFile[] {
  if (!fs.existsSync(dir)) {
    throw new Error(`MIGRATIONS_DIRECTORY_NOT_FOUND: Directory "${dir}" does not exist.`);
  }

  const entries = fs.readdirSync(dir);
  const sqlFiles = entries
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return sqlFiles.map(name => {
    const filepath = path.join(dir, name);
    const content = fs.readFileSync(filepath, 'utf8');
    const version = name.replace(/\.sql$/, '');
    const checksum = calculateChecksum(content);
    return {
      version,
      name,
      filepath,
      content,
      checksum
    };
  });
}

/**
 * Ensures the schema_migrations ledger table exists.
 */
export async function ensureMigrationTable(client: any): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now(),
      execution_time_ms integer NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);
  `);
}

/**
 * Retrieves the current maximum applied schema version.
 */
export async function getCurrentSchemaVersion(clientOrPool?: any): Promise<string | null> {
  const p = clientOrPool || getPool();
  if (!p) throw new Error('DATABASE_NOT_CONFIGURED');

  try {
    const res = await p.query(`
      SELECT version FROM schema_migrations 
      ORDER BY applied_at DESC, version DESC 
      LIMIT 1
    `);
    return res.rows[0]?.version || null;
  } catch (err: any) {
    // Table may not exist yet in fresh database
    if (err.code === '42P01' || /does not exist/i.test(err.message)) {
      return null;
    }
    throw err;
  }
}

/**
 * Returns comprehensive migration status comparing disk files against applied ledger.
 */
export async function getMigrationStatus(
  dir: string = DEFAULT_MIGRATIONS_DIR,
  clientOrPool?: any
): Promise<MigrationStatusItem[]> {
  const p = clientOrPool || getPool();
  if (!p) throw new Error('DATABASE_NOT_CONFIGURED');

  await ensureMigrationTable(p);

  const appliedRowsRes = await p.query(`SELECT * FROM schema_migrations ORDER BY version ASC`);
  const appliedMap = new Map<string, MigrationRecord>();
  for (const row of appliedRowsRes.rows) {
    appliedMap.set(row.version, row);
  }

  const files = getMigrationFiles(dir);
  return files.map(file => {
    const record = appliedMap.get(file.version);
    if (record) {
      return {
        version: file.version,
        name: file.name,
        checksum: file.checksum,
        applied: true,
        appliedAt: record.applied_at,
        executionTimeMs: record.execution_time_ms,
        checksumMatches: record.checksum === file.checksum
      };
    }
    return {
      version: file.version,
      name: file.name,
      checksum: file.checksum,
      applied: false
    };
  });
}

/**
 * Executes pending database migrations sequentially inside transactions.
 */
export async function runMigrations(options: {
  dir?: string;
  dryRun?: boolean;
  targetVersion?: string;
  pool?: any;
} = {}): Promise<MigrationResult> {
  const dir = options.dir || DEFAULT_MIGRATIONS_DIR;
  const p = options.pool || getPool();
  if (!p) {
    throw new Error('DATABASE_NOT_CONFIGURED: Cannot execute migrations without configured PostgreSQL pool.');
  }

  const files = getMigrationFiles(dir);
  if (files.length === 0) {
    return {
      success: true,
      applied: [],
      alreadyApplied: [],
      currentVersion: null
    };
  }

  // Acquire dedicated client for transactional migration execution
  const client = typeof p.connect === 'function' ? await p.connect() : p;
  const shouldRelease = typeof client.release === 'function';

  const applied: string[] = [];
  const alreadyApplied: string[] = [];

  try {
    await ensureMigrationTable(client);

    const existingRows = await client.query(`SELECT version, checksum FROM schema_migrations`);
    const appliedVersions = new Map<string, string>();
    for (const r of existingRows.rows) {
      appliedVersions.set(r.version, r.checksum);
    }

    for (const file of files) {
      if (appliedVersions.has(file.version)) {
        const storedChecksum = appliedVersions.get(file.version);
        if (storedChecksum && storedChecksum !== file.checksum) {
          console.warn(`[MIGRATION_DRIFT_WARNING] Migration ${file.version} checksum changed on disk since application.`);
        }
        alreadyApplied.push(file.version);
        continue;
      }

      if (options.dryRun) {
        applied.push(file.version);
        continue;
      }

      // Execute migration inside atomic transaction
      const startTime = Date.now();
      await client.query('BEGIN');
      try {
        await client.query(file.content);
        const durationMs = Date.now() - startTime;

        await client.query(
          `INSERT INTO schema_migrations (version, name, checksum, applied_at, execution_time_ms)
           VALUES ($1, $2, $3, now(), $4)`,
          [file.version, file.name, file.checksum, durationMs]
        );

        await client.query('COMMIT');
        applied.push(file.version);
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error(`[MIGRATION_FAILED] Migration ${file.version} failed:`, err?.message || err);
        throw new Error(`MIGRATION_FAILED: Error applying ${file.name}: ${err?.message || String(err)}`);
      }

      if (options.targetVersion && file.version === options.targetVersion) {
        break;
      }
    }

    const currentVersion = await getCurrentSchemaVersion(client);
    return {
      success: true,
      applied,
      alreadyApplied,
      currentVersion
    };
  } finally {
    if (shouldRelease) {
      client.release();
    }
  }
}
