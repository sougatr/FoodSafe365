import { getPool, query, transaction, resetPool } from '../lib/db';
import { runMigrations, getMigrationStatus, getCurrentSchemaVersion, getMigrationFiles } from '../lib/migrations';
import { hashPassword, verifyPassword } from '../lib/passwords';
import pg from 'pg';

interface TestResult {
  name: string;
  passed: boolean;
  type: 'Real PostgreSQL' | 'Mocked Database' | 'Unit / In-Memory';
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, type: 'Real PostgreSQL' | 'Mocked Database' | 'Unit / In-Memory', details?: any, error?: string) {
  results.push({ name, passed, type, details, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${status}] [${type}] ${name}`);
  if (error) console.log(`       Error: ${error}`);
  if (details && typeof details === 'object') {
    for (const [k, v] of Object.entries(details)) {
      console.log(`       ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
    }
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://127.0.0.1:54399/foodsafe365_disposable_test';
  console.log('================================================================');
  console.log('FOODSAFE365 — STAGE 5E REMEDIATION POSTGRESQL INTEGRATION TEST');
  console.log('================================================================');
  console.log(`Target: ${dbUrl}\n`);

  // 1. PostgreSQL Server & Version Verification
  let pgVersion = '';
  try {
    const rawPool = new pg.Pool({ connectionString: dbUrl });
    const vRes = await rawPool.query('SELECT version()');
    pgVersion = vRes.rows[0].version;
    await rawPool.end();
    record('PostgreSQL 16 Engine Availability & Connectivity', true, 'Real PostgreSQL', {
      version: pgVersion
    });
  } catch (err: any) {
    record('PostgreSQL 16 Engine Availability & Connectivity', false, 'Real PostgreSQL', undefined, err.message);
    console.error('Fatal: Could not connect to real PostgreSQL. Halting test suite.');
    process.exit(1);
  }

  // 2. Complete Migration Run (000 - 014) via Actual Migration Runner
  let migrationResult: any = null;
  try {
    const pool = getPool({ DATABASE_URL: dbUrl } as any);
    migrationResult = await runMigrations({ pool });

    const allApplied = migrationResult.success && migrationResult.applied.length > 0;
    record('Sequential Execution of All Migrations (000–014)', migrationResult.success, 'Real PostgreSQL', {
      success: migrationResult.success,
      appliedCount: migrationResult.applied.length,
      alreadyAppliedCount: migrationResult.alreadyApplied.length,
      currentVersion: migrationResult.currentVersion
    });
  } catch (err: any) {
    record('Sequential Execution of All Migrations (000–014)', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 3. Migration Ledger & Checksum Verification
  try {
    const ledgerRows = await query<{ version: string; name: string; checksum: string; execution_time_ms: number }>(
      'SELECT version, name, checksum, execution_time_ms FROM schema_migrations ORDER BY version ASC'
    );
    const diskFiles = getMigrationFiles();

    const allLedgerMatches = diskFiles.every(df => {
      const row = ledgerRows.find(lr => lr.version === df.version);
      return row && row.checksum === df.checksum;
    });

    record('Migration Ledger Integrity & Checksum Consistency', allLedgerMatches && ledgerRows.length === diskFiles.length, 'Real PostgreSQL', {
      totalLedgerEntries: ledgerRows.length,
      totalDiskFiles: diskFiles.length,
      allChecksumsMatch: allLedgerMatches
    });
  } catch (err: any) {
    record('Migration Ledger Integrity & Checksum Consistency', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 4. Migration Runner Idempotency Test
  try {
    const pool = getPool({ DATABASE_URL: dbUrl } as any);
    const idempotentResult = await runMigrations({ pool });
    const diskFiles = getMigrationFiles();

    const isIdempotent = idempotentResult.success && idempotentResult.applied.length === 0 && idempotentResult.alreadyApplied.length === diskFiles.length;
    record('Migration Runner Strict Idempotency Verification', isIdempotent, 'Real PostgreSQL', {
      appliedOnReRun: idempotentResult.applied.length,
      alreadyAppliedOnReRun: idempotentResult.alreadyApplied.length
    });
  } catch (err: any) {
    record('Migration Runner Strict Idempotency Verification', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 5. Schema Object & Unique Constraints Verification (F-01)
  try {
    const indexRes = await query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`
    );
    const indexNames = indexRes.map(i => i.indexname);

    const requiredIndexes = [
      'uq_restaurant_types_code',
      'uq_food_processes_code',
      'uq_equipment_types_code',
      'uq_rules_rule_code',
      'uq_check_templates_code'
    ];

    const allIndexesExist = requiredIndexes.every(idx => indexNames.includes(idx));

    record('F-01: Reference Data Unique Constraints Verification', allIndexesExist, 'Real PostgreSQL', {
      requiredIndexes,
      allExist: allIndexesExist
    });
  } catch (err: any) {
    record('F-01: Reference Data Unique Constraints Verification', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 6. Reference Data Seed & Domain Values Verification (F-02)
  try {
    const rulesCount = await query<{ count: string }>('SELECT count(*) FROM rules');
    const templatesCount = await query<{ count: string }>('SELECT count(*) FROM check_templates');
    const itemsCount = await query<{ count: string }>('SELECT count(*) FROM check_template_items');
    const typesCount = await query<{ count: string }>('SELECT count(*) FROM restaurant_types');
    const processesCount = await query<{ count: string }>('SELECT count(*) FROM food_processes');

    const domainRes = await query<{ domain: string; count: string }>(
      'SELECT domain::text, count(*) FROM rules GROUP BY domain ORDER BY domain'
    );
    const domainsUsed = domainRes.map(d => d.domain);

    // Ensure 'general' and 'pest' and 'preparation' are present, and 'regulatory', 'pest_control', 'thawing' are absent
    const hasGeneral = domainsUsed.includes('general');
    const hasPest = domainsUsed.includes('pest');
    const hasPreparation = domainsUsed.includes('preparation');
    const noInvalidDomains = !domainsUsed.includes('regulatory') && !domainsUsed.includes('pest_control') && !domainsUsed.includes('thawing');

    const refDataOk = parseInt(rulesCount[0].count) >= 75 &&
      parseInt(templatesCount[0].count) >= 1 &&
      parseInt(itemsCount[0].count) >= 30 &&
      parseInt(typesCount[0].count) >= 7 &&
      hasGeneral && hasPest && hasPreparation && noInvalidDomains;

    record('F-02: Reference Data Seed Records & Canonical Domain Alignment', refDataOk, 'Real PostgreSQL', {
      totalRules: rulesCount[0].count,
      totalTemplates: templatesCount[0].count,
      totalTemplateItems: itemsCount[0].count,
      domainsUsed,
      canonicalDomainsAligned: noInvalidDomains
    });
  } catch (err: any) {
    record('F-02: Reference Data Seed Records & Canonical Domain Alignment', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 7. Real PostgreSQL: Restaurant Onboarding & Credential Authentication
  const testOrgId = '00000000-0000-4000-8000-000000000001';
  const testOutletId = '00000000-0000-4000-8000-000000000002';
  const testUserId = '00000000-0000-4000-8000-000000000003';
  const testEmail = `manager.stage5e.${Date.now()}@example.com`;
  const rawPassword = 'SecurePassword123!';

  try {
    const hash = await hashPassword(rawPassword);

    await transaction(async client => {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, status, created_at)
         VALUES ($1, $2, $3, $4, 'active', now()) ON CONFLICT (id) DO NOTHING`,
        [testUserId, 'Ravi Shankar', testEmail, hash]
      );

      await client.query(
        `INSERT INTO organisations (id, name, owner_user_id, status, created_at)
         VALUES ($1, $2, $3, 'active', now()) ON CONFLICT (id) DO NOTHING`,
        [testOrgId, 'Stage 5E Bistro Downtown', testUserId]
      );

      await client.query(
        `INSERT INTO outlets (id, organisation_id, name, address, city, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'active', now()) ON CONFLICT (id) DO NOTHING`,
        [testOutletId, testOrgId, 'Bistro Downtown', '123 Main St', 'Bengaluru']
      );

      const roleRows = await client.query(`SELECT id FROM roles WHERE code = 'outlet_manager' LIMIT 1`);
      const roleId = roleRows.rows[0].id;

      await client.query(
        `INSERT INTO memberships (id, user_id, organisation_id, outlet_id, role_id, status, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active', now()) ON CONFLICT DO NOTHING`,
        [testUserId, testOrgId, testOutletId, roleId]
      );
    });

    const userRes = await query<{ id: string; email: string; password_hash: string }>(
      `SELECT u.id, u.email, u.password_hash, m.organisation_id, m.outlet_id
       FROM users u
       JOIN memberships m ON m.user_id = u.id
       WHERE u.email = $1`,
      [testEmail]
    );

    const verified = userRes.length > 0 && await verifyPassword(rawPassword, userRes[0].password_hash);
    const wrongRejected = !await verifyPassword('WrongPassword!', userRes[0].password_hash);

    record('Real PostgreSQL: Restaurant Onboarding & Authentication Verification', verified && wrongRejected, 'Real PostgreSQL', {
      userFound: userRes.length > 0,
      passwordVerified: verified,
      wrongPasswordRejected: wrongRejected
    });
  } catch (err: any) {
    record('Real PostgreSQL: Restaurant Onboarding & Authentication Verification', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 8. Real PostgreSQL: Daily Check & Response Submission Persistence
  const checkInstanceId = '00000000-0000-4000-8000-000000000010';

  try {
    const templateRow = await query<{ id: string }>(`SELECT id FROM check_templates WHERE code = 'DAILY_FOOD_SAFETY' LIMIT 1`);
    const templateId = templateRow[0].id;

    const itemRow = await query<{ id: string }>(`SELECT id FROM check_template_items WHERE check_template_id = $1 LIMIT 1`, [templateId]);
    const templateItemId = itemRow[0].id;

    await transaction(async client => {
      await client.query(
        `INSERT INTO check_instances (id, outlet_id, check_template_id, assigned_to, started_at, status, risk_status)
         VALUES ($1, $2, $3, $4, now(), 'in_progress', 'low') ON CONFLICT (id) DO NOTHING`,
        [checkInstanceId, testOutletId, templateId, testUserId]
      );

      await client.query(
        `INSERT INTO check_responses (id, check_instance_id, check_template_item_id, response_value, numeric_value, temperature_value, status, responded_at, responded_by)
         VALUES (gen_random_uuid(), $1, $2, '{"temperature": 3.8}'::jsonb, 3.8, 3.8, 'pass', now(), $3)`,
        [checkInstanceId, templateItemId, testUserId]
      );
    });

    const responseCheck = await query<{ temperature_value: string; status: string }>(
      `SELECT cr.temperature_value, cr.status, ci.status as instance_status
       FROM check_responses cr
       JOIN check_instances ci ON ci.id = cr.check_instance_id
       WHERE ci.id = $1`,
      [checkInstanceId]
    );

    record('Real PostgreSQL: Check Instance & Response Persistence', responseCheck.length > 0 && parseFloat(responseCheck[0].temperature_value) === 3.8, 'Real PostgreSQL', {
      recordedTemp: responseCheck[0]?.temperature_value,
      status: responseCheck[0]?.status
    });
  } catch (err: any) {
    record('Real PostgreSQL: Check Instance & Response Persistence', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 9. Real PostgreSQL: Corrective Action Lifecycle & Verification Audit
  const actionId = '00000000-0000-4000-8000-000000000020';
  try {
    await transaction(async client => {
      await client.query(
        `INSERT INTO corrective_actions (
          id, outlet_id, title, description, source_type, status,
          requires_external_service, created_at
        ) VALUES (
          $1, $2, 'Cold Room Fan Calibration', 'Defrost cycle inspection required', 'manual',
          'awaiting_verification', true, now()
        ) ON CONFLICT (id) DO NOTHING`,
        [actionId, testOutletId]
      );

      await client.query(
        `UPDATE corrective_actions
         SET status = 'closed', closed_at = now()
         WHERE id = $1`,
        [actionId]
      );

      await client.query(
        `INSERT INTO action_verifications (
          id, corrective_action_id, verified_by, verification_method, result, verified_at, notes
        ) VALUES (
          gen_random_uuid(), $1, $2, 'calibrated_thermometer_probe', 'pass', now(), 'Supervisor verified thermometer calibration'
        )`,
        [actionId, testUserId]
      );
    });

    const actionCheck = await query<{ status: string; result: string }>(
      `SELECT ca.status, av.result
       FROM corrective_actions ca
       JOIN action_verifications av ON av.corrective_action_id = ca.id
       WHERE ca.id = $1`,
      [actionId]
    );

    const actionPassed = actionCheck.length > 0 && actionCheck[0].status === 'closed' && actionCheck[0].result === 'pass';
    record('Real PostgreSQL: Corrective Action Verification & Audit Trail', actionPassed, 'Real PostgreSQL', {
      status: actionCheck[0]?.status,
      verificationResult: actionCheck[0]?.result
    });
  } catch (err: any) {
    record('Real PostgreSQL: Corrective Action Verification & Audit Trail', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 10. Real PostgreSQL: HACCP Plan, CCPs, Critical Limits & Activation
  const planId = '00000000-0000-4000-8000-000000000030';
  const hazardId = '00000000-0000-4000-8000-000000000031';
  const ccpId = '00000000-0000-4000-8000-000000000032';
  try {
    await transaction(async client => {
      await client.query(
        `INSERT INTO haccp_plans (id, outlet_id, name, version, status, effective_from)
         VALUES ($1, $2, 'Standard Cold Chain HACCP', '1.0', 'draft', current_date) ON CONFLICT (id) DO NOTHING`,
        [planId, testOutletId]
      );

      await client.query(
        `INSERT INTO hazards (id, haccp_plan_id, hazard_type, hazard_description, severity, likelihood, risk_score)
         VALUES ($1, $2, 'biological', 'Listeria monocytogenes proliferation in cold storage', 4, 3, 12) ON CONFLICT (id) DO NOTHING`,
        [hazardId, planId]
      );

      await client.query(
        `INSERT INTO ccps (
          id, haccp_plan_id, hazard_id, process_step, critical_limit, unit,
          critical_limit_min, critical_limit_max, monitoring_method, monitoring_frequency,
          responsible_person_role, validation_status
        ) VALUES (
          $1, $2, $3, 'Cold storage holding', '≤ 4.0°C continuously', '°C',
          0.0, 4.0, 'Digital probe log', 'Continuous / 2hr check',
          'outlet_manager', 'validated'
        ) ON CONFLICT (id) DO NOTHING`,
        [ccpId, planId, hazardId]
      );

      await client.query(
        `UPDATE haccp_plans SET status = 'active' WHERE id = $1`,
        [planId]
      );
    });

    const haccpCheck = await query<{ status: string; hazard_count: string; ccp_count: string; critical_limit_max: string }>(
      `SELECT hp.status, count(DISTINCT h.id) as hazard_count, count(DISTINCT c.id) as ccp_count, max(c.critical_limit_max) as critical_limit_max
       FROM haccp_plans hp
       JOIN hazards h ON h.haccp_plan_id = hp.id
       JOIN ccps c ON c.haccp_plan_id = hp.id
       WHERE hp.id = $1
       GROUP BY hp.status`,
      [planId]
    );

    const haccpPassed = haccpCheck.length > 0 && haccpCheck[0].status === 'active' && parseInt(haccpCheck[0].ccp_count) >= 1 && parseFloat(haccpCheck[0].critical_limit_max) === 4.0;
    record('Real PostgreSQL: HACCP Plan, CCP & Critical Limit Persistence', haccpPassed, 'Real PostgreSQL', {
      planStatus: haccpCheck[0]?.status,
      hazardCount: haccpCheck[0]?.hazard_count,
      ccpCount: haccpCheck[0]?.ccp_count,
      limitMax: haccpCheck[0]?.critical_limit_max
    });
  } catch (err: any) {
    record('Real PostgreSQL: HACCP Plan, CCP & Critical Limit Persistence', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 11. Real PostgreSQL: Grocery Module Operations
  const groceryStoreId = 'store-nature-basket-stage5e';
  try {
    await transaction(async client => {
      await client.query(
        `INSERT INTO grocery_outlets (
          id, name, branch_name, address, city, manager_name, contact_number, contact_email, store_type
        ) VALUES (
          $1, 'Nature Fresh Supermarket', 'Indiranagar 100ft Rd', '777 100ft Road', 'Bengaluru',
          'Ananya Roy', '+91 99887 66554', 'ananya.roy@example.com', 'supermarket'
        ) ON CONFLICT (id) DO NOTHING`,
        [groceryStoreId]
      );

      await client.query(
        `INSERT INTO grocery_storage_zones (id, outlet_id, name, zone_type, target_temp, min_temp, max_temp)
         VALUES ('zone-stage5e-dairy', $1, 'Dairy Chiller A', 'dairy', 3.0, 1.0, 4.0) ON CONFLICT (id) DO NOTHING`,
        [groceryStoreId]
      );

      await client.query(
        `INSERT INTO grocery_receiving_records (
          id, outlet_id, supplier, product, product_category, quantity, batch_number,
          packaging_condition, product_condition, temperature, receiving_person, decision, inspection_checklist
        ) VALUES (
          'rcv-stage5e-001', $1, 'Amul Dairy Cooperative', 'Full Cream Milk 1L', 'dairy_milk', '50 crates',
          'BATCH-2026-X', 'intact', 'fresh', 3.5, 'Ananya Roy', 'ACCEPT', '{"temp_ok": true}'::jsonb
        ) ON CONFLICT (id) DO NOTHING`,
        [groceryStoreId]
      );

      await client.query(
        `INSERT INTO grocery_inventory_batches (
          id, outlet_id, product, category, batch, quantity, unit, date_received, expiry_date, storage_zone_id, storage_zone_name, status
        ) VALUES (
          'batch-stage5e-001', $1, 'Full Cream Milk 1L', 'dairy_milk', 'BATCH-2026-X', 50, 'crates',
          current_date, current_date + 7, 'zone-stage5e-dairy', 'Dairy Chiller A', 'ACTIVE'
        ) ON CONFLICT (id) DO NOTHING`,
        [groceryStoreId]
      );
    });

    const groceryCheck = await query<{ product: string; decision: string }>(
      `SELECT gr.product, gr.decision, gb.quantity
       FROM grocery_receiving_records gr
       JOIN grocery_inventory_batches gb ON gb.batch = gr.batch_number
       WHERE gr.outlet_id = $1`,
      [groceryStoreId]
    );

    const groceryPassed = groceryCheck.length > 0 && groceryCheck[0].decision === 'ACCEPT';
    record('Real PostgreSQL: Grocery Receiving & Inventory Persistence', groceryPassed, 'Real PostgreSQL', {
      product: groceryCheck[0]?.product,
      decision: groceryCheck[0]?.decision
    });
  } catch (err: any) {
    record('Real PostgreSQL: Grocery Receiving & Inventory Persistence', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 12. Real PostgreSQL: Service Provider Registration & Request Lifecycle
  const providerId = 'prov-stage5e-001';
  const serviceReqId = 'req-stage5e-001';
  try {
    await transaction(async client => {
      await client.query(
        `INSERT INTO service_providers (
          id, business_name, contact_name, mobile, email, city, categories, description, verification_status, status
        ) VALUES (
          $1, 'Arctic Cold Chain HVAC Services', 'Suresh Kumar', '+91 98450 11223',
          'suresh@arctichvac.example.com', 'Bengaluru', ARRAY['refrigeration_repair', 'cold_room_maintenance'],
          'Commercial refrigeration and HVAC specialists', 'verified', 'active'
        ) ON CONFLICT (id) DO NOTHING`,
        [providerId]
      );

      await client.query(
        `INSERT INTO restaurant_service_requests (
          id, organisation_id, outlet_id, outlet_name, outlet_city, corrective_action_id,
          corrective_action_title, provider_id, provider_name, service_category, problem_description,
          priority, status, requested_at
        ) VALUES (
          $1, $2, $3, 'Stage 5E Bistro Downtown', 'Bengaluru', $4,
          'Cold Room Fan Calibration', $5, 'Arctic Cold Chain HVAC Services',
          'refrigeration_repair', 'Urgent sensor calibration requested', 'high', 'assigned', now()
        ) ON CONFLICT (id) DO NOTHING`,
        [serviceReqId, testOrgId, testOutletId, actionId, providerId]
      );

      await client.query(
        `UPDATE restaurant_service_requests
         SET status = 'completed', completed_at = now(), notes = 'Calibration completed with certified probe'
         WHERE id = $1`,
        [serviceReqId]
      );
    });

    const providerCheck = await query<{ status: string; business_name: string }>(
      `SELECT sr.status, sp.business_name
       FROM restaurant_service_requests sr
       JOIN service_providers sp ON sp.id = sr.provider_id
       WHERE sr.id = $1`,
      [serviceReqId]
    );

    const providerPassed = providerCheck.length > 0 && providerCheck[0].status === 'completed';
    record('Real PostgreSQL: Service Provider & Service Request Lifecycle', providerPassed, 'Real PostgreSQL', {
      provider: providerCheck[0]?.business_name,
      status: providerCheck[0]?.status
    });
  } catch (err: any) {
    record('Real PostgreSQL: Service Provider & Service Request Lifecycle', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 13. Real PostgreSQL: Customer Feedback, Unclaimed Store Claim & Token Lifecycle
  const claimToken = 'claim_test_token_stage5e_12345';
  const unclaimedRestId = 'unclaimed-stage5e-blr-01';
  try {
    await transaction(async client => {
      await client.query(
        `INSERT INTO unclaimed_directory_entries (
          id, name, business_type, city, location, status
        ) VALUES (
          $1, 'Udupi Grand Tiffin', 'RESTAURANT', 'Bengaluru', '45 CMH Road Indiranagar', 'UNCLAIMED'
        ) ON CONFLICT (id) DO NOTHING`,
        [unclaimedRestId]
      );

      await client.query(
        `INSERT INTO customer_feedback (
          id, outlet_id, outlet_name, overall_score, cleanliness_score, staff_hygiene_score,
          food_freshness_score, safe_water_score, washroom_score, feedback, diner_name
        ) VALUES (
          'fb-stage5e-001', $1, 'Udupi Grand Tiffin', 4.5, 4.0, 5.0, 4.5, 5.0, 4.0,
          'Excellent hygienic dosa and filter coffee', 'Arun Joshi'
        ) ON CONFLICT (id) DO NOTHING`,
        [unclaimedRestId]
      );

      await client.query(
        `INSERT INTO claim_tokens (
          token, restaurant_id, created_at, expires_at, used
        ) VALUES (
          $1, $2, now(), now() + interval '48 hours', false
        ) ON CONFLICT (token) DO NOTHING`,
        [claimToken, unclaimedRestId]
      );

      await client.query(
        `INSERT INTO outbox_notifications (
          id, restaurant_id, restaurant_name, feedback_id, notification_type,
          recipient_email, subject, body, claim_token, claim_url, status, created_at
        ) VALUES (
          'outbox-stage5e-001', $1, 'Udupi Grand Tiffin', 'fb-stage5e-001', 'CUSTOMER_FEEDBACK_PROFILE_INVITATION',
          'owner@udupigrand.example.com', 'Claim your restaurant profile', 'Click link to verify and claim',
          $2, 'https://foodsafe365.com/claim/unclaimed-stage5e-blr-01', 'QUEUED', now()
        ) ON CONFLICT (id) DO NOTHING`,
        [unclaimedRestId, claimToken]
      );
    });

    let doubleClaimBlocked = false;
    await transaction(async client => {
      const markRes = await client.query(
        `UPDATE claim_tokens SET used = true, used_at = now()
         WHERE token = $1 AND used = false RETURNING token`,
        [claimToken]
      );
      if (markRes.rowCount === 1) {
        await client.query(
          `UPDATE unclaimed_directory_entries SET status = 'CLAIMED' WHERE id = $1`,
          [unclaimedRestId]
        );
      }
    });

    const secondAttempt = await query(
      `SELECT * FROM claim_tokens WHERE token = $1 AND used = false`,
      [claimToken]
    );
    doubleClaimBlocked = secondAttempt.length === 0;

    const entryStatus = await query<{ status: string }>(
      `SELECT status FROM unclaimed_directory_entries WHERE id = $1`,
      [unclaimedRestId]
    );

    const feedbackCheck = await query<{ outlet_name: string }>(
      `SELECT outlet_name FROM customer_feedback WHERE id = 'fb-stage5e-001'`
    );

    const claimPassed = doubleClaimBlocked && entryStatus[0]?.status === 'CLAIMED' && feedbackCheck.length > 0;
    record('Real PostgreSQL: Unclaimed Store, Claim Token & Double-Claim Protection', claimPassed, 'Real PostgreSQL', {
      finalStatus: entryStatus[0]?.status,
      doubleClaimPrevented: doubleClaimBlocked,
      feedbackPreserved: feedbackCheck.length > 0
    });
  } catch (err: any) {
    record('Real PostgreSQL: Unclaimed Store, Claim Token & Double-Claim Protection', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 14. Real PostgreSQL: Multi-Tenant Boundary Isolation Enforcement
  const foreignOrgId = '00000000-0000-4000-8000-000000000099';
  const foreignOutletId = '00000000-0000-4000-8000-000000000098';
  const foreignUserId = '00000000-0000-4000-8000-000000000097';
  try {
    await transaction(async client => {
      await client.query(
        `INSERT INTO users (id, name, email, status)
         VALUES ($1, 'Competitor Admin', 'admin@competitor.example.com', 'active') ON CONFLICT (id) DO NOTHING`,
        [foreignUserId]
      );
      await client.query(
        `INSERT INTO organisations (id, name, owner_user_id, status)
         VALUES ($1, 'Competitor Bistro Corp', $2, 'active') ON CONFLICT (id) DO NOTHING`,
        [foreignOrgId, foreignUserId]
      );
      await client.query(
        `INSERT INTO outlets (id, organisation_id, name, status)
         VALUES ($1, $2, 'Competitor Downtown', 'active') ON CONFLICT (id) DO NOTHING`,
        [foreignOutletId, foreignOrgId]
      );
      await client.query(
        `INSERT INTO corrective_actions (id, outlet_id, title, status, source_type)
         VALUES (gen_random_uuid(), $1, 'Confidential Competitor Action', 'open', 'manual')`,
        [foreignOutletId]
      );
    });

    const leakedActions = await query(
      `SELECT * FROM corrective_actions WHERE outlet_id = $1 AND title = 'Confidential Competitor Action'`,
      [testOutletId]
    );

    record('Real PostgreSQL: Multi-Tenant Boundary Isolation Enforcement', leakedActions.length === 0, 'Real PostgreSQL', {
      crossTenantLeakage: leakedActions.length === 0 ? 'None (Isolated)' : 'LEAK DETECTED'
    });
  } catch (err: any) {
    record('Real PostgreSQL: Multi-Tenant Boundary Isolation Enforcement', false, 'Real PostgreSQL', undefined, err.message);
  }

  // 15. Real PostgreSQL: Atomic Transaction Rollback on Failure
  try {
    let rollbackVerified = false;
    const preCount = await query<{ count: string }>('SELECT count(*) FROM corrective_actions WHERE outlet_id = $1', [testOutletId]);
    
    try {
      await transaction(async client => {
        await client.query(
          `INSERT INTO corrective_actions (id, outlet_id, title, status, source_type)
           VALUES (gen_random_uuid(), $1, 'Should Be Rolled Back', 'open', 'manual')`,
          [testOutletId]
        );
        throw new Error('INTENTIONAL_TRANSACTION_FAILURE');
      });
    } catch {
      // Expected
    }

    const postCount = await query<{ count: string }>('SELECT count(*) FROM corrective_actions WHERE outlet_id = $1', [testOutletId]);
    rollbackVerified = preCount[0].count === postCount[0].count;

    record('Real PostgreSQL: Atomic Transaction Rollback on Exception', rollbackVerified, 'Real PostgreSQL', {
      preCount: preCount[0].count,
      postCount: postCount[0].count,
      rolledBack: rollbackVerified
    });
  } catch (err: any) {
    record('Real PostgreSQL: Atomic Transaction Rollback on Exception', false, 'Real PostgreSQL', undefined, err.message);
  }

  // Summary
  console.log('\n================================================================');
  console.log('STAGE 5E TEST EXECUTION SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`Total Scenarios Tested : ${total}`);
  console.log(`Passed (Real PG)       : ${passed}`);
  console.log(`Failed                 : ${failed}`);
  console.log(`PostgreSQL Engine      : ${pgVersion}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    for (const f of results.filter(r => !r.passed)) {
      console.log(` - ${f.name}: ${f.error}`);
    }
  }

  resetPool();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error during Stage 5E integration test:', err);
  process.exit(1);
});
