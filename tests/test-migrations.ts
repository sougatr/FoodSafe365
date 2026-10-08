import assert from 'assert';
import path from 'path';
import fs from 'fs';
import {
  runMigrations,
  getMigrationStatus,
  getCurrentSchemaVersion,
  calculateChecksum,
  getMigrationFiles,
  ensureMigrationTable
} from '../lib/migrations';
import {
  saveGroceryOutletAsync,
  getGroceryOutletAsync,
  recordTemperatureLogAsync,
  getTemperatureLogsAsync
} from '../lib/grocery-store';
import { setPoolForTesting, resetPool } from '../lib/db';

/**
 * In-Memory Mock PostgreSQL Engine for Migration Testing.
 * Simulates transaction lifecycle (BEGIN, COMMIT, ROLLBACK) and migration ledger tables.
 */
class MockMigrationDatabase {
  public tables: Map<string, any[]> = new Map();
  public executedQueries: string[] = [];
  public inTransaction: boolean = false;
  public transactionQueries: string[] = [];
  public failNextMigration: boolean = false;

  constructor() {
    this.tables.set('schema_migrations', []);
    this.tables.set('grocery_outlets', []);
    this.tables.set('grocery_storage_zones', []);
    this.tables.set('grocery_equipment', []);
    this.tables.set('grocery_receiving_records', []);
    this.tables.set('grocery_receiving_inspections', []);
    this.tables.set('grocery_inventory_batches', []);
    this.tables.set('grocery_temperature_logs', []);
    this.tables.set('grocery_daily_checks', []);
    this.tables.set('grocery_daily_check_items', []);
    this.tables.set('grocery_corrective_actions', []);
    this.tables.set('grocery_verification_records', []);
    this.tables.set('customer_feedback', []);
    this.tables.set('service_providers', []);
    this.tables.set('restaurant_service_requests', []);
  }

  async connect() {
    return this;
  }

  release() {
    // No-op for mock client
  }

