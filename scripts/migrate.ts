#!/usr/bin/env node
/**
 * FoodSafe365 Database Migration CLI
 * Usage:
 *   npx ts-node scripts/migrate.ts up --target=preview
 *   npx ts-node scripts/migrate.ts status --target=preview
 *   npx ts-node scripts/migrate.ts up --target=production
 *   npx ts-node scripts/migrate.ts status --target=production
 */
import { runMigrations, getMigrationStatus, getCurrentSchemaVersion } from '../lib/migrations';
import { createDedicatedPool } from '../lib/db';
import { getMigrationDatabaseUrl, sanitizeDbUrl, getSanitizedTargetIdentity } from '../lib/db-config';
import type pg from 'pg';
import fs from 'fs';
import path from 'path';

// Load .env.preview.local securely if present
const previewEnvPath = path.resolve(process.cwd(), '.env.preview.local');
if (fs.existsSync(previewEnvPath)) {
  try {
    const lines = fs.readFileSync(previewEnvPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // ignore
  }
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  let command: string | undefined;
  let cliTarget: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--target=')) {
      cliTarget = arg.split('=')[1];
    } else if (arg === '--target' && i + 1 < args.length) {
      cliTarget = args[++i];
    } else if (!command && !arg.startsWith('--')) {
      command = arg;
    }
  }

  command = command || 'up';

  console.log('================================================================');
  console.log('FOODSAFE365 — POSTGRESQL DATABASE MIGRATION RUNNER');
  console.log('================================================================');

  if (command !== 'up' && command !== 'status') {
    console.error(`❌ Error: Unknown command "${command}". Allowed commands are "up" or "status".`);
    return 1;
  }

  // 1. Resolve and validate target database URL before creating any pool or connection
  let targetDbUrl: string;
  try {
    targetDbUrl = getMigrationDatabaseUrl({ target: cliTarget });
  } catch (err: any) {
    console.error(`❌ Target Validation Error: ${err.message || err}`);
    return 1;
  }

  const identity = getSanitizedTargetIdentity(targetDbUrl);
  console.log(`Configured Target: host=${identity.host}, db=${identity.database}`);
  console.log(`Sanitized URL:     ${sanitizeDbUrl(targetDbUrl)}`);
  console.log(`Command:           ${command.toUpperCase()}\n`);

  // 2. Create dedicated migration pool targeting resolved connection string
  let pool: pg.Pool | null = null;
  try {
    pool = createDedicatedPool(targetDbUrl);

    if (command === 'status') {
      const status = await getMigrationStatus(undefined, pool);
      console.log('Current Schema Migrations Status:');
      console.log('----------------------------------------------------------------');
      for (const item of status) {
        const mark = item.applied ? '✅ APPLIED' : '⏳ PENDING';
        const date = item.appliedAt ? ` (at ${item.appliedAt})` : '';
        console.log(`${mark} | ${item.name}${date}`);
      }
      const currentVer = await getCurrentSchemaVersion(pool);
      console.log('----------------------------------------------------------------');
      console.log(`Active Schema Version: ${currentVer || 'None (Fresh DB)'}`);
      return 0;
    }

    if (command === 'up') {
      console.log('Executing pending database migrations...');
      const result = await runMigrations({ pool });
      console.log('----------------------------------------------------------------');
      console.log(`Applied migrations (${result.applied.length}):`);
      for (const v of result.applied) {
        console.log(`  + ${v}`);
      }
      console.log(`Already applied migrations (${result.alreadyApplied.length})`);
      console.log(`Current Schema Version: ${result.currentVersion}`);
      console.log('================================================================');
      console.log('✅ Migrations completed successfully.');
      return 0;
    }

    return 0;
  } finally {
    if (pool && typeof pool.end === 'function') {
      try {
        await pool.end();
      } catch (poolErr) {
        console.error('Warning: Error closing migration pool:', poolErr);
      }
    }
  }
}

main()
  .then(exitCode => {
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  })
  .catch(err => {
    console.error('\n❌ Migration execution failed:', err.message || err);
    process.exit(1);
  });

