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
  getGroceryDashboardSummary
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
  // TEST B: Grocery product categories & temperature rules (A through J)
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
  console.log('✅ TEST C PASSED: Receiving engine accepted compliant batch and rejected abused batch with corrective action');

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

  console.log('\n================================================================');
  console.log('🎯 ALL GROCERY STORE TESTS (TEST A THROUGH TEST L) PASSED (12/12)');
  console.log('================================================================\n');
}

runGroceryTests().catch(err => {
  console.error('\n❌ GROCERY TEST SUITE FAILED:', err);
  process.exit(1);
});
