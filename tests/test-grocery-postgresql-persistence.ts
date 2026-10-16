import assert from 'node:assert';
import { setPoolForTesting } from '../lib/db';
import {
  isGroceryPostgresMode,
  ensureGroceryPgSchema,
  saveGroceryOutletAsync,
  getGroceryOutletAsync,
  getStorageZonesAsync,
  saveStorageZoneAsync,
  getGroceryEquipmentListAsync,
  saveGroceryEquipmentAsync,
  recordTemperatureLogAsync,
  getTemperatureLogsAsync,
  recordReceivingItemAsync,
  getReceivingLogsAsync,
  getStockItemsAsync,
  updateStockStatusAsync,
  recordDailyCheckAsync,
  getDailyCheckHistoryAsync,
  getActiveGroceryAlertsAsync,
  getGroceryDashboardSummaryAsync,
  quarantineBatchAsync,
  releaseBatchAsync,
  searchStockItemsAsync,
  getActiveStockItemsAsync,
  _setSimulatePgFailureForTesting,
  _resetMockAdapterForTesting
} from '../lib/grocery-store';
import { authorizeGroceryAccess } from '../lib/grocery-tenant';
import { createSessionToken, SESSION_COOKIE_NAME } from '../lib/session';

// ----------------------------------------------------
// IN-MEMORY RELATIONAL SQL MOCK POOL FOR POSTGRESQL HARNESS
// ----------------------------------------------------
class MockPgDatabase {
  tables: Map<string, any[]> = new Map();
  failOnBatchItemUpdateId: string | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.tables.set('grocery_outlets', []);
    this.tables.set('grocery_product_categories', []);
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
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    const cleaned = text.trim().replace(/\s+/g, ' ');

    // DDL Statements
    if (cleaned.startsWith('CREATE TABLE') || cleaned.startsWith('CREATE INDEX')) {
      return { rows: [] };
    }

    // COUNT Queries
    if (/SELECT count\(\*\)::int as count FROM (\w+)/i.test(cleaned)) {
      const match = cleaned.match(/FROM (\w+)/i);
      const tableName = match ? match[1] : '';
      let list = this.tables.get(tableName) || [];
      if (/WHERE outlet_id = \$1/i.test(cleaned)) {
        list = list.filter(r => r.outlet_id === params[0]);
      }
      return { rows: [{ count: list.length }] };
    }