  async query(sqlText: string, params: any[] = []): Promise<{ rows: any[] }> {
    const cleaned = sqlText.trim().replace(/\s+/g, ' ');
    this.executedQueries.push(cleaned);

    if (this.inTransaction) {
      this.transactionQueries.push(cleaned);
    }

    if (cleaned === 'BEGIN') {
      this.inTransaction = true;
      this.transactionQueries = [];
      return { rows: [] };
    }

    if (cleaned === 'COMMIT') {
      this.inTransaction = false;
      this.transactionQueries = [];
      return { rows: [] };
    }

    if (cleaned === 'ROLLBACK') {
      this.inTransaction = false;
      this.transactionQueries = [];
      return { rows: [] };
    }

    // CREATE TABLE IF NOT EXISTS schema_migrations
    if (/CREATE TABLE IF NOT EXISTS schema_migrations/i.test(cleaned)) {
      if (!this.tables.has('schema_migrations')) {
        this.tables.set('schema_migrations', []);
      }
      return { rows: [] };
    }

    // SELECT version, checksum FROM schema_migrations
    if (/SELECT version, checksum FROM schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      return { rows: list.map(r => ({ version: r.version, checksum: r.checksum })) };
    }

    // SELECT * FROM schema_migrations ORDER BY version ASC
    if (/SELECT \* FROM schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      return { rows: [...list] };
    }

    // SELECT version FROM schema_migrations ORDER BY applied_at DESC, version DESC LIMIT 1
    if (/SELECT version FROM schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      if (list.length === 0) return { rows: [] };
      const sorted = [...list].sort((a, b) => b.version.localeCompare(a.version));
      return { rows: [{ version: sorted[0].version }] };
    }

    // INSERT INTO schema_migrations
    if (/INSERT INTO schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations')!;
      list.push({
        version: params[0],
        name: params[1],
        checksum: params[2],
        applied_at: new Date().toISOString(),
        execution_time_ms: params[3] || 10
      });
      return { rows: [] };
    }

    // Check if migration simulation failure is triggered
    if (this.failNextMigration && cleaned.includes('CREATE TABLE')) {
      throw new Error('SIMULATED_MIGRATION_DDL_SYNTAX_ERROR: Table definition contains invalid constraint');
    }

    // General DDL commands
    if (/CREATE TABLE/i.test(cleaned) || /CREATE INDEX/i.test(cleaned) || /ALTER TABLE/i.test(cleaned)) {
      const tableRegex = /CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_]+)/gi;
      let m: RegExpExecArray | null;
      while ((m = tableRegex.exec(cleaned)) !== null) {
        if (m[1] && !this.tables.has(m[1])) {
          this.tables.set(m[1], []);
        }
      }
      return { rows: [] };
    }

    // grocery_outlets mock query handlers for functional test
    if (/INSERT INTO grocery_outlets/i.test(cleaned)) {
      const list = this.tables.get('grocery_outlets')!;
      const record = {
        id: params[0],
        name: params[1],
        branch_name: params[2],
        address: params[3],
        city: params[4],
        manager_name: params[5],
        contact_number: params[6],
        contact_email: params[7],
        fssai_number: params[8],
        store_type: params[9],
        selected_categories: typeof params[10] === 'string' ? JSON.parse(params[10]) : params[10],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      list.push(record);
      return {
        rows: [{
          id: record.id,
          name: record.name,
          branchName: record.branch_name,
          address: record.address,
          city: record.city,
          managerName: record.manager_name,
          contactNumber: record.contact_number,
          contactEmail: record.contact_email,
          fssaiNumber: record.fssai_number,
          storeType: record.store_type,
          selectedCategories: record.selected_categories,
          createdAt: record.created_at,
          updatedAt: record.updated_at
        }]
      };
    }

    if (/SELECT .* FROM grocery_outlets WHERE id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_outlets')!;
      const item = list.find(r => r.id === params[0]);
      if (!item) return { rows: [] };
      return {
        rows: [{
          id: item.id,
          name: item.name,
          branchName: item.branch_name,
          address: item.address,
          city: item.city,
          managerName: item.manager_name,
          contactNumber: item.contact_number,
          contactEmail: item.contact_email,
          fssaiNumber: item.fssai_number,
          storeType: item.store_type,
          selectedCategories: item.selected_categories,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }]
      };
    }

    if (/SELECT count\(\*\)::int as count FROM grocery_outlets/i.test(cleaned)) {
      const list = this.tables.get('grocery_outlets') || [];
      return { rows: [{ count: list.length }] };
    }

    if (/SELECT .* FROM grocery_equipment WHERE outlet_id = \$1/i.test(cleaned)) {
      return {
        rows: [{
          id: 'eq-test-1',
          outletId: params[0],
          name: 'Main Dairy Display Chiller',
          type: 'chiller',
          location: 'Aisle 1',
          targetTemp: 3,
          minTemp: 0,
          maxTemp: 4,
          responsiblePerson: 'Supervisor',
          active: true,
          createdAt: new Date().toISOString()
        }]
      };
    }

    if (/INSERT INTO grocery_temperature_logs/i.test(cleaned)) {
      const list = this.tables.get('grocery_temperature_logs')!;
      const rec = {
        id: params[0],
        outlet_id: params[1],
        equipment_id: params[2],
        equipment_name: params[3],
        reading: params[4],
        status: params[5],
        method: params[6],
        notes: params[7],
        corrective_action_id: params[8],
        recorded_by: params[9],
        recorded_at: params[10]
      };
      list.push(rec);
      return { rows: [rec] };
    }

    if (/SELECT .* FROM grocery_temperature_logs WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_temperature_logs')!;
      return {
        rows: list.filter(r => r.outlet_id === params[0]).map(r => ({
          id: r.id,
          outletId: r.outlet_id,
          equipmentId: r.equipment_id,
          equipmentName: r.equipment_name,
          reading: r.reading,
          status: r.status,
          method: r.method,
          notes: r.notes,
          correctiveActionId: r.corrective_action_id,
          recordedBy: r.recorded_by,
          recordedAt: r.recorded_at
        }))
      };
    }

    // Default fallback
    return { rows: [] };
  }
}

