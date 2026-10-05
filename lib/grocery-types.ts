/**
 * FoodSafe365 — Grocery Store & Retail Food Store Types
 * Core Workflow: RECEIVE → STORE → MONITOR → ALERT → ACT → VERIFY
 */

export type GroceryStoreType =
  | 'supermarket'
  | 'hypermarket'
  | 'convenience'
  | 'neighborhood_kirana'
  | 'standalone_grocery'
  | 'specialty_food'
  | 'other';

export interface ProductCategoryDef {
  code: string;
  letter: string;
  name: string;
  description: string;
  requiresTemperatureControl: boolean;
  defaultTargetTemp?: number;
  defaultMaxTemp?: number;
  subcategories?: string[];
}

export const GROCERY_PRODUCT_CATEGORIES: ProductCategoryDef[] = [
  {
    code: 'meat_fresh',
    letter: 'A',
    name: 'Fresh / chilled meat',
    description: 'Raw dressed meats requiring strict refrigeration and segregation',
    requiresTemperatureControl: true,
    defaultTargetTemp: 4,
    defaultMaxTemp: 5,
    subcategories: ['Chicken / Poultry', 'Mutton / Lamb', 'Other Meat']
  },
  {
    code: 'seafood_fresh',
    letter: 'B',
    name: 'Fresh / chilled fish / seafood',
    description: 'Fresh fish and shellfish stored on crushed ice or in dedicated chillers',
    requiresTemperatureControl: true,
    defaultTargetTemp: 2,
    defaultMaxTemp: 4,
    subcategories: ['Fresh Fish', 'Prawns / Shrimps', 'Crabs / Shellfish', 'Other Seafood']
  },
  {
    code: 'dairy_milk',
    letter: 'C',
    name: 'Milk and milk products',
    description: 'Pasteurized milk, curd/dahi, paneer, cheese, butter and dairy desserts',
    requiresTemperatureControl: true,
    defaultTargetTemp: 4,
    defaultMaxTemp: 5,
    subcategories: ['Pasteurized Milk', 'Curd / Dahi', 'Paneer / Cottage Cheese', 'Cheese & Butter', 'Flavored Milk & Yogurt']
  },
  {
    code: 'frozen_foods',
    letter: 'D',
    name: 'Frozen foods',
    description: 'Packaged frozen snacks, peas/veg, ready-to-cook items intended to remain hard-frozen',
    requiresTemperatureControl: true,
    defaultTargetTemp: -18,
    defaultMaxTemp: -18,
    subcategories: ['Frozen Veg / Peas', 'Frozen Snacks / Ready-to-fry', 'Ice Cream & Desserts', 'Frozen Meat / Fish']
  },
  {
    code: 'fresh_produce',
    letter: 'E',
    name: 'Fresh fruits and vegetables',
    description: 'Whole unprocessed fruits and vegetables displayed at ambient or cool display',
    requiresTemperatureControl: false,
    subcategories: ['Leafy Greens', 'Root Vegetables', 'Whole Fruits', 'Exotic Vegetables']
  },
  {
    code: 'cut_produce',
    letter: 'F',
    name: 'Cut fruits / cut vegetables',
    description: 'Peeled, sliced or pre-packed fruits/salads requiring mandatory chilled display (≤5°C)',
    requiresTemperatureControl: true,
    defaultTargetTemp: 4,
    defaultMaxTemp: 5,
    subcategories: ['Cut Salad Packs', 'Peeled / Diced Veg', 'Cut Fruit Platters', 'Sprouts Packs']
  },
  {
    code: 'bakery_packaged',
    letter: 'G',
    name: 'Bread / bakery / packaged foods',
    description: 'Sliced bread, buns, biscuits, dry cakes with date-marking (Best-Before/Expiry)',
    requiresTemperatureControl: false,
    subcategories: ['Sliced Loaf Bread', 'Buns & Pav', 'Cakes & Pastries', 'Cookies & Biscuits']
  },
  {
    code: 'dry_groceries',
    letter: 'H',
    name: 'Dry groceries / staples',
    description: 'Atta, rice, pulses, sugar, spices, edible oils stored in dry pest-free ambient conditions',
    requiresTemperatureControl: false,
    subcategories: ['Flours & Grains', 'Pulses / Dals', 'Edible Oils & Ghee', 'Spices & Condiments', 'Sugar & Salt']
  },
  {
    code: 'temp_sensitive_other',
    letter: 'I',
    name: 'Other temperature-sensitive products',
    description: 'Specialty sauces, dips, fresh juices, live culture items requiring refrigeration',
    requiresTemperatureControl: true,
    defaultTargetTemp: 4,
    defaultMaxTemp: 5,
    subcategories: ['Fresh Dips & Hummus', 'Unpasteurized Fresh Juices', 'Ready Salads', 'Specialty Probiotics']
  },
  {
    code: 'other_packaged',
    letter: 'J',
    name: 'Other packaged food',
    description: 'Canned foods, tetra packs, confectionery, namkeen and snack packs',
    requiresTemperatureControl: false,
    subcategories: ['Canned Goods', 'Snacks & Namkeen', 'Confectionery', 'Beverages (Ambient)']
  }
];

