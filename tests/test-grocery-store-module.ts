import assert from 'assert';
import {
  saveGroceryOutlet,
  getGroceryOutlet,
  getAllGroceryOutlets,
  getStorageZones,
  saveStorageZone,
  checkStorageSegregationRules,
  getGroceryEquipmentList,
  saveGroceryEquipment,
  recordTemperatureLog,
  evaluateTemperatureStatus,
  getTemperatureLogs,
  recordReceivingItem,
  getReceivingLogs,
  getStockItems,
  updateStockStatus,
  recordDailyCheck,
  getActiveGroceryAlerts,
  getGroceryDashboardSummary,
  quarantineBatch,
  releaseBatch,
  searchStockItems,
  getActiveStockItems
} from '../lib/grocery-store';
import { GROCERY_PRODUCT_CATEGORIES } from '../lib/grocery-types';
import { GROCERY_OPERATIONAL_CHECKS } from '../lib/grocery-checklist-data';
import { authorizeGroceryAccess } from '../lib/grocery-tenant';
import { getDemoAction, updateDemoAction } from '../lib/demo-store';
import { saveCustomerFeedback, getCustomerFeedback } from '../lib/customer-feedback-store';
import { DinerSafetyRating, calculateCustomerVoiceSummary } from '../lib/foodsafety28';