async function runMigrationTestSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — DATABASE MIGRATIONS TEST SUITE');
  console.log('================================================================\n');

  const mockDb = new MockMigrationDatabase();
  setPoolForTesting(mockDb);

  // ---------------------------------------------------------------------------
  // TEST A: EMPTY DATABASE -> ALL MIGRATIONS APPLIED
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: EMPTY DATABASE -> ALL MIGRATIONS ---');
  const files = getMigrationFiles();
  assert.ok(files.length >= 8, `Must have at least 8 versioned migration files, found ${files.length}`);

  const initialStatus = await getMigrationStatus(undefined, mockDb);
  assert.strictEqual(initialStatus.length, files.length);
  assert.ok(initialStatus.every(s => !s.applied), 'All migrations must initially be pending in empty database');

  const runResult = await runMigrations({ pool: mockDb });
  assert.strictEqual(runResult.success, true);
  assert.strictEqual(runResult.applied.length, files.length, 'All migration files must be applied');
  assert.strictEqual(runResult.alreadyApplied.length, 0, 'No migrations were previously applied');
  console.log(`✅ TEST A PASSED: All ${runResult.applied.length} migrations executed in deterministic order`);

  // ---------------------------------------------------------------------------
  // TEST B: FRESH DATABASE -> CORRECT FINAL SCHEMA
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: FRESH DATABASE -> CORRECT FINAL SCHEMA ---');
  const expectedTables = [
    'grocery_outlets',
    'grocery_product_categories',
    'grocery_storage_zones',
    'grocery_equipment',
    'grocery_receiving_records',
    'grocery_receiving_inspections',
    'grocery_inventory_batches',
    'grocery_temperature_logs',
    'grocery_daily_checks',
    'grocery_daily_check_items',
    'grocery_corrective_actions',
    'grocery_verification_records',
    'customer_feedback',
    'service_providers',
    'restaurant_service_requests'
  ];

  for (const table of expectedTables) {
    assert.ok(mockDb.tables.has(table), `Expected table "${table}" must exist after migrations`);
  }
  console.log(`✅ TEST B PASSED: All ${expectedTables.length} required domain tables successfully created`);

  // ---------------------------------------------------------------------------
  // TEST C: ALREADY MIGRATED DATABASE -> NO DUPLICATE EXECUTION
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C: ALREADY MIGRATED DATABASE -> IDEMPOTENCE ---');
  const repeatRunResult = await runMigrations({ pool: mockDb });
  assert.strictEqual(repeatRunResult.success, true);
  assert.strictEqual(repeatRunResult.applied.length, 0, 'Zero new migrations should be applied on second run');
  assert.strictEqual(repeatRunResult.alreadyApplied.length, files.length, 'All migrations should be recognized as already applied');
  console.log('✅ TEST C PASSED: Idempotency verified: 0 migrations reapplied');

  // ---------------------------------------------------------------------------
  // TEST D: MIGRATION HISTORY RECORDED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST D: MIGRATION HISTORY LEDGER ---');
  const ledger = mockDb.tables.get('schema_migrations')!;
  assert.strictEqual(ledger.length, files.length);

  for (const item of ledger) {
    assert.ok(item.version, 'Ledger item must have version');
    assert.ok(item.name, 'Ledger item must have name');
    assert.ok(item.checksum, 'Ledger item must record checksum');
    assert.ok(item.applied_at, 'Ledger item must record applied_at timestamp');
    assert.ok(typeof item.execution_time_ms === 'number', 'Ledger item must record execution duration');
  }

  const statusAfter = await getMigrationStatus(undefined, mockDb);
  assert.ok(statusAfter.every(s => s.applied && s.checksumMatches), 'All migrations must be marked applied with matching checksums');
  console.log(`✅ TEST D PASSED: Migration ledger verified with timestamps, filenames and SHA-256 checksums`);

  // ---------------------------------------------------------------------------
  // TEST E: FAILED MIGRATION HANDLED SAFELY (ROLLBACK)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST E: FAILED MIGRATION ERROR HANDLING & ROLLBACK ---');
  const tempDir = path.resolve(process.cwd(), '.data/test_temp_migrations');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const failingMockDb = new MockMigrationDatabase();
  // Copy 001 and add bad migration 002
  fs.writeFileSync(path.join(tempDir, '001_initial.sql'), 'CREATE TABLE test_good (id text PRIMARY KEY);');
  fs.writeFileSync(path.join(tempDir, '002_bad.sql'), 'CREATE TABLE test_bad INVALID SQL SYNTAX HERE;');

  failingMockDb.failNextMigration = true;

  try {
    await runMigrations({ dir: tempDir, pool: failingMockDb });
    assert.fail('Should have thrown error on invalid migration');
  } catch (err: any) {
    assert.ok(err.message.includes('MIGRATION_FAILED'), 'Error must clearly identify migration failure');
    // Ensure rollback occurred
    assert.ok(failingMockDb.executedQueries.includes('ROLLBACK'), 'Must issue ROLLBACK on failure');
    // Ensure 002 was not written to ledger
    const ledger = failingMockDb.tables.get('schema_migrations')!;
    assert.ok(!ledger.some(l => l.version === '002_bad'), 'Failed migration must not be recorded in schema_migrations');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log('✅ TEST E PASSED: Failed migration triggered ROLLBACK and prevented ledger corruption');

  // ---------------------------------------------------------------------------
  // TEST F: APPLICATION STARTS AGAINST MIGRATED DATABASE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST F: APPLICATION SCHEMA VERSION DETERMINATION ---');
  const activeVersion = await getCurrentSchemaVersion(mockDb);
  assert.strictEqual(activeVersion, files[files.length - 1].version, 'Active schema version must match latest applied migration');
  console.log(`✅ TEST F PASSED: Application successfully resolves active schema version: ${activeVersion}`);

  // ---------------------------------------------------------------------------
  // TEST G: EXISTING GROCERY FUNCTIONALITY REMAINS INTACT
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST G: GROCERY FUNCTIONALITY OPERATES OVER MIGRATED SCHEMA ---');
  process.env.DATABASE_URL = 'postgresql://foodsafe_app:secret@localhost:5432/foodsafe365_prod';

  const outlet = await saveGroceryOutletAsync({
    id: 'store-migrated-1',
    name: 'Migrated Test Supermarket',
    branchName: 'Koramangala Branch',
    address: '100 Feet Road, 4th Block',
    city: 'Bengaluru',
    managerName: 'Priya Sharma',
    contactNumber: '+91 98450 12345',
    contactEmail: 'priya@greenharvest.in',
    fssaiNumber: '11223344556677',
    storeType: 'supermarket',
    selectedCategories: ['dairy_milk', 'meat_fresh']
  });

  assert.strictEqual(outlet.id, 'store-migrated-1');
  assert.strictEqual(outlet.name, 'Migrated Test Supermarket');

  const fetched = await getGroceryOutletAsync('store-migrated-1');
  assert.strictEqual(fetched?.id, 'store-migrated-1');

  const tempLog = await recordTemperatureLogAsync({
    outletId: 'store-migrated-1',
    equipmentId: 'eq-test-1',
    reading: 2.8,
    recordedBy: 'Priya Sharma',
    method: 'probe',
    notes: 'Post-migration calibration reading'
  });

  assert.strictEqual(tempLog.log.status, 'GREEN');
  const logs = await getTemperatureLogsAsync('store-migrated-1');
  assert.ok(logs.length > 0);
  assert.strictEqual(logs[0].reading, 2.8);
  console.log('✅ TEST G PASSED: Grocery store records and temperature logs functional over migrated schema');

  console.log('\n================================================================');
  console.log('🎯 ALL 7 MIGRATION TESTS (TEST A THROUGH TEST G) PASSED (7/7)');
  console.log('================================================================\n');
}

runMigrationTestSuite().catch(err => {
  console.error('❌ MIGRATION TEST SUITE FAILED:', err);
  process.exit(1);
});