export interface GroceryOutlet {
  id: string;
  name: string;
  branchName: string;
  address: string;
  city: string;
  managerName: string;
  dailyCheckPerson?: string;
  contactNumber: string;
  contactEmail: string;
  fssaiNumber: string;
  storeType: GroceryStoreType;
  selectedCategories: string[];
  createdAt: string;
  updatedAt: string;
}

export type StorageZoneType =
  | 'ambient_dry'
  | 'chiller'
  | 'freezer'
  | 'fresh_produce'
  | 'meat_chicken'
  | 'fish_seafood'
  | 'milk_dairy'
  | 'bakery'
  | 'chemical_storage'
  | 'waste_quarantine'
  | 'other';

export interface GroceryStorageZone {
  id: string;
  outletId: string;
  name: string;
  type: StorageZoneType;
  targetTemp?: number;
  minTemp?: number;
  maxTemp?: number;
  description: string;
}

export type EquipmentType = 'chiller' | 'freezer' | 'cold_room' | 'open_display_chiller' | 'other';

export interface GroceryEquipment {
  id: string;
  outletId: string;
  name: string;
  type: EquipmentType;
  location: string;
  targetTemp: number;
  minTemp: number;
  maxTemp: number;
  responsiblePerson: string;
  active: boolean;
  createdAt: string;
}

export type TemperatureStatus = 'GREEN' | 'AMBER' | 'RED';

export interface GroceryTemperatureLog {
  id: string;
  outletId: string;
  equipmentId: string;
  equipmentName: string;
  reading: number;
  recordedAt: string;
  recordedBy: string;
  status: TemperatureStatus;
  method: 'manual' | 'probe';
  notes?: string;
  correctiveActionId?: string;
}

export type ReceivingDecision = 'ACCEPT' | 'HOLD' | 'REJECT';

export interface GroceryReceiving {
  id: string;
  outletId: string;
  dateTime: string;
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
  decision: ReceivingDecision;
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
  correctiveActionId?: string;
  createdAt: string;
}

export type StockStatus = 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'QUARANTINED' | 'DISPOSED';

export interface StockAuditTrail {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface GroceryStockItem {
  id: string;
  outletId: string;
  product: string;
  category: string;
  batch: string;
  quantity: number;
  unit: string;
  dateReceived: string;
  expiryDate: string;
  storageZoneId: string;
  storageZoneName: string;
  status: StockStatus;
  auditTrail: StockAuditTrail[];
  createdAt: string;
  updatedAt: string;
}

export interface SegregationRuleCheck {
  id: string;
  zoneId: string;
  zoneName: string;
  issue: string;
  severity: 'AMBER' | 'RED';
  actionRequired: string;
}

export interface GroceryOperationalCheckDef {
  code: string;
  number: number;
  title: string;
  why: string;
  what: string;
  standard: string;
  action: string;
  category: string;
}

export interface GroceryDailyCheckResult {
  id: string;
  outletId: string;
  date: string;
  supervisorName: string;
  responses: Record<string, { conforming: boolean; notes?: string; actionId?: string }>;
  totalChecks: number;
  conformingCount: number;
  nonConformingCount: number;
  createdAt: string;
}

export type AlertSeverity = 'GREEN' | 'AMBER' | 'RED';
export type AlertType =
  | 'TEMP_BREACH'
  | 'EXPIRED_PRODUCT'
  | 'NEAR_EXPIRY'
  | 'DAMAGED_PACKAGING'
  | 'RECEIVING_EXCEPTION'
  | 'SEGREGATION_RISK'
  | 'MISSED_TEMP_CHECK'
  | 'MISSED_DAILY_CHECK'
  | 'OVERDUE_ACTION';

export interface GroceryAlert {
  id: string;
  outletId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityId?: string;
  entityType?: 'equipment' | 'stock' | 'receiving' | 'zone' | 'daily_check' | 'action';
  requiresAction: boolean;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}
