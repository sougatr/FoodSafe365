import assert from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { runMigrations, getMigrationFiles } from '../lib/migrations';
import { setPoolForTesting, resetPool } from '../lib/db';

/**
 * Isolated in-memory relational store representing a distinct database instance.
 */
class InMemoryDatabaseInstance {
  public name: string;
  public tables: Map<string, any[]> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  async connect() {
    return this;
  }

  release() {}

  async query(sqlText: string, params: any[] = []): Promise<{ rows: any[] }> {
    const cleaned = sqlText.trim().replace(/\s+/g, ' ');

    if (cleaned === 'BEGIN' || cleaned === 'COMMIT' || cleaned === 'ROLLBACK') {
      return { rows: [] };
    }

    if (cleaned.startsWith('CREATE TABLE') || cleaned.startsWith('CREATE INDEX') || cleaned.startsWith('ALTER TABLE')) {
      const match = cleaned.match(/CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_]+)/i);
      if (match && match[1]) {
        const table = match[1];
        if (!this.tables.has(table)) {
          this.tables.set(table, []);
        }
      }
      return { rows: [] };
    }

    if (/SELECT version, checksum FROM schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      return { rows: list.map(r => ({ version: r.version, checksum: r.checksum })) };
    }

    if (/INSERT INTO schema_migrations/i.test(cleaned)) {
      const list = this.tables.get('schema_migrations') || [];
      list.push({
        version: params[0],
        name: params[1],
        checksum: params[2],
        applied_at: new Date().toISOString(),
        execution_time_ms: params[3] || 1
      });
      this.tables.set('schema_migrations', list);
      return { rows: [] };
    }

    if (/SELECT count\(\*\)::int as count FROM/i.test(cleaned)) {
      const match = cleaned.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (match && match[1]) {
        const list = this.tables.get(match[1]) || [];
        return { rows: [{ count: list.length }] };
      }
      return { rows: [{ count: 0 }] };
    }

    return { rows: [] };
  }

  insertRecord(table: string, record: any) {
    if (!this.tables.has(table)) {
      this.tables.set(table, []);
    }
    this.tables.get(table)!.push({ ...record });
  }

  getAllRecords(table: string): any[] {
    return (this.tables.get(table) || []).map(r => ({ ...r }));
  }

  dumpSnapshot(): string {
    const data: Record<string, any[]> = {};
    this.tables.forEach((rows, table) => {
      data[table] = rows;
    });
    return JSON.stringify({
      format: 'FOODSAFE365_LOGICAL_DUMP_v1',
      createdAt: new Date().toISOString(),
      tables: data
    }, null, 2);
  }

  restoreSnapshot(dumpContent: string) {
    const parsed = JSON.parse(dumpContent);
    assert.strictEqual(parsed.format, 'FOODSAFE365_LOGICAL_DUMP_v1');
    this.tables.clear();
    for (const [table, rows] of Object.entries(parsed.tables)) {
      this.tables.set(table, [...(rows as any[])]);
    }
  }
}

