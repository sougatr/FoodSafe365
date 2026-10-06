import assert from 'node:assert';
import {
  listServiceProviders,
  registerServiceProvider,
  listServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  getServiceRequestById
} from '../lib/service-provider-store';
import {
  CONTROLLED_SERVICE_CATEGORIES,
  isExternalServiceRequired,
  inferServiceCategory
} from '../lib/service-provider-contracts';
import { createDemoAction, getDemoAction, updateDemoAction } from '../lib/demo-store';

async function runStage3Verification() {
  console.log('====================================================');
  console.log('FOODSAFE365 — SERVICE PROVIDER JOURNEY VERIFICATION');
  console.log('====================================================\n');

  // Seed / find test providers
  const providers = await listServiceProviders({ category: 'refrigeration' });
  assert.ok(providers.length > 0, 'Should find refrigeration providers');
  const frostline = providers.find(p => p.id === 'prov-refrig-frost') || providers[0];

  // -------------------------------------------------------------------------
  // TEST A: SERVICE REQUEST CREATED FROM ACTION WITH EXTERNAL FLAG
  // -------------------------------------------------------------------------
  console.log('--- TEST A: SERVICE REQUEST CREATED FROM ACTION WITH EXTERNAL FLAG ---');
  const demoActionA = createDemoAction({
    title: 'Walk-in Chiller Temperature Deviation',
    description: 'Chiller 1 recorded 9.2C. Immediate containment: transferred dairy products to standby unit.',
    severity: 'high',
    priority: 'high',
    sourceCheckCode: 'FS28-19',
    requiresExternalService: true,
    serviceCategory: 'refrigeration'
  }, 'mgr-user-01');

  assert.strictEqual(demoActionA.requiresExternalService, true, 'Action must have requiresExternalService = true');
  assert.strictEqual(isExternalServiceRequired(demoActionA), true, 'Helper must identify external service required');

  const serviceReqA = await createServiceRequest({
    organisationId: 'org-abc',
    outletId: 'outlet-mumbai-01',
    outletName: 'ABC Restaurant - Bandra',
    outletCity: 'Mumbai',
    outletAddress: 'Plot 42, Linking Road, Bandra West, Mumbai',
    correctiveActionId: demoActionA.id,
    correctiveActionTitle: demoActionA.title,
    providerId: frostline.id,
    providerName: frostline.businessName,
    serviceCategory: 'refrigeration',
    problemDescription: 'Walk-in chiller compressor fault requiring immediate technician overhaul.',
    priority: 'high',
    contactPerson: 'Ramesh Kumar (Store Manager)',
    contactPhone: '+91 98200 12345',
    notes: 'Access through rear service lane before 11:30 AM.'
  });

  assert.ok(serviceReqA.id, 'Must generate unique service request ID');
  assert.strictEqual(serviceReqA.status, 'requested', 'Initial status must be requested');
  assert.strictEqual(serviceReqA.correctiveActionId, demoActionA.id);
  assert.strictEqual(serviceReqA.priority, 'high');
  assert.strictEqual(serviceReqA.contactPerson, 'Ramesh Kumar (Store Manager)');
  assert.strictEqual(serviceReqA.contactPhone, '+91 98200 12345');
  assert.ok(serviceReqA.auditTrail && serviceReqA.auditTrail.length > 0, 'Audit trail must initialize on creation');
  console.log('✅ TEST A PASSED: Service request created with external flag, priority, contact info & audit trail.\n');

  // -------------------------------------------------------------------------
  // TEST B: ROUTINE INTERNAL ACTION DOES NOT SHOW SERVICE PROVIDER OPTION
  // -------------------------------------------------------------------------
  console.log('--- TEST B: ROUTINE INTERNAL ACTION DOES NOT SHOW SERVICE PROVIDER OPTION ---');
  const routineActions = [
    { title: 'Wipe cutting board after raw prep', description: 'Cutting board wiped and sanitized with Quat spray', requiresExternalService: false },
    { title: 'Throw away expired milk cartons', description: '2 spoiled tetra packs disposed of in bio waste', requiresExternalService: false },
    { title: 'Log temperature in food-safe app', description: 'Routine twice-daily line cooler temperature recording', requiresExternalService: false },
    { title: 'Put on hairnet before entering kitchen', description: 'Staff member reminded to wear clean disposable hairnet', requiresExternalService: false }
  ];

  for (const act of routineActions) {
    const isRequired = isExternalServiceRequired(act);
    assert.strictEqual(isRequired, false, `Routine action "${act.title}" must NOT require external service`);
  }
  console.log('✅ TEST B PASSED: Routine internal actions strictly filtered out from external service workflow.\n');

  // -------------------------------------------------------------------------
  // TEST C: SERVICE REQUEST VISIBLE TO PROVIDER
  // -------------------------------------------------------------------------
  console.log('--- TEST C: SERVICE REQUEST VISIBLE TO PROVIDER ---');
  const providerRequests = await listServiceRequests({ providerId: frostline.id });
  const foundReq = providerRequests.find(r => r.id === serviceReqA.id);
  assert.ok(foundReq, 'Service request must be visible in target provider request list');
  assert.strictEqual(foundReq?.outletName, 'ABC Restaurant - Bandra');
  assert.strictEqual(foundReq?.status, 'requested');
  console.log('✅ TEST C PASSED: Service request is visible and retrievable by assigned service provider.\n');

  // -------------------------------------------------------------------------
  // TEST D: PROVIDER ACCEPTS REQUEST -> STATUS UPDATES TO ACCEPTED
  // -------------------------------------------------------------------------
  console.log('--- TEST D: PROVIDER ACCEPTS REQUEST -> STATUS UPDATES TO ACCEPTED ---');
  const acceptedReq = await updateServiceRequestStatus(
    serviceReqA.id,
    'accepted',
    'Technician Sunil assigned. ETA 10:00 AM.',
    'FrostLine Chillers & Cold Chain'
  );
  assert.ok(acceptedReq, 'Update must return updated request object');
  assert.strictEqual(acceptedReq.status, 'accepted', 'Status must transition to accepted');
  console.log('✅ TEST D PASSED: Provider acceptance recorded: status = accepted.\n');

  // -------------------------------------------------------------------------
  // TEST E: PROVIDER STARTS SERVICE -> STATUS UPDATES TO IN_PROGRESS
  // -------------------------------------------------------------------------
  console.log('--- TEST E: PROVIDER STARTS SERVICE -> STATUS UPDATES TO IN_PROGRESS ---');
  const inProgressReq = await updateServiceRequestStatus(
    serviceReqA.id,
    'in_progress',
    'Technician on site inspecting condenser coil.',
    'Technician Sunil'
  );
  assert.ok(inProgressReq);
  assert.strictEqual(inProgressReq.status, 'in_progress', 'Status must transition to in_progress');
  console.log('✅ TEST E PASSED: Service start recorded: status = in_progress.\n');

  // -------------------------------------------------------------------------
  // TEST F: PROVIDER COMPLETES SERVICE WITH NOTES -> STATUS UPDATES TO COMPLETED
  // -------------------------------------------------------------------------
  console.log('--- TEST F: PROVIDER COMPLETES SERVICE WITH NOTES -> STATUS UPDATES TO COMPLETED ---');
  const completionNote = 'Replaced compressor thermostat sensor and recharged refrigerant. Core unit stabilized at 2.8C. [Recommended Follow-up: 2026-11-01]';
  const completedReq = await updateServiceRequestStatus(
    serviceReqA.id,
    'completed',
    completionNote,
    'Technician Sunil'
  );
  assert.ok(completedReq);
  assert.strictEqual(completedReq.status, 'completed', 'Status must transition to completed');
  assert.ok(completedReq.completedAt, 'completedAt timestamp must be recorded');
  assert.strictEqual(completedReq.completionNotes, completionNote, 'Completion notes must be captured');
  console.log('✅ TEST F PASSED: Service completed with timestamp & mandatory completion notes.\n');

  // -------------------------------------------------------------------------
  // TEST G: RESTAURANT VERIFIES COMPLETION -> ACTION MOVES TO VERIFIED/CLOSED
  // -------------------------------------------------------------------------
  console.log('--- TEST G: RESTAURANT VERIFIES COMPLETION -> ACTION MOVES TO VERIFIED/CLOSED ---');
  // 1. Service completion does NOT automatically close the corrective action (Governance Rule)
  const actionBeforeConfirm = getDemoAction(demoActionA.id, 'mgr-user-01');
  assert.notStrictEqual(actionBeforeConfirm?.status, 'closed', 'Service completion must NEVER auto-close action');

  // 2. Restaurant verifies external completion
  const verifiedService = await updateServiceRequestStatus(
    serviceReqA.id,
    'restaurant_confirmed',
    'Manager inspected walk-in chiller. Core temp confirmed at 2.8C.',
    'Manager Ramesh'
  );
  assert.ok(verifiedService);
  assert.strictEqual(verifiedService.status, 'restaurant_confirmed', 'Status must transition to restaurant_confirmed');
  assert.ok(verifiedService.confirmedAt, 'confirmedAt timestamp must be recorded');

  // 3. Move action to awaiting_verification, then verify & close by restaurant manager
  updateDemoAction(demoActionA.id, { status: 'awaiting_verification' }, 'mgr-user-01');
  const closedAction = updateDemoAction(
    demoActionA.id,
    { status: 'closed', closedAt: new Date().toISOString(), verificationNote: 'On-site verification passed.' },
    'mgr-user-01'
  );
  assert.strictEqual(closedAction?.status, 'closed', 'Action must transition to closed upon manager verification');
  assert.ok(closedAction?.closedAt, 'closedAt timestamp must be recorded');
  console.log('✅ TEST G PASSED: Restaurant verified completion -> Food-safety action verified and closed.\n');

  // -------------------------------------------------------------------------
  // TEST H: RESTAURANT REJECTS COMPLETION -> RETURNS TO IN_PROGRESS WITH EXPLANATION
  // -------------------------------------------------------------------------
  console.log('--- TEST H: RESTAURANT REJECTS COMPLETION -> RETURNS TO IN_PROGRESS WITH EXPLANATION ---');
  // Create another service request to test rejection / further action flow
  const demoActionB = createDemoAction({
    title: 'Kitchen Exhaust Hood Grease Accumulation',
    description: 'Heavy grease accumulation posing fire risk FS28-02.',
    severity: 'critical',
    priority: 'urgent',
    sourceCheckCode: 'FS28-02',
    requiresExternalService: true,
    serviceCategory: 'deep_cleaning'
  }, 'mgr-user-01');

  const ecocleanList = await listServiceProviders({ category: 'deep_cleaning' });
  const ecoclean = ecocleanList[0];

  const serviceReqB = await createServiceRequest({
    organisationId: 'org-abc',
    outletId: 'outlet-mumbai-01',
    outletName: 'ABC Restaurant - Bandra',
    outletCity: 'Mumbai',
    correctiveActionId: demoActionB.id,
    correctiveActionTitle: demoActionB.title,
    providerId: ecoclean.id,
    providerName: ecoclean.businessName,
    serviceCategory: 'deep_cleaning',
    problemDescription: 'Chemical degreasing of baffles and ductwork required.'
  });

  await updateServiceRequestStatus(serviceReqB.id, 'accepted', undefined, 'EcoClean');
  await updateServiceRequestStatus(serviceReqB.id, 'in_progress', undefined, 'EcoClean Technician');
  await updateServiceRequestStatus(serviceReqB.id, 'completed', 'Cleaned main filters.', 'EcoClean Technician');

  // Restaurant manager inspects on-site and finds filters still sticky -> NEEDS FURTHER ACTION
  const rejectionExplanation = 'Ductwork behind baffle filters still has heavy grease deposits. Needs secondary degreasing.';
  const rejectedReq = await updateServiceRequestStatus(
    serviceReqB.id,
    'in_progress',
    rejectionExplanation,
    'Manager Ramesh'
  );
  assert.ok(rejectedReq);
  assert.strictEqual(rejectedReq.status, 'in_progress', 'Request must return to in_progress');
  assert.strictEqual(rejectedReq.rejectionNotes, rejectionExplanation, 'Rejection explanation must be recorded');
  
  // Verify audit trail recorded rejection
  const lastAudit = rejectedReq.auditTrail?.[rejectedReq.auditTrail.length - 1];
  assert.ok(lastAudit?.notes?.includes(rejectionExplanation), 'Audit trail must record rejection explanation');
  console.log('✅ TEST H PASSED: Rejection loop returns request to in_progress with mandatory explanation.\n');

  // -------------------------------------------------------------------------
  // TEST I: MULTI-TENANT ISOLATION
  // -------------------------------------------------------------------------
  console.log('--- TEST I: MULTI-TENANT ISOLATION ---');
  // Create request for Outlet B in Pune
  const reqOutletB = await createServiceRequest({
    organisationId: 'org-xyz',
    outletId: 'outlet-pune-02',
    outletName: 'XYZ Kitchen - Pune',
    outletCity: 'Pune',
    correctiveActionId: 'action-xyz-99',
    correctiveActionTitle: 'Commercial Pest Treatment',
    providerId: 'prov-pest-apex',
    providerName: 'Apex Commercial Pest Control',
    serviceCategory: 'pest_control',
    problemDescription: 'Quarterly spray and gel application.'
  });

  // Query for Outlet A
  const outletARequests = await listServiceRequests({ outletId: 'outlet-mumbai-01' });
  assert.ok(
    !outletARequests.some(r => r.id === reqOutletB.id),
    'Outlet A must NEVER see Outlet B service requests'
  );

  // Query for Frostline (refrigeration provider)
  const frostlineRequests = await listServiceRequests({ providerId: frostline.id });
  assert.ok(
    !frostlineRequests.some(r => r.id === reqOutletB.id),
    'Provider FrostLine must NEVER see Apex Pest Control service requests'
  );
  console.log('✅ TEST I PASSED: Multi-tenant isolation between outlets and providers strictly enforced.\n');

  // -------------------------------------------------------------------------
  // TEST J: AUDIT TRAIL CAPTURES ALL TRANSITIONS WITH ACTORS AND TIMESTAMPS
  // -------------------------------------------------------------------------
  console.log('--- TEST J: AUDIT TRAIL CAPTURES ALL TRANSITIONS WITH ACTORS AND TIMESTAMPS ---');
  const auditedReq = await getServiceRequestById(serviceReqA.id);
  assert.ok(auditedReq, 'Audited request must exist');
  assert.ok(auditedReq.auditTrail && auditedReq.auditTrail.length >= 4, 'Audit trail must record all status transitions');

  const trail = auditedReq.auditTrail;
  const statusesRecorded = trail.map(t => t.status);
  assert.ok(statusesRecorded.includes('requested'), 'Must record requested event');
  assert.ok(statusesRecorded.includes('accepted'), 'Must record accepted event');
  assert.ok(statusesRecorded.includes('in_progress'), 'Must record in_progress event');
  assert.ok(statusesRecorded.includes('completed'), 'Must record completed event');
  assert.ok(statusesRecorded.includes('restaurant_confirmed'), 'Must record restaurant_confirmed event');

  trail.forEach(entry => {
    assert.ok(entry.timestamp, 'Every audit entry must have a timestamp');
    assert.ok(entry.user, 'Every audit entry must have an actor/user');
    assert.ok(entry.action, 'Every audit entry must have an action description');
    assert.ok(entry.status, 'Every audit entry must have a status');
  });
  console.log('✅ TEST J PASSED: Complete audit trail verified with timestamps, actors, actions, and notes.\n');

  console.log('====================================================');
  console.log('ALL TESTS A THROUGH J PASSED SUCCESSFULLY! (10/10)');
  console.log('====================================================');
}

runStage3Verification().catch(err => {
  console.error('❌ STAGE 3 TEST FAILURE:', err);
  process.exit(1);
});
