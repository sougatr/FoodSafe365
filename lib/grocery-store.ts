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
// DEFAULT SEED DATA
// ----------------------------------------------------
const SEED_GROCERY_OUTLETS: GroceryOutlet[] = [
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

const SEED_STORAGE_ZONES: GroceryStorageZone[] = [
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

const SEED_EQUIPMENT: GroceryEquipment[] = [
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

const SEED_TEMP_LOGS: GroceryTemperatureLog[] = [
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

const SEED_STOCK_ITEMS: GroceryStockItem[] = [
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
    expiryDate: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10), // Expired yesterday
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

const SEED_RECEIVINGS: GroceryReceiving[] = [
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
    temperature: 8.2, // Temperature abuse
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
// IN-MEMORY GLOBAL CACHES
// ----------------------------------------------------
declare global {
  var __foodsafe_grocery_outlets: Map<string, GroceryOutlet> | undefined;
  var __foodsafe_grocery_zones: Map<string, GroceryStorageZone[]> | undefined;
  var __foodsafe_grocery_equipment: Map<string, GroceryEquipment[]> | undefined;
  var __foodsafe_grocery_temp_logs: Map<string, GroceryTemperatureLog[]> | undefined;
  var __foodsafe_grocery_stock: Map<string, GroceryStockItem[]> | undefined;
  var __foodsafe_grocery_receivings: Map<string, GroceryReceiving[]> | undefined;
  var __foodsafe_grocery_daily_checks: Map<string, GroceryDailyCheckResult[]> | undefined;
}

function getOutletsMap(): Map<string, GroceryOutlet> {
  if (!globalThis.__foodsafe_grocery_outlets) {
    globalThis.__foodsafe_grocery_outlets = new Map();
    for (const o of SEED_GROCERY_OUTLETS) {
      globalThis.__foodsafe_grocery_outlets.set(o.id, { ...o });
    }
  }
  return globalThis.__foodsafe_grocery_outlets;
}

function getZonesMap(): Map<string, GroceryStorageZone[]> {
  if (!globalThis.__foodsafe_grocery_zones) {
    globalThis.__foodsafe_grocery_zones = new Map();
    for (const z of SEED_STORAGE_ZONES) {
      const list = globalThis.__foodsafe_grocery_zones.get(z.outletId) || [];
      list.push({ ...z });
      globalThis.__foodsafe_grocery_zones.set(z.outletId, list);
    }
  }
  return globalThis.__foodsafe_grocery_zones;
}

function getEquipmentMap(): Map<string, GroceryEquipment[]> {
  if (!globalThis.__foodsafe_grocery_equipment) {
    globalThis.__foodsafe_grocery_equipment = new Map();
    for (const eq of SEED_EQUIPMENT) {
      const list = globalThis.__foodsafe_grocery_equipment.get(eq.outletId) || [];
      list.push({ ...eq });
      globalThis.__foodsafe_grocery_equipment.set(eq.outletId, list);
    }
  }
  return globalThis.__foodsafe_grocery_equipment;
}

function getTempLogsMap(): Map<string, GroceryTemperatureLog[]> {
  if (!globalThis.__foodsafe_grocery_temp_logs) {
    globalThis.__foodsafe_grocery_temp_logs = new Map();
    for (const tl of SEED_TEMP_LOGS) {
      const list = globalThis.__foodsafe_grocery_temp_logs.get(tl.outletId) || [];
      list.push({ ...tl });
      globalThis.__foodsafe_grocery_temp_logs.set(tl.outletId, list);
    }
  }
  return globalThis.__foodsafe_grocery_temp_logs;
}

function getStockMap(): Map<string, GroceryStockItem[]> {
  if (!globalThis.__foodsafe_grocery_stock) {
    globalThis.__foodsafe_grocery_stock = new Map();
    for (const s of SEED_STOCK_ITEMS) {
      const list = globalThis.__foodsafe_grocery_stock.get(s.outletId) || [];
      list.push({ ...s });
      globalThis.__foodsafe_grocery_stock.set(s.outletId, list);
    }
  }
  return globalThis.__foodsafe_grocery_stock;
}

function getReceivingsMap(): Map<string, GroceryReceiving[]> {
  if (!globalThis.__foodsafe_grocery_receivings) {
    globalThis.__foodsafe_grocery_receivings = new Map();
    for (const r of SEED_RECEIVINGS) {
      const list = globalThis.__foodsafe_grocery_receivings.get(r.outletId) || [];
      list.push({ ...r });
      globalThis.__foodsafe_grocery_receivings.set(r.outletId, list);
    }
  }
  return globalThis.__foodsafe_grocery_receivings;
}

function getDailyChecksMap(): Map<string, GroceryDailyCheckResult[]> {
  if (!globalThis.__foodsafe_grocery_daily_checks) {
    globalThis.__foodsafe_grocery_daily_checks = new Map();
  }
  return globalThis.__foodsafe_grocery_daily_checks;
}

// ----------------------------------------------------
// OUTLET SERVICES
// ----------------------------------------------------
export function getGroceryOutlet(id: string): GroceryOutlet | null {
  const map = getOutletsMap();
  const entry = map.get(id);
  return entry ? { ...entry } : null;
}

export function getAllGroceryOutlets(): GroceryOutlet[] {
  const map = getOutletsMap();
  return Array.from(map.values()).map(o => ({ ...o }));
}

export function saveGroceryOutlet(outletData: Omit<GroceryOutlet, 'createdAt' | 'updatedAt'>): GroceryOutlet {
  const map = getOutletsMap();
  const now = new Date().toISOString();
  const existing = map.get(outletData.id);
  const updated: GroceryOutlet = {
    ...outletData,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };
  map.set(outletData.id, updated);

  // Initialize default zones for newly created outlet if none exist
  const zonesMap = getZonesMap();
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

  // Initialize default equipment
  const eqMap = getEquipmentMap();
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

  return { ...updated };
}

// ----------------------------------------------------
// STORAGE ZONES & SEGREGATION SERVICES
// ----------------------------------------------------
export function getStorageZones(outletId: string): GroceryStorageZone[] {
  const map = getZonesMap();
  const list = map.get(outletId) || [];
  return list.map(z => ({ ...z }));
}

export function saveStorageZone(zone: Omit<GroceryStorageZone, 'id'> & { id?: string }): GroceryStorageZone {
  const map = getZonesMap();
  const list = map.get(zone.outletId) || [];
  const id = zone.id || `zone-${zone.outletId}-${Date.now()}`;
  const record: GroceryStorageZone = { ...zone, id };

  const idx = list.findIndex(z => z.id === id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.push(record);
  }
  map.set(zone.outletId, list);
  return { ...record };
}

export function checkStorageSegregationRules(outletId: string): SegregationRuleCheck[] {
  const stock = getStockItems(outletId);
  const zones = getStorageZones(outletId);
  const warnings: SegregationRuleCheck[] = [];

  // 1. Check for raw meat stored with ready-to-eat / dairy / cut produce in same zone
  const zoneStockMap = new Map<string, GroceryStockItem[]>();
  for (const s of stock.filter(item => item.status !== 'DISPOSED')) {
    const list = zoneStockMap.get(s.storageZoneId) || [];
    list.push(s);
    zoneStockMap.set(s.storageZoneId, list);
  }

  zoneStockMap.forEach((items: GroceryStockItem[], zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
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

    // 2. Check for chemical storage contamination
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

    // 3. Check for expired stock on active sales shelves
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
// EQUIPMENT & TEMPERATURE LOG SERVICES
// ----------------------------------------------------
export function getGroceryEquipmentList(outletId: string): GroceryEquipment[] {
  const map = getEquipmentMap();
  const list = map.get(outletId) || [];
  return list.map(eq => ({ ...eq }));
}

export function saveGroceryEquipment(eq: Omit<GroceryEquipment, 'id' | 'createdAt'> & { id?: string }): GroceryEquipment {
  const map = getEquipmentMap();
  const list = map.get(eq.outletId) || [];
  const id = eq.id || `eq-${eq.outletId}-${Date.now()}`;
  const now = new Date().toISOString();
  const record: GroceryEquipment = { ...eq, id, createdAt: now };

  const idx = list.findIndex(e => e.id === id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.push(record);
  }
  map.set(eq.outletId, list);
  return { ...record };
}

export function evaluateTemperatureStatus(
  reading: number,
  targetTemp: number,
  minTemp: number,
  maxTemp: number
): TemperatureStatus {
  // Configurable thresholds:
  // GREEN: within [minTemp, maxTemp]
  // AMBER: within 1.5°C of upper limit or between maxTemp and maxTemp + 1°C
  // RED: > maxTemp + 1°C or < minTemp - 2°C
  if (reading >= minTemp && reading <= maxTemp) {
    if (maxTemp - reading <= 1.0) {
      return 'AMBER'; // Approaching upper boundary
    }
    return 'GREEN';
  } else if (reading > maxTemp && reading <= maxTemp + 1.5) {
    return 'AMBER';
  } else {
    return 'RED';
  }
}

export function recordTemperatureLog(logInput: {
  outletId: string;
  equipmentId: string;
  reading: number;
  recordedBy: string;
  method?: 'manual' | 'probe';
  notes?: string;
}): { log: GroceryTemperatureLog; alert?: GroceryAlert; actionCreated?: boolean } {
  const eqList = getGroceryEquipmentList(logInput.outletId);
  const eq = eqList.find(e => e.id === logInput.equipmentId);
  if (!eq) {
    throw new Error(`Equipment with ID ${logInput.equipmentId} not found`);
  }

  const status = evaluateTemperatureStatus(logInput.reading, eq.targetTemp, eq.minTemp, eq.maxTemp);
  const id = `tmplog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  let correctiveActionId: string | undefined;

  // If status is RED, automatically trigger corrective action hook and alert
  if (status === 'RED') {
    const action = createDemoAction(
      {
        title: `Temperature deviation: ${eq.name}`,
        description: `Reading of ${logInput.reading}°C exceeded maximum limit (${eq.maxTemp}°C). Protect affected chilled/frozen foods, check door gaskets and thermostat.`,
        severity: 'high',
        priority: 'high',
        outletId: logInput.outletId,
        sourceType: 'temperature_check',
        sourceId: eq.id,
        sourceCheckCode: 'GR22-06',
        requiresExternalService: true,
        serviceCategory: 'refrigeration',
        responsiblePerson: eq.responsiblePerson || logInput.recordedBy,
        dueDate: now.slice(0, 10),
        status: 'open'
      },
      logInput.recordedBy
    );
    correctiveActionId = action.id;
  }

  const logRecord: GroceryTemperatureLog = {
    id,
    outletId: logInput.outletId,
    equipmentId: eq.id,
    equipmentName: eq.name,
    reading: logInput.reading,
    recordedAt: now,
    recordedBy: logInput.recordedBy,
    status,
    method: logInput.method || 'probe',
    notes: logInput.notes,
    correctiveActionId
  };

  const logsMap = getTempLogsMap();
  const list = logsMap.get(logInput.outletId) || [];
  list.unshift(logRecord);
  logsMap.set(logInput.outletId, list);

  let alert: GroceryAlert | undefined;
  if (status === 'RED' || status === 'AMBER') {
    alert = {
      id: `alert-temp-${id}`,
      outletId: logInput.outletId,
      type: 'TEMP_BREACH',
      severity: status,
      title: `${eq.name} Temperature ${status === 'RED' ? 'Breach' : 'Warning'} (${logInput.reading}°C)`,
      description: `Reading of ${logInput.reading}°C outside normal target (${eq.minTemp}°C to ${eq.maxTemp}°C).`,
      entityId: eq.id,
      entityType: 'equipment',
      requiresAction: status === 'RED',
      status: 'OPEN',
      createdAt: now
    };
  }

  return { log: { ...logRecord }, alert, actionCreated: Boolean(correctiveActionId) };
}

export function getTemperatureLogs(outletId: string, limit = 50): GroceryTemperatureLog[] {
  const map = getTempLogsMap();
  const list = map.get(outletId) || [];
  return list.slice(0, limit).map(l => ({ ...l }));
}

// ----------------------------------------------------
// RECEIVING SERVICES
// ----------------------------------------------------
export function getReceivingLogs(outletId: string): GroceryReceiving[] {
  const map = getReceivingsMap();
  const list = map.get(outletId) || [];
  return list.map(r => ({ ...r }));
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
}): { receiving: GroceryReceiving; stockCreated?: GroceryStockItem; actionCreated?: boolean } {
  const now = new Date().toISOString();
  const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let correctiveActionId: string | undefined;

  // If rejected or placed on hold, generate a corrective action
  if (input.decision === 'REJECT' || input.decision === 'HOLD') {
    const action = createDemoAction(
      {
        title: `Receiving exception: ${input.product} (${input.decision})`,
        description: `Shipment rejected/held from supplier ${input.supplier}. Reason: ${input.rejectionReason || 'Inspection criteria failed'}. Packaging: ${input.packagingCondition}, Condition: ${input.productCondition}.`,
        severity: input.decision === 'REJECT' ? 'high' : 'medium',
        priority: 'high',
        outletId: input.outletId,
        sourceType: 'receiving_inspection',
        sourceId: id,
        sourceCheckCode: 'GR22-09',
        requiresExternalService: false,
        responsiblePerson: input.receivingPerson,
        dueDate: now.slice(0, 10),
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

  const map = getReceivingsMap();
  const list = map.get(input.outletId) || [];
  list.unshift(record);
  map.set(input.outletId, list);

  // If accepted, add directly to Stock for FIFO/FEFO tracking
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
      const parts = expiry.split(/[\/\-]/);
      if (parts.length === 3 && parts[2].length === 4) {
        expiry = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
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

    const stockMap = getStockMap();
    const currentStock = stockMap.get(input.outletId) || [];
    currentStock.unshift(stockCreated);
    stockMap.set(input.outletId, currentStock);
  }

  return { receiving: { ...record }, stockCreated, actionCreated: Boolean(correctiveActionId) };
}

// ----------------------------------------------------
// FIFO / FEFO STOCK MANAGEMENT SERVICES
// ----------------------------------------------------
export function getStockItems(outletId: string): GroceryStockItem[] {
  const map = getStockMap();
  const list = map.get(outletId) || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Automatically update statuses based on FEFO expiry date
  for (const item of list) {
    if (item.status === 'DISPOSED' || item.status === 'QUARANTINED') {
      continue;
    }
    const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date(todayStr).getTime()) / 86400000);
    if (diffDays < 0) {
      if (item.status !== 'EXPIRED') {
        item.status = 'EXPIRED';
        item.auditTrail.push({
          timestamp: new Date().toISOString(),
          action: 'AUTO_EXPIRED_FLAG',
          user: 'System FEFO Monitor',
          details: `Item has passed expiry date (${item.expiryDate}). Immediate quarantine required.`
        });
      }
    } else if (diffDays <= 2) {
      if (item.status !== 'NEAR_EXPIRY') {
        item.status = 'NEAR_EXPIRY';
      }
    }
  }

  return list.map(s => ({ ...s }));
}

export function updateStockStatus(
  itemId: string,
  outletId: string,
  newStatus: StockStatus,
  user: string,
  reason: string
): GroceryStockItem {
  const map = getStockMap();
  const list = map.get(outletId) || [];
  const item = list.find(s => s.id === itemId);
  if (!item) {
    throw new Error(`Stock item ${itemId} not found for outlet ${outletId}`);
  }

  const now = new Date().toISOString();
  item.status = newStatus;
  item.updatedAt = now;

  if (newStatus === 'QUARANTINED') {
    const zones = getStorageZones(outletId);
    const qZone = zones.find(z => z.type === 'waste_quarantine');
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
// GROCERY DAILY CHECK SERVICES
// ----------------------------------------------------
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

  for (const [code, val] of Object.entries(input.responses)) {
    if (val.conforming) {
      conformingCount++;
      processedResponses[code] = { conforming: true, notes: val.notes };
    } else {
      nonConformingCount++;
      const checkDef = GROCERY_OPERATIONAL_CHECKS.find(c => c.code === code);
      const action = createDemoAction(
        {
          title: `Daily Check Failure: ${checkDef ? checkDef.title : code}`,
          description: `Non-conformance identified during routine daily check. Standard: ${checkDef ? checkDef.standard : 'Standard check'}. Note: ${val.notes || 'No notes provided'}. Corrective action: ${checkDef ? checkDef.action : 'Correct issue.'}`,
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

  const map = getDailyChecksMap();
  const list = map.get(input.outletId) || [];
  list.unshift(result);
  map.set(input.outletId, list);

  return { ...result };
}

export function getDailyCheckHistory(outletId: string): GroceryDailyCheckResult[] {
  const map = getDailyChecksMap();
  const list = map.get(outletId) || [];
  return list.map(c => ({ ...c }));
}

// ----------------------------------------------------
// ALERTS ENGINE
// ----------------------------------------------------
export function getActiveGroceryAlerts(outletId: string): GroceryAlert[] {
  const alerts: GroceryAlert[] = [];
  const now = new Date().toISOString();

  // 1. Temperature Alerts
  const tempLogs = getTemperatureLogs(outletId, 10);
  for (const t of tempLogs) {
    if (t.status === 'RED') {
      alerts.push({
        id: `alt-temp-red-${t.id}`,
        outletId,
        type: 'TEMP_BREACH',
        severity: 'RED',
        title: `Critical Temperature Breach: ${t.equipmentName}`,
        description: `Recorded ${t.reading}°C at ${t.recordedAt.slice(11, 16)}. Out of compliant holding range.`,
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

  // 2. Expired / Near-Expiry Stock Alerts
  const stock = getStockItems(outletId);
  const expiredItems = stock.filter(s => s.status === 'EXPIRED');
  if (expiredItems.length > 0) {
    alerts.push({
      id: `alt-stock-expired-${outletId}`,
      outletId,
      type: 'EXPIRED_PRODUCT',
      severity: 'RED',
      title: `${expiredItems.length} Product Batch(es) Past Expiry Date`,
      description: `Immediate withdrawal from sale required for: ${expiredItems.map(i => i.product).slice(0, 3).join(', ')}${expiredItems.length > 3 ? '...' : ''}.`,
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

  // 3. Receiving Rejections
  const receivings = getReceivingLogs(outletId);
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

  // 4. Segregation Warnings
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

// ----------------------------------------------------
// GROCERY DASHBOARD SUMMARY
// ----------------------------------------------------
export function getGroceryDashboardSummary(outletId: string) {
  const outlet = getGroceryOutlet(outletId);
  const alerts = getActiveGroceryAlerts(outletId);
  const stock = getStockItems(outletId);
  const equipment = getGroceryEquipmentList(outletId);
  const receivings = getReceivingLogs(outletId);
  const dailyChecks = getDailyCheckHistory(outletId);

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
    recentTemperatureLogs: getTemperatureLogs(outletId, 5),
    todayDailyCheck: todayDailyCheck || null
  };
}