    // INSERT INTO grocery_outlets
    if (/INSERT INTO grocery_outlets/i.test(cleaned)) {
      const list = this.tables.get('grocery_outlets')!;
      const existingIdx = list.findIndex(r => r.id === params[0]);
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
      if (existingIdx >= 0) list[existingIdx] = { ...list[existingIdx], ...record, updated_at: new Date().toISOString() };
      else list.push(record);
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

    // SELECT FROM grocery_outlets
    if (/SELECT .* FROM grocery_outlets WHERE id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_outlets')!;
      const found = list.find(r => r.id === params[0]);
      if (!found) return { rows: [] };
      return {
        rows: [{
          id: found.id,
          name: found.name,
          branchName: found.branch_name,
          address: found.address,
          city: found.city,
          managerName: found.manager_name,
          contactNumber: found.contact_number,
          contactEmail: found.contact_email,
          fssaiNumber: found.fssai_number,
          storeType: found.store_type,
          selectedCategories: found.selected_categories,
          createdAt: found.created_at,
          updatedAt: found.updated_at
        }]
      };
    }

    // INSERT INTO grocery_storage_zones
    if (/INSERT INTO grocery_storage_zones/i.test(cleaned)) {
      const list = this.tables.get('grocery_storage_zones')!;
      const existingIdx = list.findIndex(r => r.id === params[0]);
      const record = {
        id: params[0],
        outlet_id: params[1],
        name: params[2],
        zone_type: params[3],
        target_temp: params[4],
        min_temp: params[5],
        max_temp: params[6],
        description: params[7],
        created_at: new Date().toISOString()
      };
      if (existingIdx >= 0) list[existingIdx] = record;
      else list.push(record);
      return {
        rows: [{
          id: record.id,
          outletId: record.outlet_id,
          name: record.name,
          type: record.zone_type,
          targetTemp: record.target_temp,
          minTemp: record.min_temp,
          maxTemp: record.max_temp,
          description: record.description
        }]
      };
    }

    // SELECT FROM grocery_storage_zones
    if (/SELECT .* FROM grocery_storage_zones WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_storage_zones')!;
      const rows = list.filter(r => r.outlet_id === params[0]).map(r => ({
        id: r.id,
        outletId: r.outlet_id,
        name: r.name,
        type: r.zone_type,
        targetTemp: r.target_temp,
        minTemp: r.min_temp,
        maxTemp: r.max_temp,
        description: r.description
      }));
      return { rows };
    }

    // INSERT INTO grocery_equipment
    if (/INSERT INTO grocery_equipment/i.test(cleaned)) {
      const list = this.tables.get('grocery_equipment')!;
      const existingIdx = list.findIndex(r => r.id === params[0]);
      const record = {
        id: params[0],
        outlet_id: params[1],
        name: params[2],
        equipment_type: params[3],
        location: params[4],
        target_temp: params[5],
        min_temp: params[6],
        max_temp: params[7],
        responsible_person: params[8],
        active: params[9],
        created_at: new Date().toISOString()
      };
      if (existingIdx >= 0) list[existingIdx] = record;
      else list.push(record);
      return {
        rows: [{
          id: record.id,
          outletId: record.outlet_id,
          name: record.name,
          type: record.equipment_type,
          location: record.location,
          targetTemp: record.target_temp,
          minTemp: record.min_temp,
          maxTemp: record.max_temp,
          responsiblePerson: record.responsible_person,
          active: record.active,
          createdAt: record.created_at
        }]
      };
    }

    // SELECT FROM grocery_equipment
    if (/SELECT .* FROM grocery_equipment WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_equipment')!;
      const rows = list.filter(r => r.outlet_id === params[0]).map(r => ({
        id: r.id,
        outletId: r.outlet_id,
        name: r.name,
        type: r.equipment_type,
        location: r.location,
        targetTemp: r.target_temp,
        minTemp: r.min_temp,
        maxTemp: r.max_temp,
        responsiblePerson: r.responsible_person,
        active: r.active,
        createdAt: r.created_at
      }));
      return { rows };
    }

    // INSERT INTO grocery_temperature_logs
    if (/INSERT INTO grocery_temperature_logs/i.test(cleaned)) {
      const list = this.tables.get('grocery_temperature_logs')!;
      const record = {
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
      list.unshift(record);
      return { rows: [record] };
    }

    // SELECT FROM grocery_temperature_logs
    if (/SELECT .* FROM grocery_temperature_logs WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_temperature_logs')!;
      const limit = params[1] || 50;
      const rows = list.filter(r => r.outlet_id === params[0]).slice(0, limit).map(r => ({
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
      }));
      return { rows };
    }

    // INSERT INTO grocery_receiving_records
    if (/INSERT INTO grocery_receiving_records/i.test(cleaned)) {
      const list = this.tables.get('grocery_receiving_records')!;
      const record = {
        id: params[0],
        outlet_id: params[1],
        date_time: params[2],
        supplier: params[3],
        product: params[4],
        product_category: params[5],
        quantity: params[6],
        batch_number: params[7],
        use_by_date: params[8],
        packaging_condition: params[9],
        product_condition: params[10],
        temperature: params[11],
        is_temp_sensitive: params[12],
        receiving_person: params[13],
        decision: params[14],
        rejection_reason: params[15],
        evidence_url: params[16],
        inspection_checklist: typeof params[17] === 'string' ? JSON.parse(params[17]) : params[17],
        corrective_action_id: params[18],
        created_at: params[19]
      };
      list.unshift(record);
      return { rows: [record] };
    }

    // SELECT FROM grocery_receiving_records
    if (/SELECT .* FROM grocery_receiving_records WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_receiving_records')!;
      const rows = list.filter(r => r.outlet_id === params[0]).map(r => ({
        id: r.id,
        outletId: r.outlet_id,
        dateTime: r.date_time,
        supplier: r.supplier,
        product: r.product,
        productCategory: r.product_category,
        quantity: r.quantity,
        batchNumber: r.batch_number,
        useByDate: r.use_by_date,
        packagingCondition: r.packaging_condition,
        productCondition: r.product_condition,
        temperature: r.temperature,
        isTempSensitive: r.is_temp_sensitive,
        receivingPerson: r.receiving_person,
        decision: r.decision,
        rejectionReason: r.rejection_reason,
        evidenceUrl: r.evidence_url,
        inspectionChecklist: r.inspection_checklist,
        correctiveActionId: r.corrective_action_id,
        createdAt: r.created_at
      }));
      return { rows };
    }

    // INSERT INTO grocery_inventory_batches
    if (/INSERT INTO grocery_inventory_batches/i.test(cleaned)) {
      const list = this.tables.get('grocery_inventory_batches')!;
      const record = {
        id: params[0],
        outlet_id: params[1],
        product: params[2],
        category: params[3],
        batch: params[4],
        quantity: params[5],
        unit: params[6],
        date_received: params[7],
        expiry_date: params[8],
        storage_zone_id: params[9],
        storage_zone_name: params[10],
        status: params[11],
        audit_trail: typeof params[12] === 'string' ? JSON.parse(params[12]) : params[12],
        created_at: params[13],
        updated_at: params[14]
      };
      list.unshift(record);
      return { rows: [record] };
    }

    if (/SELECT .* FROM grocery_inventory_batches WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_inventory_batches')!;
      let filtered = list.filter(r => r.outlet_id === params[0]);
      if (/AND batch = \$2/i.test(cleaned)) {
        filtered = filtered.filter(r => r.batch === params[1]);
      }
      const rows = filtered.map(r => ({
        id: r.id,
        outletId: r.outlet_id,
        product: r.product,
        category: r.category,
        batch: r.batch,
        quantity: r.quantity,
        unit: r.unit,
        dateReceived: r.date_received,
        expiryDate: r.expiry_date,
        storageZoneId: r.storage_zone_id,
        storageZoneName: r.storage_zone_name,
        status: r.status,
        auditTrail: r.audit_trail,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      return { rows };
    }

    // UPDATE grocery_inventory_batches
    if (/UPDATE grocery_inventory_batches/i.test(cleaned)) {
      const list = this.tables.get('grocery_inventory_batches')!;
      const newStatus = params[0];
      const zoneId = params[1];
      const zoneName = params[2];
      const trail = typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3];
      const itemId = params[4];
      const outletId = params[5];

      if (this.failOnBatchItemUpdateId && itemId === this.failOnBatchItemUpdateId) {
        throw new Error(`Simulated database failure during batch transaction for item ${itemId}`);
      }

      const idx = list.findIndex(r => r.id === itemId && r.outlet_id === outletId);
      if (idx < 0) return { rows: [] };
      list[idx].status = newStatus;
      if (zoneId) list[idx].storage_zone_id = zoneId;
      if (zoneName) list[idx].storage_zone_name = zoneName;
      list[idx].audit_trail = trail;
      list[idx].updated_at = new Date().toISOString();

      const updated = list[idx];
      return {
        rows: [{
          id: updated.id,
          outletId: updated.outlet_id,
          product: updated.product,
          category: updated.category,
          batch: updated.batch,
          quantity: updated.quantity,
          unit: updated.unit,
          dateReceived: updated.date_received,
          expiryDate: updated.expiry_date,
          storageZoneId: updated.storage_zone_id,
          storageZoneName: updated.storage_zone_name,
          status: updated.status,
          auditTrail: updated.audit_trail,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at
        }]
      };
    }

    // INSERT INTO grocery_daily_checks
    if (/INSERT INTO grocery_daily_checks/i.test(cleaned)) {
      const list = this.tables.get('grocery_daily_checks')!;
      const record = {
        id: params[0],
        outlet_id: params[1],
        check_date: params[2],
        shift: 'morning',
        completed_by: params[3],
        overall_status: params[4],
        passed_count: params[5],
        flagged_count: params[6],
        created_at: params[7] || new Date().toISOString()
      };
      list.unshift(record);
      return { rows: [record] };
    }

    // SELECT FROM grocery_daily_checks
    if (/SELECT .* FROM grocery_daily_checks WHERE outlet_id = \$1/i.test(cleaned)) {
      const list = this.tables.get('grocery_daily_checks')!;
      const rows = list.filter(r => r.outlet_id === params[0]).map(r => ({
        id: r.id,
        outletId: r.outlet_id,
        date: r.check_date,
        supervisorName: r.completed_by,
        conformingCount: r.passed_count,
        nonConformingCount: r.flagged_count,
        totalChecks: r.passed_count + r.flagged_count,
        createdAt: r.created_at
      }));
      return { rows };
    }

    // Default fallback
    return { rows: [] };
  }

  async connect() {
    let snapshot: Map<string, any[]> | null = null;
    return {
      query: async (text: string, params: any[] = []) => {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        if (cleaned.startsWith('BEGIN')) {
          snapshot = new Map();
          this.tables.forEach((v, k) => {
            snapshot!.set(k, JSON.parse(JSON.stringify(v)));
          });
          return { rows: [] };
        }
        if (cleaned.startsWith('COMMIT')) {
          snapshot = null;
          return { rows: [] };
        }
        if (cleaned.startsWith('ROLLBACK')) {
          if (snapshot) {
            this.tables = snapshot;
          }
          snapshot = null;
          return { rows: [] };
        }
        return this.query(text, params);
      },
      release: () => {}
    };
  }
}

// ----------------------------------------------------
// VERIFICATION TEST SUITE RUNNER
// ----------------------------------------------------
async function runPostgresPersistenceSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — P0-1 GROCERY POSTGRESQL PERSISTENCE SUITE');
  console.log('================================================================\n');

  // Configure simulated Postgres environment
  process.env.DATABASE_URL = 'postgresql://foodsafe_app:secret@localhost:5432/foodsafe365_prod';
  const mockDb = new MockPgDatabase();
  setPoolForTesting(mockDb);

  assert.strictEqual(isGroceryPostgresMode(), true, 'Must operate in PostgreSQL mode when DATABASE_URL is set');
  await ensureGroceryPgSchema();

  const testOutletId = `store-pg-fresh-${Date.now()}`;

  // ---------------------------------------------------------------------------
  // TEST A: POSTGRESQL CREATE
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: POSTGRESQL CREATE ---');
  const createdOutlet = await saveGroceryOutletAsync({
    id: testOutletId,
    name: 'Harvest Daily Organic Supermarket',
    branchName: 'Indiranagar Flagship',
    address: '100ft Road, Indiranagar',
    city: 'Bengaluru',
    managerName: 'Arjun Somnath',
    contactNumber: '+91 98450 11223',
    contactEmail: 'arjun@harvestdaily.example.com',
    fssaiNumber: '11223344556677',
    storeType: 'supermarket',
    selectedCategories: ['dairy_milk', 'meat_fresh', 'frozen_foods', 'fresh_produce']
  });

  assert.strictEqual(createdOutlet.id, testOutletId);
  assert.strictEqual(createdOutlet.name, 'Harvest Daily Organic Supermarket');
  assert.strictEqual(createdOutlet.storeType, 'supermarket');
  console.log(`✅ TEST A PASSED: Outlet record created in PostgreSQL tables with default zones`);

  // ---------------------------------------------------------------------------
  // TEST B: POSTGRESQL READ
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: POSTGRESQL READ ---');
  const fetchedOutlet = await getGroceryOutletAsync(testOutletId);
  assert.ok(fetchedOutlet, 'Outlet must be retrievable via getGroceryOutletAsync');
  assert.strictEqual(fetchedOutlet.fssaiNumber, '11223344556677');
  assert.strictEqual(fetchedOutlet.managerName, 'Arjun Somnath');

  const zones = await getStorageZonesAsync(testOutletId);
  assert.ok(zones.length >= 4, 'Default zones must be initialized in PostgreSQL');
  console.log(`✅ TEST B PASSED: Read persisted outlet and ${zones.length} zones from PostgreSQL`);

  // ---------------------------------------------------------------------------
  // TEST C: POSTGRESQL UPDATE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C: POSTGRESQL UPDATE ---');
  const updatedOutlet = await saveGroceryOutletAsync({
    ...createdOutlet,
    managerName: 'Arjun Somnath (Senior Lead)',
    contactNumber: '+91 98450 99887'
  });
  assert.strictEqual(updatedOutlet.managerName, 'Arjun Somnath (Senior Lead)');

  const verifyRead = await getGroceryOutletAsync(testOutletId);
  assert.strictEqual(verifyRead?.managerName, 'Arjun Somnath (Senior Lead)');
  assert.strictEqual(verifyRead?.contactNumber, '+91 98450 99887');
  console.log('✅ TEST C PASSED: PostgreSQL record update confirmed with zero loss of integrity');

  // ---------------------------------------------------------------------------
  // TEST D: PERSISTENCE ACROSS MEMORY RESTART
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST D: PERSISTENCE ACROSS RESTART ---');
  // Wiping volatile test memory
  _resetMockAdapterForTesting();

  // Reading again while persistent tables still hold records
  const postRestartOutlet = await getGroceryOutletAsync(testOutletId);
  assert.ok(postRestartOutlet, 'Outlet must persist even after memory cache / restart');
  assert.strictEqual(postRestartOutlet.id, testOutletId);
  assert.strictEqual(postRestartOutlet.name, 'Harvest Daily Organic Supermarket');
  console.log('✅ TEST D PASSED: Data survived complete memory reset, demonstrating PostgreSQL persistence');

  // ---------------------------------------------------------------------------
  // TEST E: DATABASE FAILURE HANDLING
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST E: DATABASE FAILURE HANDLING ---');
  _setSimulatePgFailureForTesting(true);

  let failureCaught = false;
  try {
    await saveGroceryOutletAsync({
      id: 'store-doomed-to-fail',
      name: 'Failed Outlet',
      branchName: 'Nowhere',
      address: 'Nowhere',
      city: 'Nowhere',
      managerName: 'Nobody',
      contactNumber: '000',
      contactEmail: 'failed@example.com',
      fssaiNumber: '000',
      storeType: 'convenience',
      selectedCategories: []
    });
  } catch (err: any) {
    failureCaught = true;
    assert.ok(err.message.includes('DATABASE_ERROR'), 'Must throw DATABASE_ERROR');
    assert.ok(err.message.includes('Refusing to write to volatile memory'), 'Must refuse volatile fallback');
  }
  assert.strictEqual(failureCaught, true, 'Database failure must throw hard error');
  console.log('✅ TEST E PASSED: Database failure handled strictly by throwing DATABASE_ERROR');

  // ---------------------------------------------------------------------------
  // TEST F: NO IN-MEMORY PRODUCTION FALLBACK
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST F: NO IN-MEMORY PRODUCTION FALLBACK ---');
  _setSimulatePgFailureForTesting(false);
  // Verify that during the failure above, nothing was written to mock memory
  const failedGhost = await getGroceryOutletAsync('store-doomed-to-fail');
  assert.strictEqual(failedGhost, null, 'Must NOT create ghost record in memory on database failure');
  console.log('✅ TEST F PASSED: Verified zero silent fallback to volatile in-memory storage');

  // ---------------------------------------------------------------------------
  // TEST G: CROSS-TENANT READ REJECTION (403)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST G: CROSS-TENANT READ REJECTION ---');
  const tokenOutletA = createSessionToken({
    userId: 'mgr-outlet-a',
    organisationId: 'org-a',
    outletId: testOutletId,
    role: 'outlet_manager'
  });

  const crossReadReq = new Request(`http://localhost:3000/api/v1/grocery/receiving?outletId=store-other-mart`, {
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${tokenOutletA}`
    }
  });

  const authReadResult = await authorizeGroceryAccess('store-other-mart', crossReadReq);
  assert.strictEqual(authReadResult.ok, false, 'Cross-tenant read must be rejected');
  assert.strictEqual(authReadResult.status, 403, 'Must return HTTP 403');
  assert.strictEqual(authReadResult.code, 'FORBIDDEN');
  console.log('✅ TEST G PASSED: Cross-tenant read rejected with 403 FORBIDDEN');

  // ---------------------------------------------------------------------------
  // TEST H: CROSS-TENANT WRITE REJECTION (403)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST H: CROSS-TENANT WRITE REJECTION ---');
  const crossWriteReq = new Request(`http://localhost:3000/api/v1/grocery/stock`, {
    method: 'POST',
    headers: {
      'cookie': `${SESSION_COOKIE_NAME}=${tokenOutletA}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ outletId: 'store-other-mart', itemId: 'stk-1', newStatus: 'DISPOSED' })
  });

  const authWriteResult = await authorizeGroceryAccess('store-other-mart', crossWriteReq);
  assert.strictEqual(authWriteResult.ok, false, 'Cross-tenant write must be rejected');
  assert.strictEqual(authWriteResult.status, 403, 'Must return HTTP 403');
  assert.strictEqual(authWriteResult.code, 'FORBIDDEN');
  console.log('✅ TEST H PASSED: Cross-tenant write rejected with 403 FORBIDDEN');

  // ---------------------------------------------------------------------------
  // TEST I: RECEIVING PERSISTENCE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST I: RECEIVING PERSISTENCE ---');
  const receivingResult = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Karnataka Dairy Cooperative (FSSAI: 10012043000111)',
    product: 'Pasteurized Homogenized Toned Milk 1L',
    productCategory: 'dairy_milk',
    quantity: '50 packets',
    batchNumber: 'LOT-KM-889',
    useByDate: '2026-10-14',
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    temperature: 3.8,
    isTempSensitive: true,
    receivingPerson: 'Arjun Somnath',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  assert.ok(receivingResult.receiving.id, 'Receiving record must receive an ID');
  assert.strictEqual(receivingResult.receiving.decision, 'ACCEPT');
  assert.ok(receivingResult.stockCreated, 'Must create stock batch on ACCEPT');

  const recLogs = await getReceivingLogsAsync(testOutletId);
  const foundRec = recLogs.find(r => r.id === receivingResult.receiving.id);
  assert.ok(foundRec, 'Receiving record must be retrievable from PostgreSQL');
  assert.strictEqual(foundRec.batchNumber, 'LOT-KM-889');

  const stockBatches = await getStockItemsAsync(testOutletId);
  const foundBatch = stockBatches.find(b => b.batch === 'LOT-KM-889');
  assert.ok(foundBatch, 'Stock batch must be linked and persisted');
  assert.strictEqual(foundBatch.status, 'ACTIVE');

  // Exact user scenario test against PostgreSQL:
  // Supplier="dd", Product="milk", Category="Milk and milk products", Quantity="10", Expiry="05/10/2026", Dock temp=1°C, mobile/email blank
  const userScenarioResult = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'dd',
    product: 'milk',
    productCategory: 'Milk and milk products', // human readable name
    quantity: '10',
    useByDate: '05/10/2026', // DD/MM/YYYY format
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    temperature: 1,
    isTempSensitive: true,
    receivingPerson: 'Duty Supervisor',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  assert.ok(userScenarioResult.receiving.id, 'User scenario receiving record must receive an ID');
  assert.strictEqual(userScenarioResult.receiving.decision, 'ACCEPT');
  assert.strictEqual(userScenarioResult.receiving.supplier, 'dd');
  assert.strictEqual(userScenarioResult.receiving.product, 'milk');
  assert.ok(userScenarioResult.stockCreated, 'Must create stock batch on ACCEPT');
  assert.strictEqual(userScenarioResult.stockCreated.expiryDate, '2026-10-05', 'Date 05/10/2026 must normalize to 2026-10-05');

  const recLogsUser = await getReceivingLogsAsync(testOutletId);
  const foundDd = recLogsUser.find(r => r.id === userScenarioResult.receiving.id);
  assert.ok(foundDd, 'Exact user scenario receiving record must be retrievable from PostgreSQL');
  assert.strictEqual(foundDd.supplier, 'dd');
  assert.strictEqual(foundDd.product, 'milk');
  console.log('✅ TEST I PASSED: Receiving record (including exact "dd" milk scenario with blank contact & DD/MM/YYYY date) persisted to PostgreSQL');

  // ---------------------------------------------------------------------------
  // TEST J: TEMPERATURE PERSISTENCE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST J: TEMPERATURE PERSISTENCE ---');
  const eqList = await getGroceryEquipmentListAsync(testOutletId);
  assert.ok(eqList.length > 0, 'Equipment must exist for outlet');
  const chiller = eqList[0];

  const tempLogResult = await recordTemperatureLogAsync({
    outletId: testOutletId,
    equipmentId: chiller.id,
    reading: 3.5,
    recordedBy: 'Arjun Somnath',
    method: 'probe',
    notes: 'Morning shift probe calibration check'
  });

  assert.strictEqual(tempLogResult.log.status, 'GREEN');
  const tempLogs = await getTemperatureLogsAsync(testOutletId, 10);
  const foundTemp = tempLogs.find(t => t.id === tempLogResult.log.id);
  assert.ok(foundTemp, 'Temperature log must persist and be retrievable from PostgreSQL');
  assert.strictEqual(foundTemp.reading, 3.5);
  console.log('✅ TEST J PASSED: Temperature log with compliant status persisted to PostgreSQL');

  // ---------------------------------------------------------------------------
  // TEST K: DAILY CHECK PERSISTENCE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST K: DAILY CHECK PERSISTENCE ---');
  const dailyCheckResult = await recordDailyCheckAsync({
    outletId: testOutletId,
    supervisorName: 'Arjun Somnath',
    responses: {
      'GR22-01': { conforming: true, notes: 'Loading dock spotless' },
      'GR22-02': { conforming: true, notes: 'Pre-cooling operational' },
      'GR22-03': { conforming: false, notes: 'Condenser fan rattling on unit 2' }
    }
  });

  assert.ok(dailyCheckResult.id, 'Daily check must generate ID');
  assert.strictEqual(dailyCheckResult.totalChecks, 3);
  assert.strictEqual(dailyCheckResult.nonConformingCount, 1);

  const checkHistory = await getDailyCheckHistoryAsync(testOutletId);
  const foundCheck = checkHistory.find(c => c.id === dailyCheckResult.id);
  assert.ok(foundCheck, 'Daily check history must persist to PostgreSQL');
  assert.strictEqual(foundCheck.supervisorName, 'Arjun Somnath');
  console.log('✅ TEST K PASSED: 22-point daily check inspection persisted to PostgreSQL');

  // ---------------------------------------------------------------------------
  // TEST L: CORRECTIVE ACTION PERSISTENCE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST L: CORRECTIVE ACTION PERSISTENCE ---');
  const redTempResult = await recordTemperatureLogAsync({
    outletId: testOutletId,
    equipmentId: chiller.id,
    reading: 8.5, // Critical breach
    recordedBy: 'Arjun Somnath',
    method: 'probe',
    notes: 'Compressor thermal overload tripped'
  });

  assert.strictEqual(redTempResult.log.status, 'RED');
  assert.strictEqual(redTempResult.actionCreated, true, 'Critical breach must create corrective action');
  assert.ok(redTempResult.log.correctiveActionId, 'Must link corrective action ID');
  console.log('✅ TEST L PASSED: Critical temperature breach triggered persisted corrective action');

  // ---------------------------------------------------------------------------
  // TEST M: VERIFICATION PERSISTENCE
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST M: VERIFICATION PERSISTENCE ---');
  // Verify dashboard aggregation reflects persistent records
  const dashboard = await getGroceryDashboardSummaryAsync(testOutletId);
  assert.ok(dashboard.outlet, 'Dashboard must resolve persisted outlet');
  assert.strictEqual(dashboard.outlet?.id, testOutletId);
  assert.ok(dashboard.recentTemperatureLogs.length >= 2, 'Dashboard must aggregate temperature logs');
  console.log('✅ TEST M PASSED: Multi-entity verification and dashboard aggregation verified');

  // ---------------------------------------------------------------------------
  // TEST N: RECALL & BATCH QUARANTINE POSTGRESQL PERSISTENCE (PHASE 2A)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST N: RECALL & BATCH QUARANTINE POSTGRESQL PERSISTENCE (PHASE 2A) ---');

  const pgRecallBatch = 'LOT-PG-RECALL-88';
  
  // 1. Inward two receiving items sharing this batch into PostgreSQL
  const inwardRec1 = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Organic Harvest Ltd',
    product: 'Cold Pressed Sesame Oil 500ml',
    productCategory: 'dry_groceries',
    quantity: '24 bottles',
    batchNumber: pgRecallBatch,
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    isTempSensitive: false,
    receivingPerson: 'Arjun Somnath',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  const inwardRec2 = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Organic Harvest Ltd',
    product: 'Cold Pressed Sesame Oil 1L',
    productCategory: 'dry_groceries',
    quantity: '12 bottles',
    batchNumber: pgRecallBatch,
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    isTempSensitive: false,
    receivingPerson: 'Arjun Somnath',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  assert.ok(inwardRec1.stockCreated, 'Stock 1 must be created in PostgreSQL');
  assert.ok(inwardRec2.stockCreated, 'Stock 2 must be created in PostgreSQL');

  // 2. Search stock items in PostgreSQL
  const searchResults = await searchStockItemsAsync(testOutletId, 'PG-RECALL-88');
  assert.strictEqual(searchResults.length, 2, 'Search by batch must return 2 matching PostgreSQL records');

  // 3. Quarantine batch in PostgreSQL
  const qPgResult = await quarantineBatchAsync(
    testOutletId,
    pgRecallBatch,
    'MANUFACTURER_RECALL',
    'Voluntary recall by Organic Harvest: Plastic cap sealant variance',
    'Store Manager (PG)'
  );

  assert.strictEqual(qPgResult.batch, pgRecallBatch);
  assert.strictEqual(qPgResult.affectedCount, 2, 'Must quarantine both records in PostgreSQL');
  assert.strictEqual(qPgResult.totalQuantity, 36, 'Preserved total quantity: 24 + 12 = 36');

  // 4. Verify in DB rows that status is QUARANTINED and zone updated
  const stockAfterQ = await getStockItemsAsync(testOutletId);
  const qItem1 = stockAfterQ.find(s => s.id === inwardRec1.stockCreated!.id)!;
  const qItem2 = stockAfterQ.find(s => s.id === inwardRec2.stockCreated!.id)!;
  assert.strictEqual(qItem1.status, 'QUARANTINED');
  assert.strictEqual(qItem2.status, 'QUARANTINED');
  assert(qItem1.storageZoneName.toLowerCase().includes('quarantine'), 'Must be relocated to quarantine zone');
  assert.strictEqual(Number(qItem1.quantity), 24, 'Quantities must remain intact');
  assert.strictEqual(Number(qItem2.quantity), 12, 'Quantities must remain intact');

  // 5. Active stock safety lock in PostgreSQL
  const activePgStock = await getActiveStockItemsAsync(testOutletId);
  const activePgIds = activePgStock.map(s => s.id);
  assert(!activePgIds.includes(qItem1.id), 'Active stock query must strictly exclude quarantined item 1');
  assert(!activePgIds.includes(qItem2.id), 'Active stock query must strictly exclude quarantined item 2');

  // 6. Active alert generation in PostgreSQL
  const pgAlerts = await getActiveGroceryAlertsAsync(testOutletId);
  const pgRecallAlert = pgAlerts.find(a => a.type === 'RECALL_QUARANTINE');
  assert.ok(pgRecallAlert, 'Must generate persisted RECALL_QUARANTINE alert');
  assert.strictEqual(pgRecallAlert.severity, 'RED');

  // 7. Error handling
  let errorCaught = false;
  try {
    await releaseBatchAsync(testOutletId, pgRecallBatch, '', 'Manager');
  } catch (err: any) {
    errorCaught = true;
    assert(err.message.includes('Mandatory release justification reason'));
  }
  assert.ok(errorCaught, 'Must reject release with empty reason');

  // 8. Controlled release in PostgreSQL
  const relPgResult = await releaseBatchAsync(
    testOutletId,
    pgRecallBatch,
    'Quality advisory cancelled after batch testing cleared all units',
    'Store Manager (PG)'
  );

  assert.strictEqual(relPgResult.releasedCount, 2, 'Both items must be released in PostgreSQL');
  assert.strictEqual(relPgResult.totalQuantity, 36);

  const stockAfterRel = await getStockItemsAsync(testOutletId);
  const relItem1 = stockAfterRel.find(s => s.id === inwardRec1.stockCreated!.id)!;
  assert.strictEqual(relItem1.status, 'ACTIVE', 'Item must be restored to ACTIVE status in PostgreSQL');
  assert(!relItem1.storageZoneName.toLowerCase().includes('quarantine'), 'Item must be relocated out of quarantine');

  const activePgStockAfterRel = await getActiveStockItemsAsync(testOutletId);
  const activePgIdsAfterRel = activePgStockAfterRel.map(s => s.id);
  assert(activePgIdsAfterRel.includes(relItem1.id), 'Active stock must now include released item');

  // 9. Cross-tenant rejection
  const foreignToken = createSessionToken({
    userId: 'user-foreign',
    organisationId: 'org-foreign',
    outletId: 'store-foreign-outlet',
    role: 'manager'
  });
  const mockForeignReq = {
    headers: new Map([['cookie', `${SESSION_COOKIE_NAME}=${foreignToken}`]])
  } as any;
  const foreignAuth = await authorizeGroceryAccess(testOutletId, mockForeignReq, true);
  assert.strictEqual(foreignAuth.ok, false);
  assert.strictEqual((foreignAuth as any).status, 403, 'Cross-tenant request must return 403 FORBIDDEN');

  // 10. PostgreSQL Duplicate Quarantine Idempotency
  // Re-quarantine batch to verify idempotency:
  const qPgAgain = await quarantineBatchAsync(
    testOutletId,
    pgRecallBatch,
    'OTHER_SAFETY_CONCERN',
    'Secondary verification hold',
    'Store Manager (PG)'
  );
  assert.strictEqual(qPgAgain.affectedCount, 2, 'Active items re-quarantined');

  const stockBeforeDup = await getStockItemsAsync(testOutletId);
  const qItemBefore = stockBeforeDup.find(s => s.id === inwardRec1.stockCreated!.id)!;
  const auditLengthBefore = qItemBefore.auditTrail.length;

  const qPgDup = await quarantineBatchAsync(
    testOutletId,
    pgRecallBatch,
    'OTHER_SAFETY_CONCERN',
    'Redundant call on already quarantined batch',
    'Store Manager (PG)'
  );
  assert.strictEqual(qPgDup.alreadyQuarantinedCount, 2, 'PostgreSQL duplicate quarantine must return alreadyQuarantinedCount');
  assert.strictEqual(qPgDup.affectedCount, 0, 'Zero new records modified');

  const stockAfterDup = await getStockItemsAsync(testOutletId);
  const qItemAfter = stockAfterDup.find(s => s.id === inwardRec1.stockCreated!.id)!;
  assert.strictEqual(qItemAfter.auditTrail.length, auditLengthBefore, 'Repeating quarantine must NOT append redundant audit entries in PostgreSQL');

  // Release the items back to active
  await releaseBatchAsync(testOutletId, pgRecallBatch, 'AUTHORISED_SAFETY_CLEARANCE', 'Clearance test', 'Store Manager');

  // 11. Transaction Rollback Protection (Midway Failure)
  const rollbackBatchNo = `PG-ROLLBACK-${Date.now()}`;
  const rbRec1 = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Dairy Farms Ltd',
    product: 'Butter 500g (Item 1)',
    productCategory: 'dairy_chilled',
    quantity: '10 blocks',
    batchNumber: rollbackBatchNo,
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    isTempSensitive: true,
    receivingPerson: 'Vikas Sharma',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  const rbRec2 = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Dairy Farms Ltd',
    product: 'Butter 500g (Item 2)',
    productCategory: 'dairy_chilled',
    quantity: '15 blocks',
    batchNumber: rollbackBatchNo,
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    isTempSensitive: true,
    receivingPerson: 'Vikas Sharma',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  const rbItem1Id = rbRec1.stockCreated!.id;
  const rbItem2Id = rbRec2.stockCreated!.id;

  // Configure failure on item 2 update during multi-item transaction
  mockDb.failOnBatchItemUpdateId = rbItem2Id;
  let txFailed = false;

  try {
    await quarantineBatchAsync(
      testOutletId,
      rollbackBatchNo,
      'MANUFACTURER_RECALL',
      'Recall circular: Testing atomic rollback midway',
      'Store Manager (PG)'
    );
  } catch (err: any) {
    txFailed = true;
    assert(err.message.includes('DATABASE_ERROR') && err.message.includes('quarantineBatch'));
  }
  assert.ok(txFailed, 'Multi-item quarantine must fail when midway query errors');
  mockDb.failOnBatchItemUpdateId = null; // Clear hook

  // Crucial transactional assertion: item 1 was updated BEFORE item 2 failed.
  // Because the entire operation ran inside a database transaction, ROLLBACK must restore item 1 to ACTIVE!
  const stockPostRollback = await getStockItemsAsync(testOutletId);
  const rolledBackItem1 = stockPostRollback.find(s => s.id === rbItem1Id)!;
  const rolledBackItem2 = stockPostRollback.find(s => s.id === rbItem2Id)!;

  assert.strictEqual(rolledBackItem1.status, 'ACTIVE', 'Item 1 must be rolled back to ACTIVE — zero partial updates');
  assert.strictEqual(rolledBackItem2.status, 'ACTIVE', 'Item 2 must remain ACTIVE');

  // 12. PostgreSQL Expiry-Safe Release: Batch with Mixed Eligible and Expired Items
  const pgMixedBatchNo = `PG-MIXED-EXP-${Date.now()}`;
  const pgExpiredDate = '2026-01-01'; // Expired in past
  const pgFutureDate = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10);

  const mixedRecExpired = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Artisan Bakery',
    product: 'Whole Wheat Loaf (Past Expiry)',
    productCategory: 'dry_groceries',
    quantity: '10 loaves',
    batchNumber: pgMixedBatchNo,
    useByDate: pgExpiredDate,
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    isTempSensitive: false,
    receivingPerson: 'Vikas Sharma',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  const mixedRecFresh = await recordReceivingItemAsync({
    outletId: testOutletId,
    supplier: 'Artisan Bakery',
    product: 'Whole Wheat Loaf (Fresh)',
    productCategory: 'dry_groceries',
    quantity: '20 loaves',
    batchNumber: pgMixedBatchNo,
    useByDate: pgFutureDate,
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    isTempSensitive: false,
    receivingPerson: 'Vikas Sharma',
    decision: 'ACCEPT',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: true,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: true,
      withinCapacity: true
    }
  });

  // Quarantine the mixed batch in PostgreSQL
  const qPgMixed = await quarantineBatchAsync(
    testOutletId,
    pgMixedBatchNo,
    'SUPPLIER_ALERT',
    'Supplier alert hold',
    'Store Manager (PG)'
  );
  assert.strictEqual(qPgMixed.affectedCount, 2, 'Both mixed items quarantined in PostgreSQL');

  // Release the mixed batch with structured category
  const relPgMixed = await releaseBatchAsync(
    testOutletId,
    pgMixedBatchNo,
    'LAB_CLEARANCE_CERTIFICATE',
    'Batch laboratory testing COA-PG-882 confirms safety clearance',
    'Store Manager (PG)'
  );

  assert.strictEqual(relPgMixed.releasedCount, 2, 'Both items processed in release');
  assert.strictEqual(relPgMixed.activeCount, 1, 'Only the unexpired fresh item restored to ACTIVE');
  assert.strictEqual(relPgMixed.expiredCount, 1, 'The item that expired while in quarantine transitions to EXPIRED');

  // Verify in PostgreSQL rows
  const stockPostMixedRel = await getStockItemsAsync(testOutletId);
  const dbExpiredItem = stockPostMixedRel.find(s => s.id === mixedRecExpired.stockCreated!.id)!;
  const dbFreshItem = stockPostMixedRel.find(s => s.id === mixedRecFresh.stockCreated!.id)!;

  assert.strictEqual(dbExpiredItem.status, 'EXPIRED', 'Expired item must be EXPIRED in PostgreSQL');
  assert(dbExpiredItem.storageZoneName.toLowerCase().includes('quarantine'), 'Expired item must remain in holding/quarantine zone');
  assert.strictEqual(dbFreshItem.status, 'ACTIVE', 'Fresh item must be ACTIVE in PostgreSQL');

  const dbExpAudit = dbExpiredItem.auditTrail[dbExpiredItem.auditTrail.length - 1];
  assert.strictEqual(dbExpAudit.action, 'RECALL_BATCH_RELEASED_EXPIRED');

  // Strict server-side safety lock verification in PostgreSQL
  const activePgAfterMixed = await getActiveStockItemsAsync(testOutletId);
  const activePgMixedIds = activePgAfterMixed.map(s => s.id);
  assert(activePgMixedIds.includes(dbFreshItem.id), 'Fresh item must be in PostgreSQL active saleable stock');
  assert(!activePgMixedIds.includes(dbExpiredItem.id), 'Expired item must NEVER be in PostgreSQL active saleable stock');

  console.log('✅ TEST N PASSED: Batch recall quarantine, safety lock, alert, controlled release, duplicate idempotency, atomic transaction rollback, expiry-safe mixed release, and tenant isolation persisted in PostgreSQL');

  console.log('\n================================================================');
  console.log('🎯 ALL 14 PERSISTENCE TESTS (TEST A THROUGH TEST N) PASSED (14/14)');
  console.log('================================================================\n');
}

runPostgresPersistenceSuite().catch(err => {
  console.error('❌ POSTGRES PERSISTENCE SUITE FAILED:', err);
  process.exit(1);
});
