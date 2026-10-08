import { getPool, query } from './db';
import {
  GroceryOutlet,
  GroceryStorageZone,
  GroceryEquipment,
  GroceryTemperatureLog,
  GroceryReceiving,
  GroceryStockItem,
  GroceryDailyCheckResult,
  GroceryAlert,
  TemperatureStatus,
  StockStatus,
  GROCERY_PRODUCT_CATEGORIES,
  SegregationRuleCheck
} from './grocery-types';
import { GROCERY_OPERATIONAL_CHECKS } from './grocery-checklist-data';
import { createDemoAction, updateDemoAction } from './demo-store';

// ----------------------------------------------------
// DEFAULT SEED DATA (Used for seeding PostgreSQL or local mock adapter)
// ----------------------------------------------------
export const SEED_GROCERY_OUTLETS: GroceryOutlet[] = [
  {
    id: 'store-nature-basket-bandra',
    name: 'Nature Fresh Market',
    branchName: 'Bandra West Flagship',
    address: 'Plot 42, Hill Road, Bandra West',
    city: 'Mumbai',
    managerName: 'Rajesh Nair',
    contactNumber: '+91 98200 44556',
    contactEmail: 'manager.bandra@naturefresh.example.com',
    fssaiNumber: '11521012000456',
    storeType: 'supermarket',
    selectedCategories: [
      'meat_fresh',
      'seafood_fresh',
      'dairy_milk',
      'frozen_foods',
      'fresh_produce',
      'cut_produce',
      'bakery_packaged',
      'dry_groceries'
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'store-daily-needs-colaba',
    name: 'Daily Needs Gourmet Superstore',
    branchName: 'Colaba Causeway',
    address: 'Shop 8-12, Colaba Causeway',
    city: 'Mumbai',
    managerName: 'Priya Sundaram',
    contactNumber: '+91 98201 55667',
    contactEmail: 'colaba@dailyneeds.example.com',
    fssaiNumber: '11522014000789',
    storeType: 'convenience',
    selectedCategories: [
      'dairy_milk',
      'frozen_foods',
      'fresh_produce',
      'bakery_packaged',
      'dry_groceries',
      'other_packaged'
    ],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export const SEED_STORAGE_ZONES: GroceryStorageZone[] = [
  {
    id: 'zone-nature-dairy-chiller',
    outletId: 'store-nature-basket-bandra',
    name: 'Dairy & Milk Walk-in Chiller',
    type: 'milk_dairy',
    targetTemp: 4,
    minTemp: 1,
    maxTemp: 5,
    description: 'Holding zone for pasteurized milk, cheeses, butter, and yogurt at ≤5°C'
  },
  {
    id: 'zone-nature-meat-chiller',
    outletId: 'store-nature-basket-bandra',
    name: 'Fresh Meat Cold Room',
    type: 'meat_chicken',
    targetTemp: 3,
    minTemp: 0,
    maxTemp: 4,
    description: 'Strict segregated cold holding for fresh dressed poultry and meats'
  },
  {
    id: 'zone-nature-seafood-chiller',
    outletId: 'store-nature-basket-bandra',
    name: 'Fish & Seafood Iced Display',
    type: 'fish_seafood',
    targetTemp: 2,
    minTemp: 0,
    maxTemp: 4,
    description: 'Sloped ice-bed display with drainage for fresh marine catch'
  },
  {
    id: 'zone-nature-freezer',
    outletId: 'store-nature-basket-bandra',
    name: 'Commercial Deep Freezer',
    type: 'freezer',
    targetTemp: -18,
    minTemp: -24,
    maxTemp: -18,
    description: 'Packaged frozen vegetables, ice creams, and ready-to-fry foods at ≤-18°C'
  },
  {
    id: 'zone-nature-produce',
    outletId: 'store-nature-basket-bandra',
    name: 'Fresh Fruits & Greens Area',
    type: 'fresh_produce',
    targetTemp: 12,
    minTemp: 8,
    maxTemp: 18,
    description: 'Ventilated produce racks for whole fruits and vegetables'
  },
  {
    id: 'zone-nature-dry-staples',
    outletId: 'store-nature-basket-bandra',
    name: 'Ambient Grocery & Staples Aisle',
    type: 'ambient_dry',
    targetTemp: 25,
    minTemp: 18,
    maxTemp: 30,
    description: 'Dry food racks elevated 15cm off the floor for flours, grains, oils, and pulses'
  },
  {
    id: 'zone-nature-chemicals',
    outletId: 'store-nature-basket-bandra',
    name: 'Janitorial & Cleaning Supplies Locker',
    type: 'chemical_storage',
    description: 'Locked bunded cupboard for floor sanitizers, dish detergents, and bleach'
  },
  {
    id: 'zone-nature-quarantine',
    outletId: 'store-nature-basket-bandra',
    name: 'Damaged & Expired Quarantine Area',
    type: 'waste_quarantine',
    description: 'Clearly demarcated red zone for expired or returned stock awaiting disposal'
  }
];

export const SEED_EQUIPMENT: GroceryEquipment[] = [
  {
    id: 'equip-nature-chiller-1',
    outletId: 'store-nature-basket-bandra',
    name: 'Dairy Multi-deck Display Chiller 1',
    type: 'open_display_chiller',
    location: 'Aisle 3 - Dairy Section',
    targetTemp: 4,
    minTemp: 1,
    maxTemp: 5,
    responsiblePerson: 'Rajesh Nair',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'equip-nature-chiller-2',
    outletId: 'store-nature-basket-bandra',
    name: 'Fresh Meat Holding Chiller 2',
    type: 'chiller',
    location: 'Meat Butchery Section',
    targetTemp: 3,
    minTemp: 0,
    maxTemp: 4,
    responsiblePerson: 'Arun Gawde',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'equip-nature-freezer-1',
    outletId: 'store-nature-basket-bandra',
    name: 'Frozen Foods Island Freezer 1',
    type: 'freezer',
    location: 'Aisle 6 - Frozen Aisle',
    targetTemp: -18,
    minTemp: -24,
    maxTemp: -18,
    responsiblePerson: 'Rajesh Nair',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'equip-nature-coldroom-1',
    outletId: 'store-nature-basket-bandra',
    name: 'Backroom Storage Walk-in Cold Room',
    type: 'cold_room',
    location: 'Backstage Loading Bay',
    targetTemp: 4,
    minTemp: 1,
    maxTemp: 5,
    responsiblePerson: 'Ramesh Patel',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const SEED_TEMP_LOGS: GroceryTemperatureLog[] = [
  {
    id: 'tmplog-1',
    outletId: 'store-nature-basket-bandra',
    equipmentId: 'equip-nature-chiller-1',
    equipmentName: 'Dairy Multi-deck Display Chiller 1',
    reading: 3.8,
    recordedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    recordedBy: 'Rajesh Nair',
    status: 'GREEN',
    method: 'probe',
    notes: 'Morning shift opening verification. Air curtain intact.'
  },
  {
    id: 'tmplog-2',
    outletId: 'store-nature-basket-bandra',
    equipmentId: 'equip-nature-freezer-1',
    equipmentName: 'Frozen Foods Island Freezer 1',
    reading: -19.2,
    recordedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    recordedBy: 'Rajesh Nair',
    status: 'GREEN',
    method: 'probe',
    notes: 'Defrost cycle normal.'
  },
  {
    id: 'tmplog-3',
    outletId: 'store-nature-basket-bandra',
    equipmentId: 'equip-nature-chiller-2',
    equipmentName: 'Fresh Meat Holding Chiller 2',
    reading: 5.6,
    recordedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    recordedBy: 'Arun Gawde',
    status: 'RED',
    method: 'probe',
    notes: 'Temperature elevated following heavy restocking. Condenser fan checked.',
    correctiveActionId: 'action-temp-breach-meat'
  }
];

export const SEED_STOCK_ITEMS: GroceryStockItem[] = [
  {
    id: 'stk-milk-amul-gold',
    outletId: 'store-nature-basket-bandra',
    product: 'Pasteurized Full Cream Milk 500ml',
    category: 'dairy_milk',
    batch: 'AM-2026-10-A',
    quantity: 45,
    unit: 'pouches',
    dateReceived: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    storageZoneId: 'zone-nature-dairy-chiller',
    storageZoneName: 'Dairy & Milk Walk-in Chiller',
    status: 'ACTIVE',
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'RECEIVED_AND_STOCKED',
        user: 'Rajesh Nair',
        details: 'Initial receipt and placement on front dairy shelf following FEFO'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-bread-wheat',
    outletId: 'store-nature-basket-bandra',
    product: 'Whole Wheat Sandwich Bread 400g',
    category: 'bakery_packaged',
    batch: 'BR-9844',
    quantity: 18,
    unit: 'loaves',
    dateReceived: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    storageZoneId: 'zone-nature-dry-staples',
    storageZoneName: 'Ambient Grocery & Staples Aisle',
    status: 'NEAR_EXPIRY',
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'EXPIRY_CHECK_WARNING',
        user: 'System',
        details: 'Product expires in 24 hours. Pulled to front row for rapid clearance.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-curd-dahi',
    outletId: 'store-nature-basket-bandra',
    product: 'Artisanal Set Curd 400g',
    category: 'dairy_milk',
    batch: 'DH-5521',
    quantity: 8,
    unit: 'cups',
    dateReceived: new Date(Date.now() - 86400000 * 8).toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    storageZoneId: 'zone-nature-quarantine',
    storageZoneName: 'Damaged & Expired Quarantine Area',
    status: 'QUARANTINED',
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'QUARANTINED_EXPIRED_STOCK',
        user: 'Rajesh Nair',
        details: 'Best-before date passed. Removed from sales floor into Red Quarantine area for vendor return.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-chicken-breast',
    outletId: 'store-nature-basket-bandra',
    product: 'Chilled Dressed Chicken Breast 500g',
    category: 'meat_fresh',
    batch: 'CH-1002',
    quantity: 22,
    unit: 'trays',
    dateReceived: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    storageZoneId: 'zone-nature-meat-chiller',
    storageZoneName: 'Fresh Meat Cold Room',
    status: 'ACTIVE',
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'RECEIVED_AND_STOCKED',
        user: 'Arun Gawde',
        details: 'Received at 3.2°C, stored in dedicated meat chiller.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_RECEIVINGS: GroceryReceiving[] = [
  {
    id: 'rec-1',
    outletId: 'store-nature-basket-bandra',
    dateTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    supplier: 'Metro Fresh Foods Ltd (FSSAI: 10014022002890)',
    product: 'Pasteurized Full Cream Milk 500ml',
    productCategory: 'dairy_milk',
    quantity: '60 pouches',
    batchNumber: 'AM-2026-10-A',
    useByDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    temperature: 3.5,
    isTempSensitive: true,
    receivingPerson: 'Rajesh Nair',
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
    },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'rec-2',
    outletId: 'store-nature-basket-bandra',
    dateTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    supplier: 'Coastal Catch Seafoods (FSSAI: 11518005001122)',
    product: 'Fresh Prawns Grade A',
    productCategory: 'seafood_fresh',
    quantity: '15 kg',
    batchNumber: 'CC-882',
    useByDate: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    packagingCondition: 'leaking',
    productCondition: 'substandard',
    temperature: 8.2,
    isTempSensitive: true,
    receivingPerson: 'Arun Gawde',
    decision: 'REJECT',
    rejectionReason: 'Delivery truck refrigeration failure: temperature at dock was 8.2°C (limit ≤4°C) with melting ice leakage.',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: false,
      packagingIntact: false,
      noLeakageOrDamage: false,
      dateMarkingAcceptable: true,
      temperatureAppropriate: false,
      suitableForStorage: false,
      withinCapacity: true
    },
    correctiveActionId: 'action-rec-reject-seafood',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// ----------------------------------------------------
// PERSISTENCE ADAPTER SELECTION & STRICT PRODUCTION SAFETY
// ----------------------------------------------------

/**
 * Check if the application is running in PostgreSQL mode.
 * In PRODUCTION (NODE_ENV === 'production') or when DATABASE_URL is configured:
 * PostgreSQL is the SOLE AUTHORITATIVE store.
 */
export function isGroceryPostgresMode(): boolean {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.error('[CRITICAL PRODUCTION CONFIGURATION ERROR] DATABASE_URL is required in production environment.');
  }
  return Boolean(process.env.DATABASE_URL);
}

// Global flag to simulate database failure for audit testing
let _simulatePgFailure = false;

export function _setSimulatePgFailureForTesting(simulate: boolean): void {
  _simulatePgFailure = simulate;
}

/**
 * Handle database failure strictly:
 * In production or PostgreSQL mode, log the failure and throw immediately.
 * ZERO SILENT FALLBACK TO IN-MEMORY STORAGE.
 */
function handleDatabaseError(operation: string, err: any): never {
  console.error(`[CRITICAL DATABASE FAILURE] Grocery PostgreSQL operation "${operation}" failed:`, err?.message || err);
  throw new Error(`DATABASE_ERROR: Grocery PostgreSQL operation "${operation}" failed. Refusing to write to volatile memory.`);
}

// ----------------------------------------------------
// POSTGRESQL SCHEMA INITIALIZATION
// ----------------------------------------------------
let pgSchemaInitialized = false;

export async function ensureGroceryPgSchema(): Promise<boolean> {
  if (pgSchemaInitialized) return true;
  const pool = getPool();
  if (!pool) return false;

  // In production, runtime code strictly assumes required schema has already been migrated.
  // Dynamic DDL (CREATE TABLE IF NOT EXISTS) is forbidden during production request handling.
  if (process.env.NODE_ENV === 'production') {
    pgSchemaInitialized = true;
    return true;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grocery_outlets (
        id text PRIMARY KEY,
        name text NOT NULL,
        branch_name text NOT NULL,
        address text NOT NULL,
        city text NOT NULL,
        manager_name text NOT NULL,
        contact_number text NOT NULL,
        contact_email text NOT NULL,
        fssai_number text,
        store_type text NOT NULL DEFAULT 'supermarket',
        selected_categories jsonb DEFAULT '[]'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_product_categories (
        id text PRIMARY KEY,
        name text NOT NULL,
        code text NOT NULL UNIQUE,
        icon text,
        min_temp numeric(5,2),
        max_temp numeric(5,2),
        is_temp_sensitive boolean DEFAULT false,
        target_unit text,
        storage_guidelines text,
        segregation_rules text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_storage_zones (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        name text NOT NULL,
        zone_type text NOT NULL,
        target_temp numeric(5,2),
        min_temp numeric(5,2),
        max_temp numeric(5,2),
        description text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_equipment (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        name text NOT NULL,
        equipment_type text NOT NULL,
        location text NOT NULL,
        target_temp numeric(5,2) NOT NULL,
        min_temp numeric(5,2) NOT NULL,
        max_temp numeric(5,2) NOT NULL,
        responsible_person text NOT NULL,
        active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_receiving_records (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        date_time timestamptz DEFAULT now(),
        supplier text NOT NULL,
        product text NOT NULL,
        product_category text NOT NULL,
        quantity text NOT NULL,
        batch_number text,
        use_by_date date,
        packaging_condition text NOT NULL,
        product_condition text NOT NULL,
        temperature numeric(5,2),
        is_temp_sensitive boolean DEFAULT false,
        receiving_person text NOT NULL,
        decision text NOT NULL CHECK (decision IN ('ACCEPT', 'REJECT', 'HOLD')),
        rejection_reason text,
        evidence_url text,
        inspection_checklist jsonb NOT NULL,
        corrective_action_id text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_receiving_inspections (
        id text PRIMARY KEY,
        receiving_id text NOT NULL REFERENCES grocery_receiving_records(id) ON DELETE CASCADE,
        check_name text NOT NULL,
        passed boolean NOT NULL,
        notes text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_inventory_batches (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        product text NOT NULL,
        category text NOT NULL,
        batch text NOT NULL,
        quantity numeric(10,2) NOT NULL,
        unit text NOT NULL,
        date_received date NOT NULL,
        expiry_date date NOT NULL,
        storage_zone_id text REFERENCES grocery_storage_zones(id) ON DELETE SET NULL,
        storage_zone_name text NOT NULL,
        status text NOT NULL CHECK (status IN ('ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DISPOSED')),
        audit_trail jsonb DEFAULT '[]'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_temperature_logs (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        equipment_id text NOT NULL REFERENCES grocery_equipment(id) ON DELETE CASCADE,
        equipment_name text NOT NULL,
        reading numeric(5,2) NOT NULL,
        status text NOT NULL CHECK (status IN ('GREEN', 'AMBER', 'RED')),
        method text DEFAULT 'probe',
        notes text,
        corrective_action_id text,
        recorded_by text NOT NULL,
        recorded_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_daily_checks (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        check_date date NOT NULL,
        shift text NOT NULL DEFAULT 'morning',
        completed_by text NOT NULL,
        verified_by text,
        overall_status text NOT NULL CHECK (overall_status IN ('COMPLIANT', 'ATTENTION_REQUIRED', 'ACTION_REQUIRED')),
        passed_count integer NOT NULL,
        flagged_count integer NOT NULL,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_daily_check_items (
        id text PRIMARY KEY,
        check_id text NOT NULL REFERENCES grocery_daily_checks(id) ON DELETE CASCADE,
        check_code text NOT NULL,
        category text NOT NULL,
        question text NOT NULL,
        status text NOT NULL CHECK (status IN ('YES', 'NO', 'NA')),
        notes text,
        photo_url text,
        corrective_action_required boolean DEFAULT false,
        corrective_action_id text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS grocery_corrective_actions (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
        title text NOT NULL,
        description text NOT NULL,
        severity text NOT NULL,
        priority text NOT NULL,
        status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'awaiting_verification', 'closed')),
        assigned_to text,
        source_type text NOT NULL,
        source_id text,
        source_check_code text,
        requires_external_service boolean DEFAULT false,
        service_category text,
        created_at timestamptz DEFAULT now(),
        closed_at timestamptz
      );

      CREATE TABLE IF NOT EXISTS grocery_verification_records (
        id text PRIMARY KEY,
        corrective_action_id text NOT NULL REFERENCES grocery_corrective_actions(id) ON DELETE CASCADE,
        result text NOT NULL CHECK (result IN ('verified_effective', 'rejected', 'partially_effective')),
        notes text NOT NULL,
        verified_by text NOT NULL,
        verification_method text NOT NULL,
        verified_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_grocery_zones_outlet ON grocery_storage_zones(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_grocery_equipment_outlet ON grocery_equipment(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_grocery_temp_logs_outlet ON grocery_temperature_logs(outlet_id, recorded_at DESC);
      CREATE INDEX IF NOT EXISTS idx_grocery_receivings_outlet ON grocery_receiving_records(outlet_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_grocery_inventory_outlet ON grocery_inventory_batches(outlet_id, expiry_date ASC);
      CREATE INDEX IF NOT EXISTS idx_grocery_daily_checks_outlet ON grocery_daily_checks(outlet_id, check_date DESC);
      CREATE INDEX IF NOT EXISTS idx_grocery_actions_outlet ON grocery_corrective_actions(outlet_id, status);
    `);

    // Ensure baseline seed outlets exist in PostgreSQL
    const outletCountRows = await pool.query('SELECT count(*)::int as count FROM grocery_outlets');
    if (outletCountRows.rows[0].count === 0) {
      for (const o of SEED_GROCERY_OUTLETS) {
        await pool.query(
          `INSERT INTO grocery_outlets (id, name, branch_name, address, city, manager_name, contact_number, contact_email, fssai_number, store_type, selected_categories, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [o.id, o.name, o.branchName, o.address, o.city, o.managerName, o.contactNumber, o.contactEmail, o.fssaiNumber, o.storeType, JSON.stringify(o.selectedCategories), o.createdAt, o.updatedAt]
        );
      }
      for (const z of SEED_STORAGE_ZONES) {
        await pool.query(
          `INSERT INTO grocery_storage_zones (id, outlet_id, name, zone_type, target_temp, min_temp, max_temp, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [z.id, z.outletId, z.name, z.type, z.targetTemp, z.minTemp, z.maxTemp, z.description]
        );
      }
      for (const eq of SEED_EQUIPMENT) {
        await pool.query(
          `INSERT INTO grocery_equipment (id, outlet_id, name, equipment_type, location, target_temp, min_temp, max_temp, responsible_person, active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [eq.id, eq.outletId, eq.name, eq.type, eq.location, eq.targetTemp, eq.minTemp, eq.maxTemp, eq.responsiblePerson, eq.active, eq.createdAt]
        );
      }
      for (const s of SEED_STOCK_ITEMS) {
        await pool.query(
          `INSERT INTO grocery_inventory_batches (id, outlet_id, product, category, batch, quantity, unit, date_received, expiry_date, storage_zone_id, storage_zone_name, status, audit_trail, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, s.outletId, s.product, s.category, s.batch, s.quantity, s.unit, s.dateReceived, s.expiryDate, s.storageZoneId, s.storageZoneName, s.status, JSON.stringify(s.auditTrail), s.createdAt, s.updatedAt]
        );
      }
    }

    pgSchemaInitialized = true;
    return true;
  } catch (err) {
    console.error('[grocery-store] PostgreSQL schema initialization failed:', err);
    throw err;
  }
}

// ----------------------------------------------------
// EXPLICIT TEST / DEVELOPMENT MOCK ADAPTER
// (Permitted ONLY when DATABASE_URL is unset and NODE_ENV !== 'production')
// ----------------------------------------------------
let mockOutlets: Map<string, GroceryOutlet> | null = null;
let mockZones: Map<string, GroceryStorageZone[]> | null = null;
let mockEquipment: Map<string, GroceryEquipment[]> | null = null;
let mockTempLogs: Map<string, GroceryTemperatureLog[]> | null = null;
let mockStock: Map<string, GroceryStockItem[]> | null = null;
let mockReceivings: Map<string, GroceryReceiving[]> | null = null;
let mockDailyChecks: Map<string, GroceryDailyCheckResult[]> | null = null;

export function _resetMockAdapterForTesting(): void {
  mockOutlets = null;
  mockZones = null;
  mockEquipment = null;
  mockTempLogs = null;
  mockStock = null;
  mockReceivings = null;
  mockDailyChecks = null;
}

function getMockOutlets(): Map<string, GroceryOutlet> {
  if (!mockOutlets) {
    mockOutlets = new Map();
    for (const o of SEED_GROCERY_OUTLETS) mockOutlets.set(o.id, { ...o });
  }
  return mockOutlets;
}

function getMockZones(): Map<string, GroceryStorageZone[]> {
  if (!mockZones) {
    mockZones = new Map();
    for (const z of SEED_STORAGE_ZONES) {
      const list = mockZones.get(z.outletId) || [];
      list.push({ ...z });
      mockZones.set(z.outletId, list);
    }
  }
  return mockZones;
}

function getMockEquipment(): Map<string, GroceryEquipment[]> {
  if (!mockEquipment) {
    mockEquipment = new Map();
    for (const eq of SEED_EQUIPMENT) {
      const list = mockEquipment.get(eq.outletId) || [];
      list.push({ ...eq });
      mockEquipment.set(eq.outletId, list);
    }
  }
  return mockEquipment;
}

function getMockTempLogs(): Map<string, GroceryTemperatureLog[]> {
  if (!mockTempLogs) {
    mockTempLogs = new Map();
    for (const tl of SEED_TEMP_LOGS) {
      const list = mockTempLogs.get(tl.outletId) || [];
      list.push({ ...tl });
      mockTempLogs.set(tl.outletId, list);
    }
  }
  return mockTempLogs;
}

function getMockStock(): Map<string, GroceryStockItem[]> {
  if (!mockStock) {
    mockStock = new Map();
    for (const s of SEED_STOCK_ITEMS) {
      const list = mockStock.get(s.outletId) || [];
      list.push({ ...s });
      mockStock.set(s.outletId, list);
    }
    // Test-only adapter compatibility hook for test-grocery-store-module.ts
    (globalThis as any).__foodsafe_grocery_stock = mockStock;
  }
  return mockStock;
}

function getMockReceivings(): Map<string, GroceryReceiving[]> {
  if (!mockReceivings) {
    mockReceivings = new Map();
    for (const r of SEED_RECEIVINGS) {
      const list = mockReceivings.get(r.outletId) || [];
      list.push({ ...r });
      mockReceivings.set(r.outletId, list);
    }
  }
  return mockReceivings;
}

function getMockDailyChecks(): Map<string, GroceryDailyCheckResult[]> {
  if (!mockDailyChecks) {
    mockDailyChecks = new Map();
  }
  return mockDailyChecks;
}

function initializeMockDefaultZonesAndEquipment(
  outletData: Omit<GroceryOutlet, 'createdAt' | 'updatedAt'>,
  now: string
): void {
  const zonesMap = getMockZones();
  if (!zonesMap.get(outletData.id) || zonesMap.get(outletData.id)!.length === 0) {
    const defaultZones: GroceryStorageZone[] = [
      {
        id: `zone-${outletData.id}-dairy`,
        outletId: outletData.id,
        name: 'Dairy & Milk Chiller',
        type: 'milk_dairy',
        targetTemp: 4,
        minTemp: 1,
        maxTemp: 5,
        description: 'Chilled dairy display'
      },
      {
        id: `zone-${outletData.id}-freezer`,
        outletId: outletData.id,
        name: 'Frozen Food Cabinet',
        type: 'freezer',
        targetTemp: -18,
        minTemp: -24,
        maxTemp: -18,
        description: 'Commercial deep freezer'
      },
      {
        id: `zone-${outletData.id}-dry`,
        outletId: outletData.id,
        name: 'Dry Goods & Staples Aisle',
        type: 'ambient_dry',
        description: 'Ambient shelving off the floor'
      },
      {
        id: `zone-${outletData.id}-quarantine`,
        outletId: outletData.id,
        name: 'Quarantine & Disposal Area',
        type: 'waste_quarantine',
        description: 'Red-tagged damaged/expired items'
      }
    ];
    zonesMap.set(outletData.id, defaultZones);
  }

  const eqMap = getMockEquipment();
  if (!eqMap.get(outletData.id) || eqMap.get(outletData.id)!.length === 0) {
    const defaultEq: GroceryEquipment[] = [
      {
        id: `eq-${outletData.id}-chiller-1`,
        outletId: outletData.id,
        name: 'Main Display Chiller 1',
        type: 'chiller',
        location: 'Sales Floor',
        targetTemp: 4,
        minTemp: 1,
        maxTemp: 5,
        responsiblePerson: outletData.managerName || 'Duty Supervisor',
        active: true,
        createdAt: now
      },
      {
        id: `eq-${outletData.id}-freezer-1`,
        outletId: outletData.id,
        name: 'Main Deep Freezer 1',
        type: 'freezer',
        location: 'Sales Floor',
        targetTemp: -18,
        minTemp: -24,
        maxTemp: -18,
        responsiblePerson: outletData.managerName || 'Duty Supervisor',
        active: true,
        createdAt: now
      }
    ];
    eqMap.set(outletData.id, defaultEq);
  }
}

// ----------------------------------------------------
// OUTLET SERVICES
// ----------------------------------------------------

export async function getGroceryOutletAsync(id: string): Promise<GroceryOutlet | null> {
  if (_simulatePgFailure) handleDatabaseError('getGroceryOutlet', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, name, branch_name as "branchName", address, city, manager_name as "managerName",
                contact_number as "contactNumber", contact_email as "contactEmail", fssai_number as "fssaiNumber",
                store_type as "storeType", selected_categories as "selectedCategories",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM grocery_outlets WHERE id = $1`,
        [id]
      );
      if (!rows[0]) return null;
      const r = rows[0];
      return {
        ...r,
        selectedCategories: Array.isArray(r.selectedCategories) ? r.selectedCategories : JSON.parse(r.selectedCategories || '[]')
      };
    } catch (err: any) {
      handleDatabaseError('getGroceryOutlet', err);
    }
  }

  const entry = getMockOutlets().get(id);
  return entry ? { ...entry } : null;
}

export function getGroceryOutlet(id: string): GroceryOutlet | null {
  const entry = getMockOutlets().get(id);
  return entry ? { ...entry } : null;
}

export async function getAllGroceryOutletsAsync(): Promise<GroceryOutlet[]> {
  if (_simulatePgFailure) handleDatabaseError('getAllGroceryOutlets', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, name, branch_name as "branchName", address, city, manager_name as "managerName",
                contact_number as "contactNumber", contact_email as "contactEmail", fssai_number as "fssaiNumber",
                store_type as "storeType", selected_categories as "selectedCategories",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM grocery_outlets ORDER BY created_at DESC`
      );
      return rows.map(r => ({
        ...r,
        selectedCategories: Array.isArray(r.selectedCategories) ? r.selectedCategories : JSON.parse(r.selectedCategories || '[]')
      }));
    } catch (err: any) {
      handleDatabaseError('getAllGroceryOutlets', err);
    }
  }

  return Array.from(getMockOutlets().values()).map(o => ({ ...o }));
}

export function getAllGroceryOutlets(): GroceryOutlet[] {
  return Array.from(getMockOutlets().values()).map(o => ({ ...o }));
}

export async function saveGroceryOutletAsync(outletData: Omit<GroceryOutlet, 'createdAt' | 'updatedAt'>): Promise<GroceryOutlet> {
  if (_simulatePgFailure) handleDatabaseError('saveGroceryOutlet', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `INSERT INTO grocery_outlets (id, name, branch_name, address, city, manager_name, contact_number, contact_email, fssai_number, store_type, selected_categories, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           branch_name = EXCLUDED.branch_name,
           address = EXCLUDED.address,
           city = EXCLUDED.city,
           manager_name = EXCLUDED.manager_name,
           contact_number = EXCLUDED.contact_number,
           contact_email = EXCLUDED.contact_email,
           fssai_number = EXCLUDED.fssai_number,
           store_type = EXCLUDED.store_type,
           selected_categories = EXCLUDED.selected_categories,
           updated_at = now()
         RETURNING id, name, branch_name as "branchName", address, city, manager_name as "managerName",
                   contact_number as "contactNumber", contact_email as "contactEmail", fssai_number as "fssaiNumber",
                   store_type as "storeType", selected_categories as "selectedCategories",
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [
          outletData.id,
          outletData.name,
          outletData.branchName,
          outletData.address,
          outletData.city,
          outletData.managerName,
          outletData.contactNumber,
          outletData.contactEmail,
          outletData.fssaiNumber || null,
          outletData.storeType,
          JSON.stringify(outletData.selectedCategories || [])
        ]
      );
      const saved = rows[0];

      // Ensure default zones if none exist in PostgreSQL
      const existingZones = await query<{ count: string }>(
        'SELECT count(*)::int as count FROM grocery_storage_zones WHERE outlet_id = $1',
        [outletData.id]
      );
      if (parseInt(existingZones[0]?.count || '0', 10) === 0) {
        const defaultZones: GroceryStorageZone[] = [
          {
            id: `zone-${outletData.id}-dairy`,
            outletId: outletData.id,
            name: 'Dairy & Milk Chiller',
            type: 'milk_dairy',
            targetTemp: 4,
            minTemp: 1,
            maxTemp: 5,
            description: 'Chilled dairy display'
          },
          {
            id: `zone-${outletData.id}-freezer`,
            outletId: outletData.id,
            name: 'Frozen Food Cabinet',
            type: 'freezer',
            targetTemp: -18,
            minTemp: -24,
            maxTemp: -18,
            description: 'Commercial deep freezer'
          },
          {
            id: `zone-${outletData.id}-dry`,
            outletId: outletData.id,
            name: 'Dry Goods & Staples Aisle',
            type: 'ambient_dry',
            description: 'Ambient shelving off the floor'
          },
          {
            id: `zone-${outletData.id}-quarantine`,
            outletId: outletData.id,
            name: 'Quarantine & Disposal Area',
            type: 'waste_quarantine',
            description: 'Red-tagged damaged/expired items'
          }
        ];
        for (const z of defaultZones) {
          await query(
            `INSERT INTO grocery_storage_zones (id, outlet_id, name, zone_type, target_temp, min_temp, max_temp, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            [z.id, z.outletId, z.name, z.type, z.targetTemp || null, z.minTemp || null, z.maxTemp || null, z.description || null]
          );
        }
      }

      const existingEq = await query<{ count: string }>(
        'SELECT count(*)::int as count FROM grocery_equipment WHERE outlet_id = $1',
        [outletData.id]
      );
      if (parseInt(existingEq[0]?.count || '0', 10) === 0) {
        const defaultEq: GroceryEquipment[] = [
          {
            id: `eq-${outletData.id}-chiller-1`,
            outletId: outletData.id,
            name: 'Main Display Chiller 1',
            type: 'chiller',
            location: 'Sales Floor',
            targetTemp: 4,
            minTemp: 1,
            maxTemp: 5,
            responsiblePerson: outletData.managerName || 'Duty Supervisor',
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: `eq-${outletData.id}-freezer-1`,
            outletId: outletData.id,
            name: 'Main Deep Freezer 1',
            type: 'freezer',
            location: 'Sales Floor',
            targetTemp: -18,
            minTemp: -24,
            maxTemp: -18,
            responsiblePerson: outletData.managerName || 'Duty Supervisor',
            active: true,
            createdAt: new Date().toISOString()
          }
        ];
        for (const eq of defaultEq) {
          await query(
            `INSERT INTO grocery_equipment (id, outlet_id, name, equipment_type, location, target_temp, min_temp, max_temp, responsible_person, active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now()) ON CONFLICT (id) DO NOTHING`,
            [eq.id, eq.outletId, eq.name, eq.type, eq.location, eq.targetTemp, eq.minTemp, eq.maxTemp, eq.responsiblePerson, eq.active]
          );
        }
      }

      return {
        ...saved,
        selectedCategories: Array.isArray(saved.selectedCategories) ? saved.selectedCategories : JSON.parse(saved.selectedCategories || '[]')
      };
    } catch (err: any) {
      handleDatabaseError('saveGroceryOutlet', err);
    }
  }

  // Development / Test Mock
  const map = getMockOutlets();
  const now = new Date().toISOString();
  const existing = map.get(outletData.id);
  const updated: GroceryOutlet = {
    ...outletData,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };
  map.set(outletData.id, updated);
  initializeMockDefaultZonesAndEquipment(outletData, now);
  return { ...updated };
}

export function saveGroceryOutlet(outletData: Omit<GroceryOutlet, 'createdAt' | 'updatedAt'>): GroceryOutlet {
  const map = getMockOutlets();
  const now = new Date().toISOString();
  const existing = map.get(outletData.id);
  const updated: GroceryOutlet = {
    ...outletData,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };
  map.set(outletData.id, updated);
  initializeMockDefaultZonesAndEquipment(outletData, now);
  return { ...updated };
}

// ----------------------------------------------------
// STORAGE ZONES SERVICES
// ----------------------------------------------------

export async function getStorageZonesAsync(outletId: string): Promise<GroceryStorageZone[]> {
  if (_simulatePgFailure) handleDatabaseError('getStorageZones', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, outlet_id as "outletId", name, zone_type as "type",
                target_temp as "targetTemp", min_temp as "minTemp", max_temp as "maxTemp", description
         FROM grocery_storage_zones WHERE outlet_id = $1 ORDER BY name ASC`,
        [outletId]
      );
      return rows;
    } catch (err: any) {
      handleDatabaseError('getStorageZones', err);
    }
  }

  const map = getMockZones();
  return (map.get(outletId) || []).map(z => ({ ...z }));
}

export function getStorageZones(outletId: string): GroceryStorageZone[] {
  const map = getMockZones();
  return (map.get(outletId) || []).map(z => ({ ...z }));
}

export async function saveStorageZoneAsync(zone: Omit<GroceryStorageZone, 'id'> & { id?: string }): Promise<GroceryStorageZone> {
  if (_simulatePgFailure) handleDatabaseError('saveStorageZone', new Error('Simulated database disconnect'));

  const id = zone.id || `zone-${zone.outletId}-${Date.now()}`;
  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `INSERT INTO grocery_storage_zones (id, outlet_id, name, zone_type, target_temp, min_temp, max_temp, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           zone_type = EXCLUDED.zone_type,
           target_temp = EXCLUDED.target_temp,
           min_temp = EXCLUDED.min_temp,
           max_temp = EXCLUDED.max_temp,
           description = EXCLUDED.description
         RETURNING id, outlet_id as "outletId", name, zone_type as "type",
                   target_temp as "targetTemp", min_temp as "minTemp", max_temp as "maxTemp", description`,
        [id, zone.outletId, zone.name, zone.type, zone.targetTemp ?? null, zone.minTemp ?? null, zone.maxTemp ?? null, zone.description || '']
      );
      return rows[0];
    } catch (err: any) {
      handleDatabaseError('saveStorageZone', err);
    }
  }

  const map = getMockZones();
  const list = map.get(zone.outletId) || [];
  const record: GroceryStorageZone = { ...zone, id };
  const idx = list.findIndex(z => z.id === id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  map.set(zone.outletId, list);
  return { ...record };
}

export function saveStorageZone(zone: Omit<GroceryStorageZone, 'id'> & { id?: string }): GroceryStorageZone {
  const id = zone.id || `zone-${zone.outletId}-${Date.now()}`;
  const map = getMockZones();
  const list = map.get(zone.outletId) || [];
  const record: GroceryStorageZone = { ...zone, id };
  const idx = list.findIndex(z => z.id === id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  map.set(zone.outletId, list);
  return { ...record };
}

export function checkStorageSegregationRules(outletId: string): SegregationRuleCheck[] {
  const stock = getStockItems(outletId);
  const zones = getStorageZones(outletId);
  const warnings: SegregationRuleCheck[] = [];

  const stockList = Array.isArray(stock) ? stock : [];
  const zoneList = Array.isArray(zones) ? zones : [];

  const zoneStockMap = new Map<string, GroceryStockItem[]>();
  for (const s of stockList.filter((item: any) => item.status !== 'DISPOSED')) {
    const list = zoneStockMap.get(s.storageZoneId) || [];
    list.push(s);
    zoneStockMap.set(s.storageZoneId, list);
  }

  zoneStockMap.forEach((items: GroceryStockItem[], zoneId: string) => {
    const zone = zoneList.find((z: any) => z.id === zoneId);
    const zoneName = zone ? zone.name : zoneId;

    const hasRawMeat = items.some((i: GroceryStockItem) => i.category === 'meat_fresh' || i.category === 'seafood_fresh');
    const hasReadyToEat = items.some((i: GroceryStockItem) => i.category === 'cut_produce' || i.category === 'dairy_milk' || i.category === 'bakery_packaged');

    if (hasRawMeat && hasReadyToEat && zone?.type !== 'waste_quarantine') {
      warnings.push({
        id: `seg-raw-rte-${zoneId}`,
        zoneId,
        zoneName,
        issue: 'Potential cross-contamination risk: Raw meat or seafood is stored in the same zone alongside ready-to-eat / dairy items.',
        severity: 'RED',
        actionRequired: 'Immediately segregate raw meat into a dedicated cold zone or place it on the lowest shelf below ready-to-eat foods.'
      });
    }

    if (zone?.type === 'chemical_storage' && items.length > 0) {
      warnings.push({
        id: `seg-chem-food-${zoneId}`,
        zoneId,
        zoneName,
        issue: 'Severe chemical contamination hazard: Food inventory items are currently stored inside the cleaning chemicals storage zone.',
        severity: 'RED',
        actionRequired: 'Immediately remove all edible products from the chemical storage locker and inspect for chemical odors/staining.'
      });
    }

    const hasActiveExpired = items.some((i: GroceryStockItem) => (i.status === 'EXPIRED') && zone?.type !== 'waste_quarantine');
    if (hasActiveExpired) {
      warnings.push({
        id: `seg-expired-shelf-${zoneId}`,
        zoneId,
        zoneName,
        issue: 'Expired products detected in active display/sales zone.',
        severity: 'RED',
        actionRequired: 'Remove all expired items immediately and transfer them to the Red Quarantine Area to prevent accidental sale.'
      });
    }
  });

  return warnings;
}

// ----------------------------------------------------
// EQUIPMENT SERVICES
// ----------------------------------------------------

export async function getGroceryEquipmentListAsync(outletId: string): Promise<GroceryEquipment[]> {
  if (_simulatePgFailure) handleDatabaseError('getGroceryEquipmentList', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, outlet_id as "outletId", name, equipment_type as "type", location,
                target_temp as "targetTemp", min_temp as "minTemp", max_temp as "maxTemp",
                responsible_person as "responsiblePerson", active, created_at as "createdAt"
         FROM grocery_equipment WHERE outlet_id = $1 ORDER BY name ASC`,
        [outletId]
      );
      return rows;
    } catch (err: any) {
      handleDatabaseError('getGroceryEquipmentList', err);
    }
  }

  const map = getMockEquipment();
  return (map.get(outletId) || []).map(eq => ({ ...eq }));
}

export function getGroceryEquipmentList(outletId: string): GroceryEquipment[] {
  const map = getMockEquipment();
  return (map.get(outletId) || []).map(eq => ({ ...eq }));
}

export async function saveGroceryEquipmentAsync(eq: Omit<GroceryEquipment, 'id' | 'createdAt'> & { id?: string }): Promise<GroceryEquipment> {
  if (_simulatePgFailure) handleDatabaseError('saveGroceryEquipment', new Error('Simulated database disconnect'));

  const id = eq.id || `eq-${eq.outletId}-${Date.now()}`;
  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `INSERT INTO grocery_equipment (id, outlet_id, name, equipment_type, location, target_temp, min_temp, max_temp, responsible_person, active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           equipment_type = EXCLUDED.equipment_type,
           location = EXCLUDED.location,
           target_temp = EXCLUDED.target_temp,
           min_temp = EXCLUDED.min_temp,
           max_temp = EXCLUDED.max_temp,
           responsible_person = EXCLUDED.responsible_person,
           active = EXCLUDED.active
         RETURNING id, outlet_id as "outletId", name, equipment_type as "type", location,
                   target_temp as "targetTemp", min_temp as "minTemp", max_temp as "maxTemp",
                   responsible_person as "responsiblePerson", active, created_at as "createdAt"`,
        [id, eq.outletId, eq.name, eq.type, eq.location, eq.targetTemp, eq.minTemp, eq.maxTemp, eq.responsiblePerson, eq.active !== false]
      );
      return rows[0];
    } catch (err: any) {
      handleDatabaseError('saveGroceryEquipment', err);
    }
  }

  const map = getMockEquipment();
  const list = map.get(eq.outletId) || [];
  const now = new Date().toISOString();
  const record: GroceryEquipment = { ...eq, id, createdAt: now };
  const idx = list.findIndex(e => e.id === id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  map.set(eq.outletId, list);
  return { ...record };
}

export function saveGroceryEquipment(eq: Omit<GroceryEquipment, 'id' | 'createdAt'> & { id?: string }): GroceryEquipment {
  const id = eq.id || `eq-${eq.outletId}-${Date.now()}`;
  const map = getMockEquipment();
  const list = map.get(eq.outletId) || [];
  const now = new Date().toISOString();
  const record: GroceryEquipment = { ...eq, id, createdAt: now };
  const idx = list.findIndex(e => e.id === id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  map.set(eq.outletId, list);
  return { ...record };
}

export function evaluateTemperatureStatus(
  reading: number,
  targetTemp: number,
  minTemp: number,
  maxTemp: number
): TemperatureStatus {
  if (reading >= minTemp && reading <= maxTemp) {
    if (maxTemp - reading <= 1.0) {
      return 'AMBER';
    }
    return 'GREEN';
  } else if (reading > maxTemp && reading <= maxTemp + 1.5) {
    return 'AMBER';
  } else {
    return 'RED';
  }
}

// ----------------------------------------------------
// TEMPERATURE LOGS SERVICES
// ----------------------------------------------------

export async function recordTemperatureLogAsync(logInput: {
  outletId: string;
  equipmentId: string;
  reading: number;
  recordedBy: string;
  method?: 'manual' | 'probe';
  notes?: string;
}): Promise<{ log: GroceryTemperatureLog; alert?: GroceryAlert; actionCreated?: boolean }> {
  if (_simulatePgFailure) handleDatabaseError('recordTemperatureLog', new Error('Simulated database disconnect'));

  const eqList = await getGroceryEquipmentListAsync(logInput.outletId);
  const eq = eqList.find(e => e.id === logInput.equipmentId);
  if (!eq) {
    throw new Error(`Equipment with ID ${logInput.equipmentId} not found`);
  }

  const status = evaluateTemperatureStatus(logInput.reading, eq.targetTemp, eq.minTemp, eq.maxTemp);
  const id = `tmplog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  let correctiveActionId: string | undefined;

  if (status === 'RED') {
    if (isGroceryPostgresMode()) {
      const actId = `act-temp-${Date.now()}`;
      await query(
        `INSERT INTO grocery_corrective_actions (id, outlet_id, title, description, severity, priority, status, assigned_to, source_type, source_id, requires_external_service, service_category, created_at)
         VALUES ($1, $2, $3, $4, 'high', 'high', 'open', $5, 'temperature_check', $6, true, 'refrigeration', now())`,
        [
          actId,
          logInput.outletId,
          `Temperature deviation: ${eq.name}`,
          `Reading of ${logInput.reading}°C exceeded limit (${eq.maxTemp}°C). Chiller unit overhaul required.`,
          logInput.recordedBy,
          eq.id
        ]
      );
      correctiveActionId = actId;
    } else {
      const action = createDemoAction(
        {
          title: `Temperature deviation: ${eq.name}`,
          description: `Reading of ${logInput.reading}°C exceeded maximum limit (${eq.maxTemp}°C). Protect affected foods.`,
          severity: 'high',
          priority: 'high',
          outletId: logInput.outletId,
          sourceType: 'temperature_check',
          sourceId: eq.id,
          requiresExternalService: true,
          serviceCategory: 'refrigeration',
          responsiblePerson: logInput.recordedBy
        },
        logInput.recordedBy
      );
      correctiveActionId = action.id;
    }
  }

  const logRecord: GroceryTemperatureLog = {
    id,
    outletId: logInput.outletId,
    equipmentId: logInput.equipmentId,
    equipmentName: eq.name,
    reading: logInput.reading,
    status,
    method: logInput.method || 'probe',
    notes: logInput.notes,
    correctiveActionId,
    recordedBy: logInput.recordedBy,
    recordedAt: now
  };

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      await query(
        `INSERT INTO grocery_temperature_logs (id, outlet_id, equipment_id, equipment_name, reading, status, method, notes, corrective_action_id, recorded_by, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, logInput.outletId, logInput.equipmentId, eq.name, logInput.reading, status, logInput.method || 'probe', logInput.notes || null, correctiveActionId || null, logInput.recordedBy, now]
      );
    } catch (err: any) {
      handleDatabaseError('recordTemperatureLog', err);
    }
  } else {
    const map = getMockTempLogs();
    const list = map.get(logInput.outletId) || [];
    list.unshift(logRecord);
    map.set(logInput.outletId, list);
  }

  const alert: GroceryAlert | undefined = status !== 'GREEN' ? {
    id: `alt-${id}`,
    outletId: logInput.outletId,
    type: 'TEMP_BREACH',
    severity: status,
    title: `${status === 'RED' ? 'Critical Breach' : 'Warning'}: ${eq.name}`,
    description: `Temperature reading ${logInput.reading}°C is out of target range [${eq.minTemp}°C to ${eq.maxTemp}°C]`,
    entityId: eq.id,
    entityType: 'equipment',
    requiresAction: status === 'RED',
    status: 'OPEN',
    createdAt: now
  } : undefined;

  return { log: logRecord, alert, actionCreated: Boolean(correctiveActionId) };
}

export function recordTemperatureLog(logInput: {
  outletId: string;
  equipmentId: string;
  reading: number;
  recordedBy: string;
  method?: 'manual' | 'probe';
  notes?: string;
}): { log: GroceryTemperatureLog; alert?: GroceryAlert; actionCreated: boolean } {
  const eqList = getGroceryEquipmentList(logInput.outletId);
  const eq = eqList.find((e: any) => e.id === logInput.equipmentId);
  if (!eq) throw new Error(`Equipment with ID ${logInput.equipmentId} not found`);

  const status = evaluateTemperatureStatus(logInput.reading, eq.targetTemp, eq.minTemp, eq.maxTemp);
  const id = `tmplog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  let correctiveActionId: string | undefined;

  if (status === 'RED') {
    const action = createDemoAction(
      {
        title: `Temperature deviation: ${eq.name}`,
        description: `Reading of ${logInput.reading}°C exceeded maximum limit (${eq.maxTemp}°C).`,
        severity: 'high',
        priority: 'high',
        outletId: logInput.outletId,
        sourceType: 'temperature_check',
        sourceId: eq.id,
        requiresExternalService: true,
        serviceCategory: 'refrigeration',
        responsiblePerson: logInput.recordedBy
      },
      logInput.recordedBy
    );
    correctiveActionId = action.id;
  }

  const logRecord: GroceryTemperatureLog = {
    id,
    outletId: logInput.outletId,
    equipmentId: logInput.equipmentId,
    equipmentName: eq.name,
    reading: logInput.reading,
    status,
    method: logInput.method || 'probe',
    notes: logInput.notes,
    correctiveActionId,
    recordedBy: logInput.recordedBy,
    recordedAt: now
  };

  const map = getMockTempLogs();
  const list = map.get(logInput.outletId) || [];
  list.unshift(logRecord);
  map.set(logInput.outletId, list);

  const alert: GroceryAlert | undefined = status !== 'GREEN' ? {
    id: `alt-${id}`,
    outletId: logInput.outletId,
    type: 'TEMP_BREACH',
    severity: status,
    title: `${status === 'RED' ? 'Critical Breach' : 'Warning'}: ${eq.name}`,
    description: `Temperature reading ${logInput.reading}°C out of range`,
    entityId: eq.id,
    entityType: 'equipment',
    requiresAction: status === 'RED',
    status: 'OPEN',
    createdAt: now
  } : undefined;

  return { log: logRecord, alert, actionCreated: Boolean(correctiveActionId) };
}

export async function getTemperatureLogsAsync(outletId: string, limit = 50): Promise<GroceryTemperatureLog[]> {
  if (_simulatePgFailure) handleDatabaseError('getTemperatureLogs', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, outlet_id as "outletId", equipment_id as "equipmentId", equipment_name as "equipmentName",
                reading, status, method, notes, corrective_action_id as "correctiveActionId",
                recorded_by as "recordedBy", recorded_at as "recordedAt"
         FROM grocery_temperature_logs WHERE outlet_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
        [outletId, limit]
      );
      return rows;
    } catch (err: any) {
      handleDatabaseError('getTemperatureLogs', err);
    }
  }

  const map = getMockTempLogs();
  return (map.get(outletId) || []).slice(0, limit).map(t => ({ ...t }));
}

export function getTemperatureLogs(outletId: string, limit = 50): GroceryTemperatureLog[] {
  const map = getMockTempLogs();
  return (map.get(outletId) || []).slice(0, limit).map(t => ({ ...t }));
}

// ----------------------------------------------------
// RECEIVING SERVICES
// ----------------------------------------------------

export async function getReceivingLogsAsync(outletId: string): Promise<GroceryReceiving[]> {
  if (_simulatePgFailure) handleDatabaseError('getReceivingLogs', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, outlet_id as "outletId", date_time as "dateTime", supplier, product,
                product_category as "productCategory", quantity, batch_number as "batchNumber",
                use_by_date as "useByDate", packaging_condition as "packagingCondition",
                product_condition as "productCondition", temperature, is_temp_sensitive as "isTempSensitive",
                receiving_person as "receivingPerson", decision, rejection_reason as "rejectionReason",
                evidence_url as "evidenceUrl", inspection_checklist as "inspectionChecklist",
                corrective_action_id as "correctiveActionId", created_at as "createdAt"
         FROM grocery_receiving_records WHERE outlet_id = $1 ORDER BY date_time DESC`,
        [outletId]
      );
      return rows.map(r => ({
        ...r,
        inspectionChecklist: typeof r.inspectionChecklist === 'string' ? JSON.parse(r.inspectionChecklist) : r.inspectionChecklist
      }));
    } catch (err: any) {
      handleDatabaseError('getReceivingLogs', err);
    }
  }

  const map = getMockReceivings();
  return (map.get(outletId) || []).map(r => ({ ...r }));
}

export function getReceivingLogs(outletId: string): GroceryReceiving[] {
  const map = getMockReceivings();
  return (map.get(outletId) || []).map(r => ({ ...r }));
}

export async function recordReceivingItemAsync(input: {
  outletId: string;
  dateTime?: string;
  supplier: string;
  product: string;
  productCategory: string;
  quantity: string;
  batchNumber?: string;
  useByDate?: string;
  packagingCondition: 'intact' | 'damaged' | 'leaking' | 'crushed' | 'compromised';
  productCondition: 'acceptable' | 'spoiled' | 'discolored' | 'off_odor' | 'pest_evident' | 'substandard';
  temperature?: number;
  isTempSensitive: boolean;
  receivingPerson: string;
  decision: 'ACCEPT' | 'HOLD' | 'REJECT';
  rejectionReason?: string;
  evidenceUrl?: string;
  inspectionChecklist: any;
}): Promise<{ receiving: GroceryReceiving; stockCreated?: GroceryStockItem; actionCreated?: boolean }> {
  if (_simulatePgFailure) handleDatabaseError('recordReceivingItem', new Error('Simulated database disconnect'));

  const now = new Date().toISOString();
  const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let correctiveActionId: string | undefined;

  if (input.decision === 'REJECT' || input.decision === 'HOLD') {
    if (isGroceryPostgresMode()) {
      const actId = `act-rec-${Date.now()}`;
      await query(
        `INSERT INTO grocery_corrective_actions (id, outlet_id, title, description, severity, priority, status, assigned_to, source_type, source_id, requires_external_service, service_category, created_at)
         VALUES ($1, $2, $3, $4, $5, 'high', 'open', $6, 'receiving_inspection', $7, false, null, now())`,
        [
          actId,
          input.outletId,
          `Receiving exception: ${input.product} (${input.decision})`,
          `Shipment rejected/held from supplier ${input.supplier}. Reason: ${input.rejectionReason || 'Inspection criteria failed'}.`,
          input.decision === 'REJECT' ? 'high' : 'medium',
          input.receivingPerson,
          id
        ]
      );
      correctiveActionId = actId;
    } else {
      const action = createDemoAction(
        {
          title: `Receiving exception: ${input.product} (${input.decision})`,
          description: `Shipment rejected/held from supplier ${input.supplier}. Reason: ${input.rejectionReason || 'Inspection criteria failed'}.`,
          severity: input.decision === 'REJECT' ? 'high' : 'medium',
          priority: 'high',
          outletId: input.outletId,
          sourceType: 'receiving_inspection',
          sourceId: id,
          sourceCheckCode: 'GR22-09',
          requiresExternalService: false,
          responsiblePerson: input.receivingPerson,
          status: 'open'
        },
        input.receivingPerson
      );
      correctiveActionId = action.id;
    }
  }

  const record: GroceryReceiving = {
    id,
    outletId: input.outletId,
    dateTime: input.dateTime || now,
    supplier: input.supplier,
    product: input.product,
    productCategory: input.productCategory,
    quantity: input.quantity,
    batchNumber: input.batchNumber,
    useByDate: input.useByDate,
    packagingCondition: input.packagingCondition,
    productCondition: input.productCondition,
    temperature: input.temperature,
    isTempSensitive: input.isTempSensitive,
    receivingPerson: input.receivingPerson,
    decision: input.decision,
    rejectionReason: input.rejectionReason,
    evidenceUrl: input.evidenceUrl,
    inspectionChecklist: input.inspectionChecklist,
    correctiveActionId,
    createdAt: now
  };

  let stockCreated: GroceryStockItem | undefined;
  if (input.decision === 'ACCEPT') {
    const zones = await getStorageZonesAsync(input.outletId);
    const categoryToZoneType: Record<string, string[]> = {
      dairy_milk: ['milk_dairy', 'dairy', 'chiller'],
      meat_fresh: ['meat_chicken', 'meat', 'chiller'],
      seafood_fresh: ['fish_seafood', 'seafood', 'chiller'],
      frozen_foods: ['freezer'],
      produce_fresh: ['fresh_produce', 'ambient_dry'],
      cut_produce: ['milk_dairy', 'fresh_produce', 'chiller'],
      bakery_packaged: ['ambient_dry'],
      dry_staples: ['ambient_dry'],
      temp_sensitive_other: ['milk_dairy', 'chiller'],
      other_packaged: ['ambient_dry']
    };

    const targetTypes = categoryToZoneType[input.productCategory] || [input.productCategory, 'ambient_dry'];
    let matchedZone = zones.find(z => targetTypes.includes(z.type));
    if (!matchedZone) {
      matchedZone = zones.find(z => z.type === 'ambient_dry') || (zones.length > 0 ? zones[0] : undefined);
    }

    const defaultFallbackZone: GroceryStorageZone = {
      id: `zone-${input.outletId}-inward`,
      outletId: input.outletId,
      name: 'Receiving Inward Storage',
      type: 'ambient_dry',
      description: 'Receiving dock inward temporary storage'
    };
    const finalZone = matchedZone || defaultFallbackZone;

    let expiry = input.useByDate;
    if (expiry) {
      const trimmed = expiry.trim();
      const partsSlash = trimmed.split('/');
      if (partsSlash.length === 3) {
        // DD/MM/YYYY or D/M/YYYY
        expiry = `${partsSlash[2]}-${partsSlash[1].padStart(2, '0')}-${partsSlash[0].padStart(2, '0')}`;
      } else {
        const partsDash = trimmed.split('-');
        if (partsDash.length === 3 && partsDash[2].length === 4) {
          // DD-MM-YYYY
          expiry = `${partsDash[2]}-${partsDash[1].padStart(2, '0')}-${partsDash[0].padStart(2, '0')}`;
        }
      }
    } else {
      expiry = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
    }

    const qtyNum = parseInt(input.quantity.replace(/\D/g, ''), 10) || 1;
    const stockId = `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    stockCreated = {
      id: stockId,
      outletId: input.outletId,
      product: input.product,
      category: input.productCategory,
      batch: input.batchNumber || `LOT-${Date.now().toString().slice(-4)}`,
      quantity: qtyNum,
      unit: input.quantity.replace(/[0-9]/g, '').trim() || 'units',
      dateReceived: now.slice(0, 10),
      expiryDate: expiry,
      storageZoneId: finalZone.id,
      storageZoneName: finalZone.name,
      status: 'ACTIVE',
      auditTrail: [
        {
          timestamp: now,
          action: 'RECEIVED_AND_ACCEPTED',
          user: input.receivingPerson,
          details: `Accepted from ${input.supplier} and assigned to ${finalZone.name}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }

  // Normalize use_by_date for PostgreSQL DATE column (YYYY-MM-DD or null)
  let normalizedPgUseByDate: string | null = null;
  if (input.useByDate) {
    const trimmed = input.useByDate.trim();
    const partsSlash = trimmed.split('/');
    if (partsSlash.length === 3) {
      normalizedPgUseByDate = `${partsSlash[2]}-${partsSlash[1].padStart(2, '0')}-${partsSlash[0].padStart(2, '0')}`;
    } else {
      const partsDash = trimmed.split('-');
      if (partsDash.length === 3 && partsDash[2].length === 4) {
        normalizedPgUseByDate = `${partsDash[2]}-${partsDash[1].padStart(2, '0')}-${partsDash[0].padStart(2, '0')}`;
      } else if (partsDash.length === 3 && partsDash[0].length === 4) {
        normalizedPgUseByDate = trimmed;
      } else {
        normalizedPgUseByDate = trimmed;
      }
    }
  }

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      await query(
        `INSERT INTO grocery_receiving_records (id, outlet_id, date_time, supplier, product, product_category, quantity, batch_number, use_by_date, packaging_condition, product_condition, temperature, is_temp_sensitive, receiving_person, decision, rejection_reason, evidence_url, inspection_checklist, corrective_action_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          id, input.outletId, record.dateTime, input.supplier, input.product, input.productCategory,
          input.quantity, input.batchNumber || null, normalizedPgUseByDate, input.packagingCondition,
          input.productCondition, input.temperature ?? null, input.isTempSensitive, input.receivingPerson,
          input.decision, input.rejectionReason || null, input.evidenceUrl || null,
          JSON.stringify(input.inspectionChecklist), correctiveActionId || null, now
        ]
      );
      if (stockCreated) {
        await query(
          `INSERT INTO grocery_inventory_batches (id, outlet_id, product, category, batch, quantity, unit, date_received, expiry_date, storage_zone_id, storage_zone_name, status, audit_trail, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            stockCreated.id, stockCreated.outletId, stockCreated.product, stockCreated.category, stockCreated.batch,
            stockCreated.quantity, stockCreated.unit, stockCreated.dateReceived, stockCreated.expiryDate,
            stockCreated.storageZoneId, stockCreated.storageZoneName, stockCreated.status,
            JSON.stringify(stockCreated.auditTrail), stockCreated.createdAt, stockCreated.updatedAt
          ]
        );
      }
    } catch (err: any) {
      handleDatabaseError('recordReceivingItem', err);
    }
  } else {
    const map = getMockReceivings();
    const list = map.get(input.outletId) || [];
    list.unshift(record);
    map.set(input.outletId, list);

    if (stockCreated) {
      const stockMap = getMockStock();
      const currentStock = stockMap.get(input.outletId) || [];
      currentStock.unshift(stockCreated);
      stockMap.set(input.outletId, currentStock);
    }
  }

  return { receiving: { ...record }, stockCreated, actionCreated: Boolean(correctiveActionId) };
}

export function recordReceivingItem(input: {
  outletId: string;
  dateTime?: string;
  supplier: string;
  product: string;
  productCategory: string;
  quantity: string;
  batchNumber?: string;
  useByDate?: string;
  packagingCondition: 'intact' | 'damaged' | 'leaking' | 'crushed' | 'compromised';
  productCondition: 'acceptable' | 'spoiled' | 'discolored' | 'off_odor' | 'pest_evident' | 'substandard';
  temperature?: number;
  isTempSensitive: boolean;
  receivingPerson: string;
  decision: 'ACCEPT' | 'HOLD' | 'REJECT';
  rejectionReason?: string;
  evidenceUrl?: string;
  inspectionChecklist: {
    approvedSupplier: boolean;
    acceptableCondition: boolean;
    packagingIntact: boolean;
    noLeakageOrDamage: boolean;
    dateMarkingAcceptable: boolean;
    temperatureAppropriate: boolean;
    suitableForStorage: boolean;
    withinCapacity: boolean;
  };
}): { receiving: GroceryReceiving; stockCreated?: GroceryStockItem; actionCreated?: any } {

  const now = new Date().toISOString();
  const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let correctiveActionId: string | undefined;

  if (input.decision === 'REJECT' || input.decision === 'HOLD') {
    const action = createDemoAction(
      {
        title: `Receiving exception: ${input.product} (${input.decision})`,
        description: `Shipment rejected/held from supplier ${input.supplier}.`,
        severity: input.decision === 'REJECT' ? 'high' : 'medium',
        priority: 'high',
        outletId: input.outletId,
        sourceType: 'receiving_inspection',
        sourceId: id,
        sourceCheckCode: 'GR22-09',
        requiresExternalService: false,
        responsiblePerson: input.receivingPerson,
        status: 'open'
      },
      input.receivingPerson
    );
    correctiveActionId = action.id;
  }

  const record: GroceryReceiving = {
    id,
    outletId: input.outletId,
    dateTime: input.dateTime || now,
    supplier: input.supplier,
    product: input.product,
    productCategory: input.productCategory,
    quantity: input.quantity,
    batchNumber: input.batchNumber,
    useByDate: input.useByDate,
    packagingCondition: input.packagingCondition,
    productCondition: input.productCondition,
    temperature: input.temperature,
    isTempSensitive: input.isTempSensitive,
    receivingPerson: input.receivingPerson,
    decision: input.decision,
    rejectionReason: input.rejectionReason,
    evidenceUrl: input.evidenceUrl,
    inspectionChecklist: input.inspectionChecklist,
    correctiveActionId,
    createdAt: now
  };

  const map = getMockReceivings();
  const list = map.get(input.outletId) || [];
  list.unshift(record);
  map.set(input.outletId, list);

  let stockCreated: GroceryStockItem | undefined;
  if (input.decision === 'ACCEPT') {
    const zones = getStorageZones(input.outletId);
    const categoryToZoneType: Record<string, string[]> = {
      dairy_milk: ['milk_dairy', 'dairy', 'chiller'],
      meat_fresh: ['meat_chicken', 'meat', 'chiller'],
      seafood_fresh: ['fish_seafood', 'seafood', 'chiller'],
      frozen_foods: ['freezer'],
      produce_fresh: ['fresh_produce', 'ambient_dry'],
      cut_produce: ['milk_dairy', 'fresh_produce', 'chiller'],
      bakery_packaged: ['ambient_dry'],
      dry_staples: ['ambient_dry'],
      temp_sensitive_other: ['milk_dairy', 'chiller'],
      other_packaged: ['ambient_dry']
    };

    const targetTypes = categoryToZoneType[input.productCategory] || [input.productCategory, 'ambient_dry'];
    let matchedZone = zones.find(z => targetTypes.includes(z.type));
    if (!matchedZone) {
      matchedZone = zones.find(z => z.type === 'ambient_dry') || (zones.length > 0 ? zones[0] : undefined);
    }

    const defaultFallbackZone: GroceryStorageZone = {
      id: `zone-${input.outletId}-inward`,
      outletId: input.outletId,
      name: 'Receiving Inward Storage',
      type: 'ambient_dry',
      description: 'Receiving dock inward temporary storage'
    };
    const finalZone = matchedZone || defaultFallbackZone;

    let expiry = input.useByDate;
    if (expiry) {
      const trimmed = expiry.trim();
      const partsSlash = trimmed.split('/');
      if (partsSlash.length === 3) {
        expiry = `${partsSlash[2]}-${partsSlash[1].padStart(2, '0')}-${partsSlash[0].padStart(2, '0')}`;
      } else {
        const partsDash = trimmed.split('-');
        if (partsDash.length === 3 && partsDash[2].length === 4) {
          expiry = `${partsDash[2]}-${partsDash[1].padStart(2, '0')}-${partsDash[0].padStart(2, '0')}`;
        }
      }
    } else {
      expiry = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
    }

    const qtyNum = parseInt(input.quantity.replace(/\D/g, ''), 10) || 1;
    const stockId = `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    stockCreated = {
      id: stockId,
      outletId: input.outletId,
      product: input.product,
      category: input.productCategory,
      batch: input.batchNumber || `LOT-${Date.now().toString().slice(-4)}`,
      quantity: qtyNum,
      unit: input.quantity.replace(/[0-9]/g, '').trim() || 'units',
      dateReceived: now.slice(0, 10),
      expiryDate: expiry,
      storageZoneId: finalZone.id,
      storageZoneName: finalZone.name,
      status: 'ACTIVE',
      auditTrail: [
        {
          timestamp: now,
          action: 'RECEIVED_AND_ACCEPTED',
          user: input.receivingPerson,
          details: `Accepted from ${input.supplier} and assigned to ${finalZone.name}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    const stockMap = getMockStock();
    const currentStock = stockMap.get(input.outletId) || [];
    currentStock.unshift(stockCreated);
    stockMap.set(input.outletId, currentStock);
  }

  return { receiving: { ...record }, stockCreated, actionCreated: Boolean(correctiveActionId) };
}

// ----------------------------------------------------
// FIFO / FEFO INVENTORY STOCK SERVICES
// ----------------------------------------------------

export async function getStockItemsAsync(outletId: string): Promise<GroceryStockItem[]> {
  if (_simulatePgFailure) handleDatabaseError('getStockItems', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, outlet_id as "outletId", product, category, batch, quantity, unit,
                date_received as "dateReceived", expiry_date as "expiryDate",
                storage_zone_id as "storageZoneId", storage_zone_name as "storageZoneName",
                status, audit_trail as "auditTrail", created_at as "createdAt", updated_at as "updatedAt"
         FROM grocery_inventory_batches WHERE outlet_id = $1 ORDER BY expiry_date ASC`,
        [outletId]
      );
      return rows.map(r => ({
        ...r,
        auditTrail: Array.isArray(r.auditTrail) ? r.auditTrail : JSON.parse(r.auditTrail || '[]')
      }));
    } catch (err: any) {
      handleDatabaseError('getStockItems', err);
    }
  }

  const map = getMockStock();
  const list = map.get(outletId) || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  for (const item of list) {
    if (item.status === 'DISPOSED' || item.status === 'QUARANTINED') continue;
    const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date(todayStr).getTime()) / 86400000);
    if (diffDays < 0) {
      if (item.status !== 'EXPIRED') {
        item.status = 'EXPIRED';
        item.auditTrail.push({
          timestamp: new Date().toISOString(),
          action: 'AUTO_EXPIRED_FLAG',
          user: 'System FEFO Monitor',
          details: `Passed expiry date (${item.expiryDate})`
        });
      }
    } else if (diffDays <= 2) {
      if (item.status !== 'NEAR_EXPIRY') item.status = 'NEAR_EXPIRY';
    }
  }

  return list.map(s => ({ ...s }));
}

export function getStockItems(outletId: string): GroceryStockItem[] {
  const map = getMockStock();
  const list = map.get(outletId) || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  for (const item of list) {
    if (item.status === 'DISPOSED' || item.status === 'QUARANTINED') continue;
    const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date(todayStr).getTime()) / 86400000);
    if (diffDays < 0) {
      if (item.status !== 'EXPIRED') {
        item.status = 'EXPIRED';
        item.auditTrail.push({
          timestamp: new Date().toISOString(),
          action: 'AUTO_EXPIRED_FLAG',
          user: 'System FEFO Monitor',
          details: `Passed expiry date (${item.expiryDate})`
        });
      }
    } else if (diffDays <= 2) {
      if (item.status !== 'NEAR_EXPIRY') item.status = 'NEAR_EXPIRY';
    }
  }

  return list.map(s => ({ ...s }));
}

export async function updateStockStatusAsync(
  itemId: string,
  outletId: string,
  newStatus: StockStatus,
  user: string,
  reason: string
): Promise<GroceryStockItem> {
  if (_simulatePgFailure) handleDatabaseError('updateStockStatus', new Error('Simulated database disconnect'));

  const now = new Date().toISOString();
  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      let targetZoneId: string | null = null;
      let targetZoneName: string | null = null;

      if (newStatus === 'QUARANTINED') {
        const zones = await getStorageZonesAsync(outletId);
        const qZone = zones.find(z => z.type === 'waste_quarantine');
        if (qZone) {
          targetZoneId = qZone.id;
          targetZoneName = qZone.name;
        }
      }

      const rows = await query<any>(
        `UPDATE grocery_inventory_batches
         SET status = $1,
             updated_at = now(),
             storage_zone_id = COALESCE($2, storage_zone_id),
             storage_zone_name = COALESCE($3, storage_zone_name),
             audit_trail = audit_trail || $4::jsonb
         WHERE id = $5 AND outlet_id = $6
         RETURNING id, outlet_id as "outletId", product, category, batch, quantity, unit,
                   date_received as "dateReceived", expiry_date as "expiryDate",
                   storage_zone_id as "storageZoneId", storage_zone_name as "storageZoneName",
                   status, audit_trail as "auditTrail", created_at as "createdAt", updated_at as "updatedAt"`,
        [
          newStatus,
          targetZoneId,
          targetZoneName,
          JSON.stringify([{ timestamp: now, action: `STATUS_CHANGE_TO_${newStatus}`, user, details: reason }]),
          itemId,
          outletId
        ]
      );
      if (!rows[0]) throw new Error(`Stock item ${itemId} not found for outlet ${outletId}`);
      const r = rows[0];
      return {
        ...r,
        auditTrail: Array.isArray(r.auditTrail) ? r.auditTrail : JSON.parse(r.auditTrail || '[]')
      };
    } catch (err: any) {
      handleDatabaseError('updateStockStatus', err);
    }
  }

  const map = getMockStock();
  const list = map.get(outletId) || [];
  const item = list.find(s => s.id === itemId);
  if (!item) throw new Error(`Stock item ${itemId} not found for outlet ${outletId}`);

  item.status = newStatus;
  item.updatedAt = now;
  if (newStatus === 'QUARANTINED') {
    const zones = getStorageZones(outletId);
    const qZone = zones.find((z: any) => z.type === 'waste_quarantine');
    if (qZone) {
      item.storageZoneId = qZone.id;
      item.storageZoneName = qZone.name;
    }
  }

  item.auditTrail.push({
    timestamp: now,
    action: `STATUS_CHANGE_TO_${newStatus}`,
    user,
    details: reason
  });

  return { ...item };
}

export function updateStockStatus(
  itemId: string,
  outletId: string,
  newStatus: StockStatus,
  user: string,
  reason: string
): GroceryStockItem {
  const map = getMockStock();
  const list = map.get(outletId) || [];
  const item = list.find(s => s.id === itemId);
  if (!item) throw new Error(`Stock item ${itemId} not found for outlet ${outletId}`);

  const now = new Date().toISOString();
  item.status = newStatus;
  item.updatedAt = now;
  if (newStatus === 'QUARANTINED') {
    const zones = getStorageZones(outletId);
    const qZone = zones.find((z: any) => z.type === 'waste_quarantine');
    if (qZone) {
      item.storageZoneId = qZone.id;
      item.storageZoneName = qZone.name;
    }
  }

  item.auditTrail.push({
    timestamp: now,
    action: `STATUS_CHANGE_TO_${newStatus}`,
    user,
    details: reason
  });

  return { ...item };
}

// ----------------------------------------------------
// DAILY CHECK SERVICES
// ----------------------------------------------------

export async function recordDailyCheckAsync(input: {
  outletId: string;
  supervisorName: string;
  responses: Record<string, { conforming: boolean; notes?: string }>;
}): Promise<GroceryDailyCheckResult> {
  if (_simulatePgFailure) handleDatabaseError('recordDailyCheck', new Error('Simulated database disconnect'));

  const now = new Date().toISOString();
  const id = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let nonConformingCount = 0;
  let conformingCount = 0;
  const processedResponses: Record<string, { conforming: boolean; notes?: string; actionId?: string }> = {};

  for (const [code, val] of Object.entries(input.responses)) {
    if (val.conforming) {
      conformingCount++;
      processedResponses[code] = { conforming: true, notes: val.notes };
    } else {
      nonConformingCount++;
      const checkDef = GROCERY_OPERATIONAL_CHECKS.find(c => c.code === code);
      let actionId: string | undefined;

      if (isGroceryPostgresMode()) {
        const actId = `act-chk-${Date.now()}-${code}`;
        await query(
          `INSERT INTO grocery_corrective_actions (id, outlet_id, title, description, severity, priority, status, assigned_to, source_type, source_id, source_check_code, requires_external_service, service_category, created_at)
           VALUES ($1, $2, $3, $4, 'medium', 'high', 'open', $5, 'daily_check', $6, $7, $8, $9, now())`,
          [
            actId,
            input.outletId,
            `Daily Check Failure: ${checkDef ? checkDef.title : code}`,
            `Non-conformance identified during routine daily check. Note: ${val.notes || 'None'}.`,
            input.supervisorName,
            code,
            code,
            code === 'GR22-06' || code === 'GR22-17',
            code === 'GR22-06' ? 'refrigeration' : code === 'GR22-17' ? 'pest_control' : null
          ]
        );
        actionId = actId;
      } else {
        const action = createDemoAction(
          {
            title: `Daily Check Failure: ${checkDef ? checkDef.title : code}`,
            description: `Non-conformance identified during routine daily check. Note: ${val.notes || 'No notes provided'}.`,
            severity: 'medium',
            priority: 'high',
            outletId: input.outletId,
            sourceType: 'daily_check',
            sourceId: code,
            sourceCheckCode: code,
            requiresExternalService: code === 'GR22-06' || code === 'GR22-17',
            serviceCategory: code === 'GR22-06' ? 'refrigeration' : code === 'GR22-17' ? 'pest_control' : null,
            responsiblePerson: input.supervisorName,
            dueDate: now.slice(0, 10),
            status: 'open'
          },
          input.supervisorName
        );
        actionId = action.id;
      }

      processedResponses[code] = {
        conforming: false,
        notes: val.notes,
        actionId
      };
    }
  }

  const overallStatus = nonConformingCount === 0 ? 'COMPLIANT' : (nonConformingCount <= 2 ? 'ATTENTION_REQUIRED' : 'ACTION_REQUIRED');

  const result: GroceryDailyCheckResult = {
    id,
    outletId: input.outletId,
    date: now.slice(0, 10),
    supervisorName: input.supervisorName,
    responses: processedResponses,
    totalChecks: Object.keys(input.responses).length,
    conformingCount,
    nonConformingCount,
    createdAt: now
  };

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      await query(
        `INSERT INTO grocery_daily_checks (id, outlet_id, check_date, shift, completed_by, overall_status, passed_count, flagged_count, created_at)
         VALUES ($1, $2, $3, 'morning', $4, $5, $6, $7, $8)`,
        [id, input.outletId, now.slice(0, 10), input.supervisorName, overallStatus, conformingCount, nonConformingCount, now]
      );
      for (const [code, val] of Object.entries(processedResponses)) {
        const checkDef = GROCERY_OPERATIONAL_CHECKS.find(c => c.code === code);
        await query(
          `INSERT INTO grocery_daily_check_items (id, check_id, check_code, category, question, status, notes, corrective_action_required, corrective_action_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
          [
            `chki-${id}-${code}`,
            id,
            code,
            checkDef?.category || 'general',
            checkDef?.title || code,
            val.conforming ? 'YES' : 'NO',
            val.notes || null,
            !val.conforming,
            val.actionId || null
          ]
        );
      }
    } catch (err: any) {
      handleDatabaseError('recordDailyCheck', err);
    }
  } else {
    const map = getMockDailyChecks();
    const list = map.get(input.outletId) || [];
    list.unshift(result);
    map.set(input.outletId, list);
  }

  return { ...result };
}

export function recordDailyCheck(input: {
  outletId: string;
  supervisorName: string;
  responses: Record<string, { conforming: boolean; notes?: string }>;
}): GroceryDailyCheckResult {

  const now = new Date().toISOString();
  const id = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let nonConformingCount = 0;
  let conformingCount = 0;
  const processedResponses: Record<string, { conforming: boolean; notes?: string; actionId?: string }> = {};

  for (const [code, val] of Object.entries(input.responses as Record<string, any>)) {
    if (val.conforming) {
      conformingCount++;
      processedResponses[code] = { conforming: true, notes: val.notes };
    } else {
      nonConformingCount++;
      const checkDef = GROCERY_OPERATIONAL_CHECKS.find(c => c.code === code);
      const action = createDemoAction(
        {
          title: `Daily Check Failure: ${checkDef ? checkDef.title : code}`,
          description: `Non-conformance identified during routine daily check. Note: ${val.notes || 'No notes provided'}.`,
          severity: 'medium',
          priority: 'high',
          outletId: input.outletId,
          sourceType: 'daily_check',
          sourceId: code,
          sourceCheckCode: code,
          requiresExternalService: code === 'GR22-06' || code === 'GR22-17',
          serviceCategory: code === 'GR22-06' ? 'refrigeration' : code === 'GR22-17' ? 'pest_control' : null,
          responsiblePerson: input.supervisorName,
          dueDate: now.slice(0, 10),
          status: 'open'
        },
        input.supervisorName
      );

      processedResponses[code] = {
        conforming: false,
        notes: val.notes,
        actionId: action.id
      };
    }
  }

  const result: GroceryDailyCheckResult = {
    id,
    outletId: input.outletId,
    date: now.slice(0, 10),
    supervisorName: input.supervisorName,
    responses: processedResponses,
    totalChecks: Object.keys(input.responses).length,
    conformingCount,
    nonConformingCount,
    createdAt: now
  };

  const map = getMockDailyChecks();
  const list = map.get(input.outletId) || [];
  list.unshift(result);
  map.set(input.outletId, list);

  return { ...result };
}

export async function getDailyCheckHistoryAsync(outletId: string): Promise<GroceryDailyCheckResult[]> {
  if (_simulatePgFailure) handleDatabaseError('getDailyCheckHistory', new Error('Simulated database disconnect'));

  if (isGroceryPostgresMode()) {
    try {
      await ensureGroceryPgSchema();
      const rows = await query<any>(
        `SELECT id, outlet_id as "outletId", check_date as "date", completed_by as "supervisorName",
                passed_count as "conformingCount", flagged_count as "nonConformingCount",
                (passed_count + flagged_count) as "totalChecks", created_at as "createdAt"
         FROM grocery_daily_checks WHERE outlet_id = $1 ORDER BY check_date DESC`,
        [outletId]
      );
      for (const r of rows) {
        const itemRows = await query<any>(
          `SELECT check_code, status, notes, corrective_action_id as "actionId"
           FROM grocery_daily_check_items WHERE check_id = $1`,
          [r.id]
        );
        const respMap: Record<string, any> = {};
        for (const itm of itemRows) {
          respMap[itm.check_code] = {
            conforming: itm.status === 'YES',
            notes: itm.notes,
            actionId: itm.actionId
          };
        }
        r.responses = respMap;
      }
      return rows;
    } catch (err: any) {
      handleDatabaseError('getDailyCheckHistory', err);
    }
  }

  const map = getMockDailyChecks();
  return (map.get(outletId) || []).map(c => ({ ...c }));
}

export function getDailyCheckHistory(outletId: string): GroceryDailyCheckResult[] {
  const map = getMockDailyChecks();
  return (map.get(outletId) || []).map(c => ({ ...c }));
}

// ----------------------------------------------------
// ALERTS & DASHBOARD SUMMARY SERVICES
// ----------------------------------------------------

export async function getActiveGroceryAlertsAsync(outletId: string): Promise<GroceryAlert[]> {
  const alerts: GroceryAlert[] = [];
  const now = new Date().toISOString();

  const tempLogs = await getTemperatureLogsAsync(outletId, 10);
  for (const t of tempLogs) {
    if (t.status === 'RED') {
      alerts.push({
        id: `alt-temp-red-${t.id}`,
        outletId,
        type: 'TEMP_BREACH',
        severity: 'RED',
        title: `Critical Temperature Breach: ${t.equipmentName}`,
        description: `Recorded ${t.reading}°C at ${t.recordedAt.slice(11, 16)}. Out of compliant range.`,
        entityId: t.equipmentId,
        entityType: 'equipment',
        requiresAction: true,
        status: 'OPEN',
        createdAt: t.recordedAt
      });
    } else if (t.status === 'AMBER') {
      alerts.push({
        id: `alt-temp-amb-${t.id}`,
        outletId,
        type: 'TEMP_BREACH',
        severity: 'AMBER',
        title: `Temperature Warning: ${t.equipmentName}`,
        description: `Recorded ${t.reading}°C approaching threshold limit. Monitor cooling cycle.`,
        entityId: t.equipmentId,
        entityType: 'equipment',
        requiresAction: false,
        status: 'OPEN',
        createdAt: t.recordedAt
      });
    }
  }

  const stock = await getStockItemsAsync(outletId);
  const expiredItems = stock.filter(s => s.status === 'EXPIRED');
  if (expiredItems.length > 0) {
    alerts.push({
      id: `alt-stock-expired-${outletId}`,
      outletId,
      type: 'EXPIRED_PRODUCT',
      severity: 'RED',
      title: `${expiredItems.length} Product Batch(es) Past Expiry Date`,
      description: `Immediate withdrawal from sale required for: ${expiredItems.map(i => i.product).slice(0, 3).join(', ')}.`,
      entityType: 'stock',
      requiresAction: true,
      status: 'OPEN',
      createdAt: now
    });
  }

  const nearExpiryItems = stock.filter(s => s.status === 'NEAR_EXPIRY');
  if (nearExpiryItems.length > 0) {
    alerts.push({
      id: `alt-stock-near-${outletId}`,
      outletId,
      type: 'NEAR_EXPIRY',
      severity: 'AMBER',
      title: `${nearExpiryItems.length} Product Batch(es) Nearing Expiry (FEFO)`,
      description: `Review front shelf stock: ${nearExpiryItems.map(i => i.product).slice(0, 3).join(', ')}.`,
      entityType: 'stock',
      requiresAction: false,
      status: 'OPEN',
      createdAt: now
    });
  }

  const receivings = await getReceivingLogsAsync(outletId);
  const recentRejections = receivings.filter(r => r.decision === 'REJECT').slice(0, 2);
  for (const r of recentRejections) {
    alerts.push({
      id: `alt-rec-${r.id}`,
      outletId,
      type: 'RECEIVING_EXCEPTION',
      severity: 'AMBER',
      title: `Receiving Exception: ${r.product}`,
      description: `Rejected from ${r.supplier}. Reason: ${r.rejectionReason || 'Inspection criteria failed'}.`,
      entityId: r.id,
      entityType: 'receiving',
      requiresAction: false,
      status: 'OPEN',
      createdAt: r.createdAt
    });
  }

  return alerts;
}

export function getActiveGroceryAlerts(outletId: string): GroceryAlert[] {
  const alerts: GroceryAlert[] = [];
  const now = new Date().toISOString();

  const tempLogs = getTemperatureLogs(outletId, 10);
  for (const t of tempLogs) {
    if (t.status === 'RED') {
      alerts.push({
        id: `alt-temp-red-${t.id}`,
        outletId,
        type: 'TEMP_BREACH',
        severity: 'RED',
        title: `Critical Temperature Breach: ${t.equipmentName}`,
        description: `Recorded ${t.reading}°C at ${t.recordedAt.slice(11, 16)}.`,
        entityId: t.equipmentId,
        entityType: 'equipment',
        requiresAction: true,
        status: 'OPEN',
        createdAt: t.recordedAt
      });
    } else if (t.status === 'AMBER') {
      alerts.push({
        id: `alt-temp-amb-${t.id}`,
        outletId,
        type: 'TEMP_BREACH',
        severity: 'AMBER',
        title: `Temperature Warning: ${t.equipmentName}`,
        description: `Recorded ${t.reading}°C approaching threshold.`,
        entityId: t.equipmentId,
        entityType: 'equipment',
        requiresAction: false,
        status: 'OPEN',
        createdAt: t.recordedAt
      });
    }
  }

  const stock = getStockItems(outletId);
  const expiredItems = stock.filter((s: any) => s.status === 'EXPIRED');
  if (expiredItems.length > 0) {
    alerts.push({
      id: `alt-stock-expired-${outletId}`,
      outletId,
      type: 'EXPIRED_PRODUCT',
      severity: 'RED',
      title: `${expiredItems.length} Product Batch(es) Past Expiry Date`,
      description: `Immediate withdrawal from sale required.`,
      entityType: 'stock',
      requiresAction: true,
      status: 'OPEN',
      createdAt: now
    });
  }

  const nearExpiryItems = stock.filter((s: any) => s.status === 'NEAR_EXPIRY');
  if (nearExpiryItems.length > 0) {
    alerts.push({
      id: `alt-stock-near-${outletId}`,
      outletId,
      type: 'NEAR_EXPIRY',
      severity: 'AMBER',
      title: `${nearExpiryItems.length} Product Batch(es) Nearing Expiry (FEFO)`,
      description: `Review front shelf stock.`,
      entityType: 'stock',
      requiresAction: false,
      status: 'OPEN',
      createdAt: now
    });
  }

  const receivings = getReceivingLogs(outletId);
  const recentRejections = receivings.filter((r: any) => r.decision === 'REJECT').slice(0, 2);
  for (const r of recentRejections) {
    alerts.push({
      id: `alt-rec-${r.id}`,
      outletId,
      type: 'RECEIVING_EXCEPTION',
      severity: 'AMBER',
      title: `Receiving Exception: ${r.product}`,
      description: `Rejected from ${r.supplier}.`,
      entityId: r.id,
      entityType: 'receiving',
      requiresAction: false,
      status: 'OPEN',
      createdAt: r.createdAt
    });
  }

  const segregationWarnings = checkStorageSegregationRules(outletId);
  for (const s of segregationWarnings) {
    alerts.push({
      id: `alt-${s.id}`,
      outletId,
      type: 'SEGREGATION_RISK',
      severity: s.severity,
      title: `Storage Segregation Alert: ${s.zoneName}`,
      description: s.issue,
      entityId: s.zoneId,
      entityType: 'zone',
      requiresAction: true,
      status: 'OPEN',
      createdAt: now
    });
  }

  return alerts;
}

export async function getGroceryDashboardSummaryAsync(outletId: string) {
  const outlet = await getGroceryOutletAsync(outletId);
  const alerts = await getActiveGroceryAlertsAsync(outletId);
  const stock = await getStockItemsAsync(outletId);
  const equipment = await getGroceryEquipmentListAsync(outletId);
  const receivings = await getReceivingLogsAsync(outletId);
  const dailyChecks = await getDailyCheckHistoryAsync(outletId);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDailyCheck = dailyChecks.find(c => c.date === todayStr);

  const counts = {
    todayChecksCompleted: todayDailyCheck ? todayDailyCheck.totalChecks : 0,
    dailyCheckStatus: todayDailyCheck
      ? todayDailyCheck.nonConformingCount > 0 ? 'NEEDS_ATTENTION' : 'COMPLIANT'
      : 'PENDING_CHECK',
    activeAlerts: alerts.length,
    redAlerts: alerts.filter(a => a.severity === 'RED').length,
    amberAlerts: alerts.filter(a => a.severity === 'AMBER').length,
    tempBreaches: alerts.filter(a => a.type === 'TEMP_BREACH').length,
    expiredStockCount: stock.filter(s => s.status === 'EXPIRED').length,
    nearExpiryCount: stock.filter(s => s.status === 'NEAR_EXPIRY').length,
    totalStockBatches: stock.filter(s => s.status !== 'DISPOSED').length,
    totalEquipment: equipment.length,
    receivingExceptionsToday: receivings.filter(r => r.decision !== 'ACCEPT' && r.dateTime.startsWith(todayStr)).length
  };

  return {
    outlet,
    counts,
    alerts,
    recentTemperatureLogs: await getTemperatureLogsAsync(outletId, 5),
    todayDailyCheck: todayDailyCheck || null
  };
}

export function getGroceryDashboardSummary(outletId: string) {
  const outlet = getGroceryOutlet(outletId);
  const alerts = getActiveGroceryAlerts(outletId);
  const stock = getStockItems(outletId);
  const equipment = getGroceryEquipmentList(outletId);
  const receivings = getReceivingLogs(outletId);
  const dailyChecks = getDailyCheckHistory(outletId);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDailyCheck = dailyChecks.find((c: any) => c.date === todayStr);

  const counts = {
    todayChecksCompleted: todayDailyCheck ? todayDailyCheck.totalChecks : 0,
    dailyCheckStatus: todayDailyCheck
      ? todayDailyCheck.nonConformingCount > 0 ? 'NEEDS_ATTENTION' : 'COMPLIANT'
      : 'PENDING_CHECK',
    activeAlerts: alerts.length,
    redAlerts: alerts.filter((a: any) => a.severity === 'RED').length,
    amberAlerts: alerts.filter((a: any) => a.severity === 'AMBER').length,
    tempBreaches: alerts.filter((a: any) => a.type === 'TEMP_BREACH').length,
    expiredStockCount: stock.filter((s: any) => s.status === 'EXPIRED').length,
    nearExpiryCount: stock.filter((s: any) => s.status === 'NEAR_EXPIRY').length,
    totalStockBatches: stock.filter((s: any) => s.status !== 'DISPOSED').length,
    totalEquipment: equipment.length,
    receivingExceptionsToday: receivings.filter((r: any) => r.decision !== 'ACCEPT' && r.dateTime.startsWith(todayStr)).length
  };

  return {
    outlet,
    counts,
    alerts,
    recentTemperatureLogs: getTemperatureLogs(outletId, 5),
    todayDailyCheck: todayDailyCheck || null
  };
}
