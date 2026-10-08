#!/usr/bin/env node
/**
 * FoodSafe365 Database Migration CLI
 * Usage:
 *   npx ts-node scripts/migrate.ts up
 *   npx ts-node scripts/migrate.ts status
 */
import { runMigrations, getMigrationStatus, getCurrentSchemaVersion } from '../lib/migrations';
import { getPool, sanitizeDbUrl } from '../lib/db';

async function main() {
  const command = process.argv[2] || 'up';
  console.log('================================================================');
  console.log('FOODSAFE365 — POSTGRESQL DATABASE MIGRATION RUNNER');
  console.log('================================================================');

  const pool = getPool();
  if (!pool) {
    console.error('❌ Error: DATABASE_URL is not configured.');
    process.exit(1);
  }

  console.log(`Database Target: ${sanitizeDbUrl(process.env.DATABASE_URL)}`);
  console.log(`Command: ${command.toUpperCase()}\n`);

  if (command === 'status') {
    const status = await getMigrationStatus();
    console.log('Current Schema Migrations Status:');
    console.log('----------------------------------------------------------------');
    for (const item of status) {
      const mark = item.applied ? '✅ APPLIED' : '⏳ PENDING';
      const date = item.appliedAt ? ` (at ${item.appliedAt})` : '';
      console.log(`${mark} | ${item.name}${date}`);
    }
    const currentVer = await getCurrentSchemaVersion();
    console.log('----------------------------------------------------------------');
    console.log(`Active Schema Version: ${currentVer || 'None (Fresh DB)'}`);
    process.exit(0);
  }

  if (command === 'up') {
    console.log('Executing pending database migrations...');
    const result = await runMigrations();
    console.log('----------------------------------------------------------------');
    console.log(`Applied migrations (${result.applied.length}):`);
    for (const v of result.applied) {
      console.log(`  + ${v}`);
    }
    console.log(`Already applied migrations (${result.alreadyApplied.length})`);
    console.log(`Current Schema Version: ${result.currentVersion}`);
    console.log('================================================================');
    console.log('✅ Migrations completed successfully.');
    process.exit(0);
  }

  console.error(`Unknown command: ${command}. Use "up" or "status".`);
  process.exit(1);
}

main().catch(err => {
  console.error('\n❌ Migration execution failed:', err.message || err);
  process.exit(1);
});