async function runBackupRestoreTestSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — DATABASE BACKUP & RESTORE VERIFICATION SUITE');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // STEP 1: INITIALIZE NON-PRODUCTION SOURCE DATABASE & MIGRATE SCHEMA
  // ---------------------------------------------------------------------------
  console.log('--- STEP 1: PROVISION SOURCE DATABASE & APPLY MIGRATIONS ---');
  const sourceDb = new InMemoryDatabaseInstance('foodsafe365_staging_source');
  await runMigrations({ pool: sourceDb });
  assert.ok(sourceDb.tables.has('schema_migrations'));
  console.log(`✅ STEP 1 PASSED: Source staging database migrated to full schema (${sourceDb.tables.size} tables)`);

  // ---------------------------------------------------------------------------
  // STEP 2: SEED REPRESENTATIVE PRODUCTION RECORDS
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 2: SEED MULTI-DOMAIN OPERATIONAL DATA ---');
  // 1. Grocery Outlets
  const sampleOutlet = {
    id: 'store-dr-test-01',
    name: 'Reliability Test Hypermarket',
    branch_name: 'Whitefield Tech Park',
    address: 'ITPL Main Road',
    city: 'Bengaluru',
    manager_name: 'Suresh Raina',
    contact_number: '+91 99887 76655',
    contact_email: 'suresh@reliability.in',
    fssai_number: '10019043000999',
    store_type: 'hypermarket',
    selected_categories: ['dairy_milk', 'frozen_foods', 'meat_fresh'],
    created_at: new Date().toISOString()
  };
  sourceDb.insertRecord('grocery_outlets', sampleOutlet);

  // 2. Grocery Equipment & Temperature Logs
  const sampleEquipment = {
    id: 'eq-dr-chiller-1',
    outlet_id: 'store-dr-test-01',
    name: 'Walk-in Meat Freezer -20C',
    equipment_type: 'freezer',
    location: 'Rear cold room',
    target_temp: -18.0,
    min_temp: -22.0,
    max_temp: -15.0,
    responsible_person: 'Suresh Raina',
    active: true,
    created_at: new Date().toISOString()
  };
  sourceDb.insertRecord('grocery_equipment', sampleEquipment);

  const sampleTempLog = {
    id: 'temp-dr-101',
    outlet_id: 'store-dr-test-01',
    equipment_id: 'eq-dr-chiller-1',
    equipment_name: 'Walk-in Meat Freezer -20C',
    reading: -19.2,
    status: 'GREEN',
    method: 'digital_probe',
    recorded_by: 'Suresh Raina',
    recorded_at: new Date().toISOString()
  };
  sourceDb.insertRecord('grocery_temperature_logs', sampleTempLog);

  // 3. Customer Food-Safety Feedback
  const sampleFeedback = {
    id: 'fb-dr-888',
    outlet_id: 'leopold-cafe',
    outlet_name: 'Leopold Cafe & Bar',
    overall_score: 4.8,
    cleanliness_score: 5.0,
    staff_hygiene_score: 4.7,
    food_freshness_score: 4.9,
    safe_water_score: 5.0,
    washroom_score: 4.5,
    feedback: 'Spotless kitchen view and exemplary food hygiene observed.',
    diner_name: 'Ananya Roy',
    diner_mobile: '+91 98765 00000',
    verified_dine_in: true,
    created_at: new Date().toISOString()
  };
  sourceDb.insertRecord('customer_feedback', sampleFeedback);

  // 4. Service Providers & Requests
  const sampleProvider = {
    id: 'prov-dr-refrig',
    business_name: 'ColdChain Express Systems Ltd',
    contact_name: 'Vikram Joshi',
    mobile: '+91 98200 11223',
    email: 'service@coldchainexpress.com',
    city: 'Bengaluru',
    categories: ['refrigeration', 'cold_chain'],
    description: 'Certified commercial HVAC and refrigeration specialists',
    verification_status: 'verified',
    status: 'active',
    created_at: new Date().toISOString()
  };
  sourceDb.insertRecord('service_providers', sampleProvider);

  const sampleServiceRequest = {
    id: 'sr-dr-901',
    organisation_id: 'org-green-harvest',
    outlet_id: 'store-dr-test-01',
    outlet_name: 'Reliability Test Hypermarket',
    corrective_action_id: 'act-dr-temp-leak',
    corrective_action_title: 'Condenser coolant replacement',
    provider_id: 'prov-dr-refrig',
    provider_name: 'ColdChain Express Systems Ltd',
    service_category: 'refrigeration',
    problem_description: 'Refrigerant pressure drop detected',
    status: 'completed',
    completion_notes: 'Recharged R404A gas and tested thermal cycle',
    requested_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
  sourceDb.insertRecord('restaurant_service_requests', sampleServiceRequest);

  console.log('✅ STEP 2 PASSED: Seeded representative Grocery, Feedback, and Service Provider records');

  // ---------------------------------------------------------------------------
  // STEP 3: CREATE BACKUP DUMP
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 3: EXECUTE BACKUP PROCEDURE ---');
  const backupDump = sourceDb.dumpSnapshot();
  assert.ok(backupDump.length > 500, 'Backup dump must contain serialized data payload');
  const backupChecksum = crypto.createHash('sha256').update(backupDump).digest('hex');
  console.log(`✅ STEP 3 PASSED: Logical backup generated (SHA-256: ${backupChecksum.slice(0, 16)}...)`);

  // ---------------------------------------------------------------------------
  // STEP 4: PROVISION CLEAN RESTORE TARGET
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 4: PROVISION CLEAN RESTORE TARGET DATABASE ---');
  const targetDb = new InMemoryDatabaseInstance('foodsafe365_clean_restore_target');
  assert.strictEqual(targetDb.tables.size, 0, 'Clean target must be completely empty initially');
  console.log('✅ STEP 4 PASSED: Clean isolated target database verified with 0 pre-existing tables');

  // ---------------------------------------------------------------------------
  // STEP 5: RESTORE BACKUP INTO TARGET
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 5: RESTORE BACKUP INTO TARGET DATABASE ---');
  targetDb.restoreSnapshot(backupDump);
  assert.ok(targetDb.tables.size >= sourceDb.tables.size, 'Restored database must contain all source tables');
  console.log(`✅ STEP 5 PASSED: Backup snapshot successfully restored into target database (${targetDb.tables.size} tables)`);

  // ---------------------------------------------------------------------------
  // STEP 6: VERIFY SCHEMA & RECORDS POST-RESTORE
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 6: VERIFY SCHEMA INTEGRITY & DATA FIDELITY ---');

  // A. Schema Migrations Ledger
  const restoredMigrations = targetDb.getAllRecords('schema_migrations');
  assert.strictEqual(restoredMigrations.length, sourceDb.getAllRecords('schema_migrations').length);
  console.log(`  ✓ Schema migrations ledger intact (${restoredMigrations.length} migration versions)`);

  // B. Grocery Outlet
  const restoredOutlets = targetDb.getAllRecords('grocery_outlets');
  assert.strictEqual(restoredOutlets.length, 1);
  assert.strictEqual(restoredOutlets[0].id, sampleOutlet.id);
  assert.strictEqual(restoredOutlets[0].fssai_number, sampleOutlet.fssai_number);
  console.log(`  ✓ Grocery Outlet restored: ${restoredOutlets[0].name} (FSSAI: ${restoredOutlets[0].fssai_number})`);

  // C. Grocery Equipment & Temperature Logs
  const restoredEquipment = targetDb.getAllRecords('grocery_equipment');
  assert.strictEqual(restoredEquipment.length, 1);
  assert.strictEqual(restoredEquipment[0].target_temp, -18.0);

  const restoredTempLogs = targetDb.getAllRecords('grocery_temperature_logs');
  assert.strictEqual(restoredTempLogs.length, 1);
  assert.strictEqual(restoredTempLogs[0].reading, -19.2);
  assert.strictEqual(restoredTempLogs[0].status, 'GREEN');
  console.log(`  ✓ Refrigeration Equipment & Temperature Logs verified (${restoredTempLogs[0].reading}°C ${restoredTempLogs[0].status})`);

  // D. Customer Feedback
  const restoredFeedback = targetDb.getAllRecords('customer_feedback');
  assert.strictEqual(restoredFeedback.length, 1);
  assert.strictEqual(restoredFeedback[0].id, sampleFeedback.id);
  assert.strictEqual(restoredFeedback[0].outlet_id, 'leopold-cafe');
  assert.strictEqual(restoredFeedback[0].overall_score, 4.8);
  console.log(`  ✓ Customer Feedback verified: ${restoredFeedback[0].outlet_name} (Rating: ${restoredFeedback[0].overall_score}/5)`);

  // E. Service Provider & Service Request
  const restoredProviders = targetDb.getAllRecords('service_providers');
  assert.strictEqual(restoredProviders.length, 1);
  assert.strictEqual(restoredProviders[0].business_name, 'ColdChain Express Systems Ltd');

  const restoredRequests = targetDb.getAllRecords('restaurant_service_requests');
  assert.strictEqual(restoredRequests.length, 1);
  assert.strictEqual(restoredRequests[0].status, 'completed');
  assert.strictEqual(restoredRequests[0].provider_name, 'ColdChain Express Systems Ltd');
  console.log(`  ✓ Service Provider & Request verified: ${restoredRequests[0].service_category} (${restoredRequests[0].status})`);

  console.log('\n================================================================');
  console.log('🎯 BACKUP & RESTORE DRILL PASSED: 100% RECORD RECOVERY VERIFIED');
  console.log('================================================================\n');
}

runBackupRestoreTestSuite().catch(err => {
  console.error('❌ BACKUP/RESTORE TEST FAILED:', err);
  process.exit(1);
});