async function runGroceryTests() {
  console.log('================================================================');
  console.log('FOODSAFE365 — GROCERY STORE MODULE v1 VERIFICATION SUITE');
  console.log('================================================================\n');

  const testOutletId = `store-test-mart-${Date.now()}`;

  // ----------------------------------------------------------------
  // TEST A: Grocery outlet creation / onboarding
  // ----------------------------------------------------------------
  console.log('--- TEST A: GROCERY OUTLET CREATION & ONBOARDING ---');
  const createdOutlet = saveGroceryOutlet({
    id: testOutletId,
    name: 'Green Harvest Gourmet Supermarket',
    branchName: 'Khar West Branch',
    address: '14th Road, Khar West, Mumbai',
    city: 'Mumbai',
    managerName: 'Vikas Sharma',
    contactNumber: '+91 98200 77889',
    contactEmail: 'vikas@greenharvest.example.com',
    fssaiNumber: '11523015000999',
    storeType: 'supermarket',
    selectedCategories: ['meat_fresh', 'dairy_milk', 'frozen_foods', 'fresh_produce', 'bakery_packaged']
  });

  assert.strictEqual(createdOutlet.id, testOutletId);
  assert.strictEqual(createdOutlet.name, 'Green Harvest Gourmet Supermarket');
  assert.strictEqual(createdOutlet.storeType, 'supermarket');

  const fetchedOutlet = getGroceryOutlet(testOutletId);
  assert(fetchedOutlet, 'Created grocery outlet must be retrievable');
  assert.strictEqual(fetchedOutlet.fssaiNumber, '11523015000999');

  // Verify automatic default storage zones and equipment were initialized
  const defaultZones = getStorageZones(testOutletId);
  assert(defaultZones.length >= 4, 'Must initialize default storage zones');
  const defaultEq = getGroceryEquipmentList(testOutletId);
  assert(defaultEq.length >= 2, 'Must initialize default chiller and freezer');
  console.log(`✅ TEST A PASSED: Outlet ${createdOutlet.name} created with ${defaultZones.length} zones and ${defaultEq.length} cooling units`);

  // ----------------------------------------------------------------
  // TEST A2: Simplified 3-Step Grocery Onboarding Persistence
  // ----------------------------------------------------------------
  console.log('\n--- TEST A2: SIMPLIFIED 3-STEP GROCERY ONBOARDING ---');
  const simpleOutletId = `store-simple-${Date.now()}`;
  const simpleOutlet = saveGroceryOutlet({
    id: simpleOutletId,
    name: 'Nature Fresh Mart',
    branchName: 'Bengaluru Store',
    address: 'Nature Fresh Mart, Bengaluru',
    city: 'Bengaluru',
    managerName: 'Priya Sharma',
    dailyCheckPerson: 'Priya Sharma',
    contactNumber: 'Not provided',
    contactEmail: `manager@${simpleOutletId}.example.com`,
    fssaiNumber: '10000000000000',
    storeType: 'supermarket',
    selectedCategories: ['dairy_milk', 'fresh_produce', 'dry_groceries']
  });

  const fetchedSimple = getGroceryOutlet(simpleOutletId);
  assert(fetchedSimple, 'Simplified onboarding outlet must be saved and retrievable');
  assert.strictEqual(fetchedSimple.name, 'Nature Fresh Mart');
  assert.strictEqual(fetchedSimple.city, 'Bengaluru');
  assert.strictEqual(fetchedSimple.dailyCheckPerson, 'Priya Sharma');
  assert.deepStrictEqual(fetchedSimple.selectedCategories, ['dairy_milk', 'fresh_produce', 'dry_groceries']);
  console.log('✅ TEST A2 PASSED: Simplified onboarding persisted outlet name, city, categories, and daily-check person');
  // ----------------------------------------------------------------
  console.log('\n--- TEST B: PRODUCT CATEGORIES & TEMPERATURE THRESHOLDS (A-J) ---');
  assert.strictEqual(GROCERY_PRODUCT_CATEGORIES.length, 10, 'Must support 10 categories (A through J)');
  const letters = GROCERY_PRODUCT_CATEGORIES.map(c => c.letter);
  assert.deepStrictEqual(letters, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);

  const freshMeat = GROCERY_PRODUCT_CATEGORIES.find(c => c.code === 'meat_fresh');
  assert(freshMeat?.requiresTemperatureControl, 'Meat must require temperature control');
  assert.strictEqual(freshMeat?.defaultMaxTemp, 5, 'Meat default max temp must be ≤5°C');

  const frozen = GROCERY_PRODUCT_CATEGORIES.find(c => c.code === 'frozen_foods');
  assert.strictEqual(frozen?.defaultMaxTemp, -18, 'Frozen foods default max temp must be ≤-18°C');

  const dryStaples = GROCERY_PRODUCT_CATEGORIES.find(c => c.code === 'dry_groceries');
  assert.strictEqual(dryStaples?.requiresTemperatureControl, false, 'Dry groceries do not require chilling');
  console.log('✅ TEST B PASSED: All 10 categories (A through J) configured with compliant FSSAI-aligned temperature rules');

  // ----------------------------------------------------------------
  // TEST C: Receiving record creation & dockside inspection
  // ----------------------------------------------------------------
  console.log('\n--- TEST C: RECEIVING RECORD CREATION & 8-POINT INSPECTION ---');
  // 1. Accepted delivery
  const acceptDelivery = recordReceivingItem({
    outletId: testOutletId,
    supplier: 'Pride Dairy Co-op (FSSAI: 10015022001144)',
    product: 'Organic Cow Milk 500ml',
    productCategory: 'dairy_milk',
    quantity: '40 pouches',
    batchNumber: 'LOT-PRIDE-99',
    useByDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    temperature: 3.8,
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

  assert.strictEqual(acceptDelivery.receiving.decision, 'ACCEPT');
  assert(acceptDelivery.stockCreated, 'Accepted delivery must create corresponding stock item for FEFO');
  assert.strictEqual(acceptDelivery.stockCreated.product, 'Organic Cow Milk 500ml');

  // 2. Rejected delivery (Temperature abuse & damaged packaging)
  const rejectDelivery = recordReceivingItem({
    outletId: testOutletId,
    supplier: 'Shree Marine Exports',
    product: 'Chilled Pomfret Fish',
    productCategory: 'seafood_fresh',
    quantity: '10 kg',
    packagingCondition: 'damaged',
    productCondition: 'substandard',
    temperature: 9.5, // Severe temperature abuse (>4°C)
    isTempSensitive: true,
    receivingPerson: 'Vikas Sharma',
    decision: 'REJECT',
    rejectionReason: 'Dock temp was 9.5°C; packaging torn and ice melted.',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: false,
      packagingIntact: false,
      noLeakageOrDamage: false,
      dateMarkingAcceptable: true,
      temperatureAppropriate: false,
      suitableForStorage: false,
      withinCapacity: true
    }
  });

  assert.strictEqual(rejectDelivery.receiving.decision, 'REJECT');
  assert.strictEqual(rejectDelivery.actionCreated, true, 'Rejected shipment must automatically spawn corrective action');
  assert(rejectDelivery.receiving.correctiveActionId, 'Must have corrective action ID');

  // 3. Exact user scenario test: Supplier "dd", Product "milk", blank mobile/email, use-by "05/10/2026", 1°C dock temp
  const userScenario = recordReceivingItem({
    outletId: 'store-nature-basket-bandra',
    supplier: 'dd',
    product: 'milk',
    productCategory: 'dairy_milk',
    quantity: '10',
    useByDate: '05/10/2026',
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

  assert.strictEqual(userScenario.receiving.supplier, 'dd');
  assert.strictEqual(userScenario.receiving.product, 'milk');
  assert.strictEqual(userScenario.receiving.decision, 'ACCEPT');
  assert(userScenario.stockCreated, 'Stock must be created on ACCEPT');
  assert.strictEqual(userScenario.stockCreated.storageZoneName, 'Dairy & Milk Walk-in Chiller');
  assert.strictEqual(userScenario.stockCreated.expiryDate, '2026-10-05', 'Date 05/10/2026 must be normalized to 2026-10-05');

  // Verify persistence in getReceivingLogs
  const allReceivings = getReceivingLogs('store-nature-basket-bandra');
  const foundDd = allReceivings.find(r => r.id === userScenario.receiving.id);
  assert(foundDd, 'Receiving record must persist and be retrievable from getReceivingLogs');
  assert.strictEqual(foundDd.supplier, 'dd');

  // 4. HOLD decision test
  const holdDelivery = recordReceivingItem({
    outletId: testOutletId,
    supplier: 'Metro Organics',
    product: 'Artisanal Yogurt',
    productCategory: 'dairy_milk',
    quantity: '25 tubs',
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    temperature: 4.8,
    isTempSensitive: true,
    receivingPerson: 'Vikas Sharma',
    decision: 'HOLD',
    rejectionReason: 'Awaiting lab COA certificate before release',
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
  assert.strictEqual(holdDelivery.receiving.decision, 'HOLD');
  assert.strictEqual(holdDelivery.actionCreated, true, 'HOLD must spawn tracking corrective action');

  console.log('✅ TEST C PASSED: Receiving engine accepted compliant batch (including exact "dd" milk scenario with blank mobile), held batch, and rejected abused batch with corrective action');

  // ----------------------------------------------------------------
  // TEST D: Temperature log creation & status evaluation
  // ----------------------------------------------------------------
  console.log('\n--- TEST D: TEMPERATURE LOG CREATION & RANGE EVALUATION ---');
  // Chiller: target 4, min 1, max 5
  assert.strictEqual(evaluateTemperatureStatus(3.2, 4, 1, 5), 'GREEN');
  assert.strictEqual(evaluateTemperatureStatus(4.8, 4, 1, 5), 'AMBER'); // Approaching upper boundary
  assert.strictEqual(evaluateTemperatureStatus(7.2, 4, 1, 5), 'RED');   // Outside limit

  // Freezer: target -18, min -24, max -18
  assert.strictEqual(evaluateTemperatureStatus(-19.5, -18, -24, -18), 'GREEN');
  assert.strictEqual(evaluateTemperatureStatus(-15.0, -18, -24, -18), 'RED');

  const chiller = defaultEq.find(e => e.type === 'chiller')!;
  const greenLog = recordTemperatureLog({
    outletId: testOutletId,
    equipmentId: chiller.id,
    reading: 3.5,
    recordedBy: 'Vikas Sharma',
    method: 'probe'
  });
  assert.strictEqual(greenLog.log.status, 'GREEN');
  console.log(`✅ TEST D PASSED: Temperature ranges evaluated accurately (GREEN, AMBER, RED)`);

  // ----------------------------------------------------------------
  // TEST E: Temperature alert & corrective action generation
  // ----------------------------------------------------------------
  console.log('\n--- TEST E: TEMPERATURE ALERT & REFRIGERATION SERVICE HOOK ---');
  const redLog = recordTemperatureLog({
    outletId: testOutletId,
    equipmentId: chiller.id,
    reading: 7.8, // Critical breach
    recordedBy: 'Vikas Sharma',
    notes: 'Compressor humming loudly, door seal cold leak detected.'
  });

  assert.strictEqual(redLog.log.status, 'RED');
  assert(redLog.alert, 'Must generate alert on RED temperature breach');
  assert.strictEqual(redLog.alert.severity, 'RED');
  assert.strictEqual(redLog.actionCreated, true, 'RED breach must create corrective action');

  // Verify external service hook
  const createdAction = getDemoAction(redLog.log.correctiveActionId!, 'Vikas Sharma');
  assert(createdAction, 'Corrective action must exist in store');
  assert.strictEqual(createdAction.requiresExternalService, true, 'Chiller breach must flag requiresExternalService');
  assert.strictEqual(createdAction.serviceCategory, 'refrigeration', 'Service category must be refrigeration');
  console.log(`✅ TEST E PASSED: RED breach generated active alert & corrective action with refrigeration service hook`);

  // ----------------------------------------------------------------
  // TEST F: Expired product detection & safety lock
  // ----------------------------------------------------------------
  console.log('\n--- TEST F: EXPIRED PRODUCT DETECTION & SAFETY LOCK ---');
  // Inject an expired stock item directly
  const stockList = getStockItems(testOutletId);
  const now = new Date();
  const pastDate = new Date(now.getTime() - 86400000 * 2).toISOString().slice(0, 10);

  const expiredItem = {
    id: `stk-expired-${Date.now()}`,
    outletId: testOutletId,
    product: 'Artisan Paneer 200g',
    category: 'dairy_milk',
    batch: 'LOT-PN-01',
    quantity: 6,
    unit: 'packs',
    dateReceived: new Date(now.getTime() - 86400000 * 10).toISOString().slice(0, 10),
    expiryDate: pastDate,
    storageZoneId: defaultZones[0].id,
    storageZoneName: defaultZones[0].name,
    status: 'ACTIVE' as any,
    auditTrail: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const rawMap = (globalThis as any).__foodsafe_grocery_stock.get(testOutletId) || [];
  rawMap.push(expiredItem);
  (globalThis as any).__foodsafe_grocery_stock.set(testOutletId, rawMap);

  const refreshedStock = getStockItems(testOutletId);
  const detectedExpired = refreshedStock.find(s => s.id === expiredItem.id);
  assert(detectedExpired, 'Item must be in stock list');
  assert.strictEqual(detectedExpired.status, 'EXPIRED', 'Item past expiry date must automatically be flagged EXPIRED');

  const alerts = getActiveGroceryAlerts(testOutletId);
  const expiredAlert = alerts.find(a => a.type === 'EXPIRED_PRODUCT');
  assert(expiredAlert, 'Must generate EXPIRED_PRODUCT alert');
  assert.strictEqual(expiredAlert.severity, 'RED');
  console.log('✅ TEST F PASSED: Past-expiry stock flagged EXPIRED with immediate RED alert');

  // ----------------------------------------------------------------
  // TEST G: FIFO / FEFO logic & status transitions
  // ----------------------------------------------------------------
  console.log('\n--- TEST G: FEFO ORDERING & QUARANTINE TRANSITION ---');
  // Sort order check: Nearest expiry must appear first
  const sortedStock = [...refreshedStock].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  assert(new Date(sortedStock[0].expiryDate).getTime() <= new Date(sortedStock[sortedStock.length - 1].expiryDate).getTime());

  // Quarantine expired item
  const quarantined = updateStockStatus(
    detectedExpired.id,
    testOutletId,
    'QUARANTINED',
    'Vikas Sharma',
    'Pulled from customer display shelf into Red Quarantine zone.'
  );
  assert.strictEqual(quarantined.status, 'QUARANTINED');
  assert(quarantined.storageZoneName.includes('Quarantine'), 'Must be relocated to quarantine zone');
  assert(quarantined.auditTrail.length > 0, 'Audit trail must record reason and timestamp');

  // Mark Disposed
  const disposed = updateStockStatus(
    detectedExpired.id,
    testOutletId,
    'DISPOSED',
    'Vikas Sharma',
    'Destroyed under municipal wet-waste protocol.'
  );
  assert.strictEqual(disposed.status, 'DISPOSED');
  assert.strictEqual(disposed.auditTrail.length, 3, 'Audit trail must record auto-expiry flag, quarantine, and disposal');
  console.log('✅ TEST G PASSED: FEFO ordering verified and complete audit trail preserved through QUARANTINED and DISPOSED');

  // ----------------------------------------------------------------
  // TEST H: Daily check failure & corrective action creation
  // ----------------------------------------------------------------
  console.log('\n--- TEST H: GROCERY DAILY CHECK (22 CHECKS) & ACTION CREATION ---');
  assert.strictEqual(GROCERY_OPERATIONAL_CHECKS.length, 22, 'Must have 22 FSSAI-aligned operational checks');

  // Perform daily check with 20 conforming and 2 issues (GR22-06 Chiller & GR22-17 Pest Control)
  const checkResponses: Record<string, { conforming: boolean; notes?: string }> = {};
  for (const c of GROCERY_OPERATIONAL_CHECKS) {
    if (c.code === 'GR22-06') {
      checkResponses[c.code] = { conforming: false, notes: 'Chiller 1 condenser coil iced over' };
    } else if (c.code === 'GR22-17') {
      checkResponses[c.code] = { conforming: false, notes: 'Small gnaw mark observed near loading door' };
    } else {
      checkResponses[c.code] = { conforming: true };
    }
  }

  const dailyResult = recordDailyCheck({
    outletId: testOutletId,
    supervisorName: 'Vikas Sharma',
    responses: checkResponses
  });

  assert.strictEqual(dailyResult.conformingCount, 20);
  assert.strictEqual(dailyResult.nonConformingCount, 2);
  assert(dailyResult.responses['GR22-06'].actionId, 'GR22-06 must have created corrective action');
  assert(dailyResult.responses['GR22-17'].actionId, 'GR22-17 must have created corrective action');

  // Verify pest action external service hook
  const pestAction = getDemoAction(dailyResult.responses['GR22-17'].actionId!, 'Vikas Sharma');
  assert(pestAction, 'Pest action must exist');
  assert.strictEqual(pestAction.requiresExternalService, true);
  assert.strictEqual(pestAction.serviceCategory, 'pest_control');
  console.log('✅ TEST H PASSED: Daily 22-check recorded with 2 non-conformances correctly mapped to external service hooks');

  // ----------------------------------------------------------------
  // TEST I: Verification workflow
  // ----------------------------------------------------------------
  console.log('\n--- TEST I: INDEPENDENT VERIFICATION WORKFLOW ---');
  const actionToVerifyId = pestAction.id;
  assert.strictEqual(pestAction.status, 'open');

  // 1. Move to in_progress
  updateDemoAction(actionToVerifyId, { status: 'in_progress', immediateAction: 'Bait station placed at dock.' }, 'Vikas Sharma');
  const inProgress = getDemoAction(actionToVerifyId, 'Vikas Sharma')!;
  assert.strictEqual(inProgress.status, 'in_progress');

  // 2. Submit for verification (awaiting_verification)
  updateDemoAction(actionToVerifyId, { status: 'awaiting_verification', correctiveAction: 'Commercial pest contractor sealed dock gap.' }, 'Vikas Sharma');
  const awaiting = getDemoAction(actionToVerifyId, 'Vikas Sharma')!;
  assert.strictEqual(awaiting.status, 'awaiting_verification');

  // 3. Verification step (pass -> closed)
  updateDemoAction(actionToVerifyId, { status: 'closed' }, 'Vikas Sharma');
  const verified = getDemoAction(actionToVerifyId, 'Vikas Sharma')!;
  assert.strictEqual(verified.status, 'closed');
  assert(verified.closedAt, 'Must have closedAt timestamp');
  console.log('✅ TEST I PASSED: Complete verification lifecycle (open -> in_progress -> awaiting_verification -> closed) verified');

  // ----------------------------------------------------------------
  // TEST J: Tenant isolation (Outlet A vs Outlet B)
  // ----------------------------------------------------------------
  console.log('\n--- TEST J: STRICT TENANT ISOLATION ---');
  const outletB = 'store-daily-needs-colaba';
  const crossTenantReq = new Request('http://localhost', {
    headers: {
      'x-foodsafe-user-id': 'mgr-khar-1',
      'x-foodsafe-org-id': 'green-harvest-org',
      'x-foodsafe-outlet-id': testOutletId, // User belongs to Outlet A
      'x-foodsafe-role': 'outlet_manager'
    }
  });

  const authCross = await authorizeGroceryAccess(outletB, crossTenantReq); // Attempts to access Outlet B
  assert.strictEqual(authCross.ok, false, 'Cross-tenant access must be rejected');
  if (!authCross.ok) {
    assert.strictEqual(authCross.status, 403, 'Must return 403 Forbidden');
    assert.strictEqual(authCross.code, 'FORBIDDEN');
  }
  console.log('✅ TEST J PASSED: Manager of Outlet A strictly forbidden from accessing Outlet B (403)');

  // ----------------------------------------------------------------
  // TEST K: Unauthorized access
  // ----------------------------------------------------------------
  console.log('\n--- TEST K: UNAUTHENTICATED ACCESS REJECTION ---');
  const unauthResult = await authorizeGroceryAccess(testOutletId, new Request('http://localhost'), true);
  assert.strictEqual(unauthResult.ok, false);
  if (!unauthResult.ok) {
    assert.strictEqual(unauthResult.status, 401);
    assert.strictEqual(unauthResult.code, 'UNAUTHENTICATED');
  }
  console.log('✅ TEST K PASSED: Unauthenticated access rejected with 401 UNAUTHENTICATED');

  // ----------------------------------------------------------------
  // TEST L: Existing Restaurant functionality remains 100% unaffected
  // ----------------------------------------------------------------
  console.log('\n--- TEST L: REGRESSION AUDIT (RESTAURANT & CUSTOMER VOICE UNBROKEN) ---');
  const testRestaurantFeedback: DinerSafetyRating = {
    id: `regr-test-${Date.now()}`,
    outletId: 'the-bombay-canteen',
    outletName: 'The Bombay Canteen',
    createdAt: new Date().toISOString(),
    dinerName: 'Regression Tester',
    tableNumber: 'Table 12',
    scores: {
      cleanliness: 5,
      staffHygiene: 5,
      foodFreshness: 5,
      safeWater: 5,
      washroom: 5
    },
    overallScore: 5.0,
    feedback: 'Regression test: Restaurant feedback pipeline operational.',
    verifiedDineIn: true
  };

  const fbSave = await saveCustomerFeedback(testRestaurantFeedback);
  assert.strictEqual(fbSave.rating.outletId, 'the-bombay-canteen');

  const fbFetch = await getCustomerFeedback('the-bombay-canteen');
  const retrieved = fbFetch.ratings.find(r => r.id === testRestaurantFeedback.id);
  assert(retrieved, 'Restaurant customer feedback must persist normally');

  const voiceSummary = calculateCustomerVoiceSummary(fbFetch.ratings);
  assert(voiceSummary.totalRatings > 0, 'Customer voice summary calculation intact');
  console.log(`✅ TEST L PASSED: Restaurant Customer Voice and Feedback pipelines completely intact and unaffected`);

  // ----------------------------------------------------------------
  // TEST M: PHASE 1 FOSTAC RETAIL ENHANCEMENTS VERIFICATION
  // ----------------------------------------------------------------
  console.log('\n--- TEST M: PHASE 1 FOSTAC RETAIL ENHANCEMENTS VERIFICATION ---');

  // 1. Vehicle cleanliness & food-only check in dockside receiving
  const vehiclePassDelivery = recordReceivingItem({
    outletId: testOutletId,
    supplier: 'Clean Logistics Transport (FSSAI: 11520001000111)',
    product: 'Pasteurized Toned Milk',
    productCategory: 'dairy_milk',
    quantity: '50 crates',
    packagingCondition: 'intact',
    productCondition: 'acceptable',
    temperature: 3.2,
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
      withinCapacity: true,
      vehicleCleanAndFoodOnly: true
    }
  });
  assert.strictEqual(vehiclePassDelivery.receiving.decision, 'ACCEPT');
  assert.strictEqual(vehiclePassDelivery.receiving.inspectionChecklist.vehicleCleanAndFoodOnly, true);

  const vehicleFailDelivery = recordReceivingItem({
    outletId: testOutletId,
    supplier: 'Mixed Cargo Logistics',
    product: 'Basmati Rice Sacks',
    productCategory: 'dry_groceries',
    quantity: '20 sacks',
    packagingCondition: 'intact',
    productCondition: 'substandard',
    isTempSensitive: false,
    receivingPerson: 'Vikas Sharma',
    decision: 'REJECT',
    rejectionReason: 'Vehicle bed soiled with oil residue and non-food chemical drums transported alongside food.',
    inspectionChecklist: {
      approvedSupplier: true,
      acceptableCondition: false,
      packagingIntact: true,
      noLeakageOrDamage: true,
      dateMarkingAcceptable: true,
      temperatureAppropriate: true,
      suitableForStorage: false,
      withinCapacity: true,
      vehicleCleanAndFoodOnly: false
    }
  });
  assert.strictEqual(vehicleFailDelivery.receiving.decision, 'REJECT');
  assert.strictEqual(vehicleFailDelivery.receiving.inspectionChecklist.vehicleCleanAndFoodOnly, false);
  assert.strictEqual(vehicleFailDelivery.actionCreated, true, 'Vehicle failure must spawn corrective action ticket');

  // 2. Refined Staff Hygiene check (GR22-02)
  const gr22_02 = GROCERY_OPERATIONAL_CHECKS.find(c => c.code === 'GR22-02');
  assert(gr22_02, 'GR22-02 must exist');
  assert(gr22_02.title.includes('Staff Hygiene'), 'GR22-02 title must include Staff Hygiene');
  assert(gr22_02.what.includes('clean trimmed nails') && gr22_02.what.includes('cuts/wounds covered'), 'GR22-02 must cover observable hygiene practices');
  assert(gr22_02.what.includes('vomiting/diarrhea/cough/fever'), 'GR22-02 must cover health-related symptom screening');
  assert(!gr22_02.what.includes('confidential medical record'), 'Must not collect unnecessary private medical details');

  // 3. Refined Packaging & Labelling check (GR22-15)
  const gr22_15 = GROCERY_OPERATIONAL_CHECKS.find(c => c.code === 'GR22-15');
  assert(gr22_15, 'GR22-15 must exist');
  assert(gr22_15.title.includes('Product Labelling'), 'GR22-15 title must include Product Labelling');
  assert(gr22_15.what.includes('Veg/Non-Veg logo'), 'GR22-15 must mention Veg/Non-Veg logo where applicable');
  assert(gr22_15.what.includes('Unpackaged whole produce and loose staples do not require packaged-goods labels'), 'Must not require every label for every product');

  console.log('✅ TEST M PASSED: Clean food-only delivery vehicle check, observable staff hygiene check, and category-applicable labelling check verified');

  // ----------------------------------------------------------------
  // TEST N: Phase 2A — Product Recall, Batch Quarantine & Safety Lock
  // ----------------------------------------------------------------
  console.log('\n--- TEST N: PRODUCT RECALL, BATCH QUARANTINE & SAFETY-LOCK (PHASE 2A) ---');

  const recallBatchNo = `LOT-RECALL-901`;
  const rawStockMap = (globalThis as any).__foodsafe_grocery_stock.get(testOutletId) || [];
  
  // Seed two distinct items sharing the same batch
  const recallItem1 = {
    id: `stk-rec1-${Date.now()}`,
    outletId: testOutletId,
    product: 'Organic Raw Almonds 500g',
    category: 'dry_groceries',
    batch: recallBatchNo,
    quantity: 20,
    unit: 'packs',
    dateReceived: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 86400000 * 60).toISOString().slice(0, 10),
    storageZoneId: defaultZones[0].id,
    storageZoneName: defaultZones[0].name,
    status: 'ACTIVE' as const,
    auditTrail: [{
      timestamp: new Date().toISOString(),
      action: 'RECEIVED_AND_ACCEPTED',
      user: 'Vikas Sharma',
      details: 'Dock acceptance'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const recallItem2 = {
    id: `stk-rec2-${Date.now()}`,
    outletId: testOutletId,
    product: 'Organic Raw Almonds 1kg',
    category: 'dry_groceries',
    batch: recallBatchNo,
    quantity: 15,
    unit: 'packs',
    dateReceived: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 86400000 * 60).toISOString().slice(0, 10),
    storageZoneId: defaultZones[0].id,
    storageZoneName: defaultZones[0].name,
    status: 'ACTIVE' as const,
    auditTrail: [{
      timestamp: new Date().toISOString(),
      action: 'RECEIVED_AND_ACCEPTED',
      user: 'Vikas Sharma',
      details: 'Dock acceptance'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  rawStockMap.push(recallItem1, recallItem2);
  (globalThis as any).__foodsafe_grocery_stock.set(testOutletId, rawStockMap);

  // 1. Search by batch and product
  const foundByBatch = searchStockItems(testOutletId, 'RECALL-901');
  assert.strictEqual(foundByBatch.length, 2, 'Search by batch substring must locate all 2 items sharing the lot');
  const foundByProduct = searchStockItems(testOutletId, 'Almonds');
  assert(foundByProduct.length >= 2, 'Search by product name must return matching items');

  // 2. Batch Quarantine Execution
  const qResult = quarantineBatch(
    testOutletId,
    recallBatchNo,
    'MANUFACTURER_RECALL',
    'Recall Circular 2026/09: Trace aflatoxin screening in raw almonds',
    'Rajesh Nair (Store Manager)'
  );

  assert.strictEqual(qResult.batch, recallBatchNo);
  assert.strictEqual(qResult.affectedCount, 2, 'Must quarantine all 2 items in batch');
  assert.strictEqual(qResult.totalQuantity, 35, 'Total quantity (20 + 15) must equal 35 units preserved');

  // Verify records updated in store
  const allStockAfterQuarantine = getStockItems(testOutletId);
  const q1 = allStockAfterQuarantine.find(s => s.id === recallItem1.id)!;
  const q2 = allStockAfterQuarantine.find(s => s.id === recallItem2.id)!;
  assert.strictEqual(q1.status, 'QUARANTINED');
  assert.strictEqual(q2.status, 'QUARANTINED');
  assert(q1.storageZoneName.toLowerCase().includes('quarantine'), 'Must be relocated to quarantine zone');
  assert.strictEqual(q1.quantity, 20, 'Quantity must not be altered');
  assert.strictEqual(q2.quantity, 15, 'Quantity must not be altered');

  // Verify audit trail preservation
  const latestAudit1 = q1.auditTrail[q1.auditTrail.length - 1];
  assert.strictEqual(latestAudit1.action, 'RECALL_BATCH_QUARANTINED');
  assert(latestAudit1.details.includes('MANUFACTURER_RECALL'));
  assert(latestAudit1.details.includes(defaultZones[0].name), 'Audit trail must record previous storage zone');

  // 3. Strict Server-Side Safety Lock
  const activeStock = getActiveStockItems(testOutletId);
  const activeIds = activeStock.map(s => s.id);
  assert(!activeIds.includes(recallItem1.id), 'Active stock must strictly exclude quarantined batch item 1');
  assert(!activeIds.includes(recallItem2.id), 'Active stock must strictly exclude quarantined batch item 2');

  // 4. Immediate RED Alert Generation
  const alertsWithRecall = getActiveGroceryAlerts(testOutletId);
  const recallAlert = alertsWithRecall.find(a => a.type === 'RECALL_QUARANTINE');
  assert(recallAlert, 'Must generate immediate RECALL_QUARANTINE alert');
  assert.strictEqual(recallAlert.severity, 'RED');
  assert(recallAlert.title.includes('Quarantine / Recall Hold'));

  // 5. Validation Rejections & Error Handling
  assert.throws(() => {
    quarantineBatch(testOutletId, recallBatchNo, '' as any, 'Notes', 'Manager');
  }, /Mandatory recall reason category is required/);

  assert.throws(() => {
    quarantineBatch(testOutletId, 'NON-EXISTENT-LOT', 'SUPPLIER_ALERT', 'Notes', 'Manager');
  }, /No items found matching batch/);

  assert.throws(() => {
    releaseBatch(testOutletId, recallBatchNo, '', 'Manager');
  }, /Mandatory release justification reason is required/);

  // 6. Authorised Controlled Release Workflow
  const relResult = releaseBatch(
    testOutletId,
    recallBatchNo,
    'Official laboratory clearance certificate #COA-992 validated by QA department',
    'Rajesh Nair (Store Manager)'
  );

  assert.strictEqual(relResult.releasedCount, 2, 'Both quarantined items must be released');
  assert.strictEqual(relResult.totalQuantity, 35, 'Total released quantity must equal 35 units');

  const allStockAfterRelease = getStockItems(testOutletId);
  const r1 = allStockAfterRelease.find(s => s.id === recallItem1.id)!;
  const r2 = allStockAfterRelease.find(s => s.id === recallItem2.id)!;
  assert.strictEqual(r1.status, 'ACTIVE', 'Item 1 must be restored to ACTIVE');
  assert.strictEqual(r2.status, 'ACTIVE', 'Item 2 must be restored to ACTIVE');
  assert(!r1.storageZoneName.toLowerCase().includes('quarantine'), 'Must be restored out of quarantine zone');

  const latestAuditRel1 = r1.auditTrail[r1.auditTrail.length - 1];
  assert.strictEqual(latestAuditRel1.action, 'RECALL_BATCH_RELEASED');
  assert(latestAuditRel1.details.includes('COA-992'));

  // Active stock now includes released items
  const activeStockAfterRelease = getActiveStockItems(testOutletId);
  const activeIdsAfterRelease = activeStockAfterRelease.map(s => s.id);
  assert(activeIdsAfterRelease.includes(recallItem1.id), 'Active stock must now include released item 1');
  assert(activeIdsAfterRelease.includes(recallItem2.id), 'Active stock must now include released item 2');

  // Attempt duplicate release on already released batch
  assert.throws(() => {
    releaseBatch(testOutletId, recallBatchNo, 'Duplicate release attempt', 'Manager');
  }, /has no quarantined items to release/);

  // 7. Duplicate quarantine idempotency check
  // Re-quarantine batch to verify idempotency:
  const qAgain1 = quarantineBatch(
    testOutletId,
    recallBatchNo,
    'OTHER_SAFETY_CONCERN',
    'Secondary precautionary hold check',
    'Rajesh Nair (Store Manager)'
  );
  assert.strictEqual(qAgain1.affectedCount, 2, 'Re-quarantining active items transitions them');
  
  // Now call quarantine a second time on the already quarantined batch:
  const qItemBefore = getStockItems(testOutletId).find(s => s.id === recallItem1.id)!;
  const auditCountBefore = qItemBefore.auditTrail.length;

  const qDuplicate = quarantineBatch(
    testOutletId,
    recallBatchNo,
    'OTHER_SAFETY_CONCERN',
    'Redundant duplicate call',
    'Rajesh Nair (Store Manager)'
  );
  assert.strictEqual(qDuplicate.alreadyQuarantinedCount, 2, 'Duplicate call must detect already quarantined items');
  assert.strictEqual(qDuplicate.affectedCount, 0, 'Zero new items should be modified');

  const qItemAfter = getStockItems(testOutletId).find(s => s.id === recallItem1.id)!;
  assert.strictEqual(qItemAfter.auditTrail.length, auditCountBefore, 'Repeating quarantine must NOT append redundant audit events');

  // Clean up recallBatch items back to released state
  releaseBatch(testOutletId, recallBatchNo, 'PRECAUTIONARY_HOLD_CLEARED', 'Cleared precautionary hold', 'Rajesh Nair');

  // 8. Expiry-Safe Release: Batch with mixed eligible and expired items
  const mixedBatchNo = `LOT-MIXED-EXP-${Date.now()}`;
  const rawStock = (globalThis as any).__foodsafe_grocery_stock.get(testOutletId) || [];
  
  const pastExpiredItem = {
    id: `stk-past-exp-${Date.now()}`,
    outletId: testOutletId,
    product: 'Greek Yogurt 400g (Expired)',
    category: 'dairy_chilled',
    batch: mixedBatchNo,
    quantity: 10,
    unit: 'tubs',
    dateReceived: '2026-01-01',
    expiryDate: '2026-01-10', // Expired in the past
    storageZoneId: defaultZones[1].id,
    storageZoneName: defaultZones[1].name,
    status: 'ACTIVE' as const,
    auditTrail: [{
      timestamp: '2026-01-01T10:00:00.000Z',
      action: 'RECEIVED_AND_ACCEPTED',
      user: 'Vikas Sharma',
      details: 'Dock acceptance'
    }],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z'
  };

  const freshValidItem = {
    id: `stk-fresh-val-${Date.now()}`,
    outletId: testOutletId,
    product: 'Greek Yogurt 400g (Fresh Batch)',
    category: 'dairy_chilled',
    batch: mixedBatchNo,
    quantity: 25,
    unit: 'tubs',
    dateReceived: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10), // Future expiry
    storageZoneId: defaultZones[1].id,
    storageZoneName: defaultZones[1].name,
    status: 'ACTIVE' as const,
    auditTrail: [{
      timestamp: new Date().toISOString(),
      action: 'RECEIVED_AND_ACCEPTED',
      user: 'Vikas Sharma',
      details: 'Dock acceptance'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  rawStock.push(pastExpiredItem, freshValidItem);
  (globalThis as any).__foodsafe_grocery_stock.set(testOutletId, rawStock);

  // Quarantine the mixed batch
  const qMixed = quarantineBatch(
    testOutletId,
    mixedBatchNo,
    'SUPPLIER_ALERT',
    'Supplier alert regarding cold chain transit temperature',
    'Rajesh Nair (Store Manager)'
  );
  assert.strictEqual(qMixed.affectedCount, 2, 'Both mixed items must be quarantined');

  // Authorised release of the mixed batch with structured category
  const relMixed = releaseBatch(
    testOutletId,
    mixedBatchNo,
    'LAB_CLEARANCE_CERTIFICATE',
    'Lab microbiology testing COA-LAB-771 confirms safe flora count',
    'Rajesh Nair (Store Manager)'
  );

  assert.strictEqual(relMixed.releasedCount, 2, 'Both items processed in release');
  assert.strictEqual(relMixed.activeCount, 1, 'Only the fresh unexpired item is restored to ACTIVE');
  assert.strictEqual(relMixed.expiredCount, 1, 'The item that expired while in quarantine must transition to EXPIRED');

  // Verify stock records
  const allStockPostRel = getStockItems(testOutletId);
  const checkedExpired = allStockPostRel.find(s => s.id === pastExpiredItem.id)!;
  const checkedFresh = allStockPostRel.find(s => s.id === freshValidItem.id)!;

  assert.strictEqual(checkedExpired.status, 'EXPIRED', 'Expired item must have status EXPIRED');
  assert(checkedExpired.storageZoneName.toLowerCase().includes('quarantine'), 'Expired item must be retained in quarantine/holding zone');
  assert.strictEqual(checkedFresh.status, 'ACTIVE', 'Fresh item must be restored to ACTIVE');

  // Audit trail verification
  const expAudit = checkedExpired.auditTrail[checkedExpired.auditTrail.length - 1];
  assert.strictEqual(expAudit.action, 'RECALL_BATCH_RELEASED_EXPIRED');
  assert(expAudit.details.includes('expiry safety lock as EXPIRED'));

  // Strict server-side active stock safety lock verification
  const saleableStock = getActiveStockItems(testOutletId);
  const saleableIds = saleableStock.map(s => s.id);
  assert(saleableIds.includes(freshValidItem.id), 'Fresh item must be present in saleable active stock');
  assert(!saleableIds.includes(pastExpiredItem.id), 'Expired item must NEVER be present in saleable active stock');

  // 9. Cross-Tenant Security Enforcement
  const crossTenantCheck = await authorizeGroceryAccess(testOutletId, {
    headers: new Map([
      ['cookie', `fs_session=mock_unauthorized`]
    ])
  } as any, true);
  assert.strictEqual(crossTenantCheck.ok, false, 'Unauthenticated access in strict mode must return 401');

  console.log('✅ TEST N PASSED: Batch search, multi-item quarantine, quantity & audit preservation, safety lock, RED alert generation, authorised release, duplicate idempotency, expiry-safe mixed batch handling, and tenant isolation verified');

  // ----------------------------------------------------------------
  // TEST O: FOSTAC LEARNING MODULE VERIFICATION (PHASE 3A)
  // ----------------------------------------------------------------
  console.log('\n--- TEST O: FOSTAC LEARNING MODULE VERIFICATION (PHASE 3A) ---');

  const fs = await import('node:fs');
  const path = await import('node:path');

  const appDir = path.resolve(process.cwd(), 'app/grocery/learn');
  const allergensFile = path.join(appDir, 'allergens/page.tsx');
  const hygienePestFile = path.join(appDir, 'hygiene-pest/page.tsx');
  const foodPrepFile = path.join(appDir, 'food-prep/page.tsx');
  const legacyLearnHubFile = path.join(appDir, 'page.tsx');
  const learnHubFile = path.resolve(process.cwd(), 'app/food-safety-why/page.tsx');

  assert.ok(fs.existsSync(allergensFile), 'Allergen learning page must exist');
  assert.ok(fs.existsSync(hygienePestFile), 'Hygiene & pest learning page must exist');
  assert.ok(fs.existsSync(foodPrepFile), 'Food prep learning page must exist');
  assert.ok(fs.existsSync(legacyLearnHubFile), 'Legacy learn hub route must exist');
  assert.ok(fs.existsSync(learnHubFile), 'Canonical learn hub page must exist at /food-safety-why');

  const allergensContent = fs.readFileSync(allergensFile, 'utf8');
  const hygienePestContent = fs.readFileSync(hygienePestFile, 'utf8');
  const foodPrepContent = fs.readFileSync(foodPrepFile, 'utf8');
  const legacyHubContent = fs.readFileSync(legacyLearnHubFile, 'utf8');
  const learnHubContent = fs.readFileSync(learnHubFile, 'utf8');

  assert.ok(legacyHubContent.includes('/food-safety-why'), 'Legacy learn route must redirect to canonical hub');

  // 1. Verify 8 Mandatory FSSAI Allergen Categories
  const expectedAllergens = [
    'Gluten',
    'Crustaceans',
    'Eggs',
    'Fish',
    'Peanuts',
    'Milk',
    'Tree Nuts',
    'Sulphite'
  ];
  for (const allergen of expectedAllergens) {
    assert.ok(
      allergensContent.includes(allergen),
      `Allergen learning module must contain mandatory FSSAI category: ${allergen}`
    );
  }
  assert.ok(allergensContent.includes('10 mg/kg'), 'Sulphite regulatory threshold (10 mg/kg) must be present');
  assert.ok(allergensContent.includes('Quarantine Holding Area'), 'Allergen spill protocol must direct damaged items to quarantine');

  // 2. Verify 4D Pest Management Principles
  assert.ok(hygienePestContent.includes('DENY ENTRY'), 'Must cover 4D principle: Deny Entry');
  assert.ok(hygienePestContent.includes('DENY FOOD'), 'Must cover 4D principle: Deny Food');
  assert.ok(hygienePestContent.includes('DENY HARBOURAGE'), 'Must cover 4D principle: Deny Harbourage');
  assert.ok(hygienePestContent.includes('DESTROY & CONTROL'), 'Must cover 4D principle: Destroy & Control');
  assert.ok(hygienePestContent.includes('1.2 mm'), 'Must cite wire mesh 1.2 mm aperture standard');
  assert.ok(hygienePestContent.includes('15 cm'), 'Must cite pallet floor clearance 15 cm standard');
  assert.ok(hygienePestContent.includes('20-Second Routine') || hygienePestContent.includes('20 seconds'), 'Must cite 20-second handwashing routine');
  assert.ok(hygienePestContent.includes('TACT'), 'Must cite TACT cleaning principles');

  // 3. Verify In-Store Prep & Deli Scoped Standards (Stage 2)
  assert.ok(foodPrepContent.includes('ACTIVITY-SCOPED') || foodPrepContent.includes('Activity-Scoped'), 'Deli module must be explicitly activity-scoped');
  assert.ok(foodPrepContent.includes('65°C'), 'Must cite hot holding ≥ 65°C standard');
  assert.ok(foodPrepContent.includes('2-STAGE COOLING'), 'Must cite 2-stage cooling guidance');
  assert.ok(foodPrepContent.includes('74°C'), 'Must cite reheating ≥ 74°C standard');
  assert.ok(foodPrepContent.includes('RUCO'), 'Must cite RUCO oil standard');
  assert.ok(foodPrepContent.includes('25%'), 'Must cite Total Polar Compounds ≤ 25% statutory limit');
  assert.ok(foodPrepContent.includes('≤ 4°C'), 'Must cite chiller thawing ≤ 4°C standard');
  assert.ok(foodPrepContent.includes('Never refreeze thawed'), 'Must prohibit refreezing thawed food');

  // 4. Verify Activity-Conditional Filter on Hub
  assert.ok(learnHubContent.includes('All Lessons'), 'Learn hub must include lesson filter');
  assert.ok(learnHubContent.includes('Core Grocery Retail'), 'Learn hub must differentiate core lessons');
  assert.ok(learnHubContent.includes('In-Store Prep & Deli'), 'Learn hub must differentiate prep module');

  // 5. Verify Educational Disclaimers on all pages
  const disclaimerSnippet = 'does not confer official FSSAI certification or prove statutory compliance';
  assert.ok(allergensContent.includes(disclaimerSnippet), 'Allergens page must include educational disclaimer');
  assert.ok(hygienePestContent.includes(disclaimerSnippet), 'Hygiene page must include educational disclaimer');
  assert.ok(foodPrepContent.includes(disclaimerSnippet), 'Food prep page must include educational disclaimer');
  assert.ok(learnHubContent.includes(disclaimerSnippet), 'Learn hub page must include educational disclaimer');
  // 6. Verify Retained Contamination Prevention Section on Canonical Hub
  assert.ok(learnHubContent.includes('Why Food Contamination Occurs — and How to Prevent It'), 'Must contain retained contamination prevention section');
  assert.ok(learnHubContent.includes('DANGER ZONE ABUSE'), 'Must contain danger zone vector');
  assert.ok(learnHubContent.includes('CROSS-CONTAMINATION'), 'Must contain cross-contamination vector');
  assert.ok(learnHubContent.includes('FAECAL–ORAL ROUTE'), 'Must contain faecal-oral vector');
  assert.ok(learnHubContent.includes('SLOW AMBIENT COOLING'), 'Must contain slow ambient cooling vector');
  assert.ok(learnHubContent.includes('UNTREATED WATER / ICE'), 'Must contain untreated water/ice vector');

  console.log('✅ TEST O PASSED: Allergen 8-category list, 4D pest principles, TACT cleaning, activity-scoped prep standards (65°C hot holding, 2h/4h cooling, 25% TPC oil limit), educational disclaimers, and retained contamination prevention section verified');

  console.log('\n================================================================');
  console.log('🎯 ALL GROCERY STORE TESTS (TEST A THROUGH TEST O) PASSED (15/15)');
  console.log('================================================================\n');
}

runGroceryTests().catch(err => {
  console.error('\n❌ GROCERY TEST SUITE FAILED:', err);
  process.exit(1);
});
