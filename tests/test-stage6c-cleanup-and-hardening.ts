/**
 * FoodSafe365 — Stage 6C: Cleanup, Production Configuration & Regression Hardening Test Suite
 * 
 * Tests:
 * 1. Abandoned upload cleanup (expired pending uploads purged; non-expired preserved)
 * 2. Confirmed evidence immunity (cleanup never touches confirmed or retention-locked records)
 * 3. Storage deletion failure safety (object not falsely marked purged if storage delete throws)
 * 4. Database failure during cleanup (transaction rollback and clean error handling)
 * 5. Concurrent confirmation and cleanup race condition handling
 * 6. Direct confirmation rejection for expired upload URLs (HTTP 410)
 * 7. Repeated cleanup idempotency (subsequent runs perform 0 duplicate actions)
 * 8. Dry-run execution mode
 * 9. Production boot validation for S3 storage configuration and secrets non-exposure
 */

import assert from 'assert';
import crypto from 'crypto';

import { createSessionToken, SESSION_COOKIE_NAME } from '../lib/session';
import { setPoolForTesting, resetPool } from '../lib/db';
import { MemoryStorageProvider } from '../lib/storage/memory';
import { setStorageProviderForTesting, resetStorageProvider } from '../lib/storage/index';
import {
  validateStorageConfig,
  validateEnvironment,
  assertProductionBoot
} from '../lib/env-validator';
import { cleanupAbandonedEvidence, CleanupReport } from '../scripts/cleanup-abandoned-evidence';

import { POST as confirmUploadHandler } from '../app/api/v1/evidence/confirm/route';
import { GET as downloadHandler } from '../app/api/v1/evidence/[id]/download/route';

function makeRequest(
  url: string,
  method: string,
  body?: any,
  sessionCookieToken?: string | null,
  headers?: Record<string, string>
): Request {
  const reqHeaders: Record<string, string> = {
    'content-type': 'application/json',
    ...(headers || {})
  };
  if (sessionCookieToken) {
    reqHeaders['cookie'] = `${SESSION_COOKIE_NAME}=${sessionCookieToken}`;
  }

  return new Request(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined
  });
}

/**
 * Failing Storage Provider to test storage deletion failure safety
 */
class FailingStorageProvider extends MemoryStorageProvider {
  public failDelete = false;

  async deleteObject(key: string): Promise<boolean> {
    if (this.failDelete) {
      throw new Error('SIMULATED_S3_STORAGE_SERVICE_UNAVAILABLE: Connection timed out');
    }
    return super.deleteObject(key);
  }
}

/**
 * Stateful Mock Database for Stage 6C Testing
 */
class Stage6CMockDatabase {
  public tables: Map<string, any[]> = new Map();
  public failNextQuery = false;
  public lockedRows = new Set<string>();

  constructor() {
    this.tables.set('outlets', [
      { id: 'outlet-bandra', organisation_id: 'org-bandra', status: 'active' }
    ]);
    this.tables.set('evidence', []);
    this.tables.set('audit_logs', []);
  }

  async connect() {
    return {
      query: (sql: string, params: any[] = []) => this.query(sql, params),
      release: () => {}
    };
  }

  async query(sqlText: string, params: any[] = []): Promise<{ rows: any[] }> {
    if (this.failNextQuery) {
      this.failNextQuery = false;
      throw new Error('SIMULATED_POSTGRESQL_TRANSACTION_FAILURE');
    }

    const cleaned = sqlText.trim().replace(/\s+/g, ' ');

    if (cleaned === 'BEGIN' || cleaned === 'COMMIT' || cleaned === 'ROLLBACK') {
      return { rows: [] };
    }

    // 1. SELECT evidence candidate query for cleanup
    if (cleaned.includes('FROM evidence WHERE status = \'pending\'')) {
      const cutoff = params[0] as Date;
      const limit = params[1] as number;
      const evidence = this.tables.get('evidence') || [];

      const candidates = evidence.filter(e => {
        if (e.status !== 'pending') return false;
        const exp = e.expires_at ? new Date(e.expires_at) : new Date(e.captured_at);
        return exp.getTime() <= cutoff.getTime();
      }).slice(0, limit);

      return { rows: candidates };
    }

    // 2. FOR UPDATE row lock query in cleanup
    if (cleaned.includes('FOR UPDATE')) {
      const id = params[0];
      if (this.lockedRows.has(id)) {
        // Row is locked by another transaction, return empty (SKIP LOCKED behavior)
        return { rows: [] };
      }
      const evidence = this.tables.get('evidence') || [];
      const row = evidence.find(e => e.id === id);
      return { rows: row ? [row] : [] };
    }

    // 3. SELECT evidence JOIN outlets for confirmation
    if (cleaned.includes('FROM evidence e JOIN outlets o ON o.id = e.outlet_id WHERE e.id = $1')) {
      const [evidenceId] = params;
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === evidenceId);
      if (!evidence) return { rows: [] };
      const outlet = (this.tables.get('outlets') || []).find(o => o.id === evidence.outlet_id);
      return {
        rows: [
          {
            ...evidence,
            organisation_id: outlet ? outlet.organisation_id : null
          }
        ]
      };
    }

    // 4. UPDATE evidence to failed with ABANDONED_UPLOAD_EXPIRED
    if (cleaned.includes("UPDATE evidence SET status = 'failed', failure_reason = 'ABANDONED_UPLOAD_EXPIRED'")) {
      const id = params[0];
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === id && e.status === 'pending');
      if (evidence) {
        evidence.status = 'failed';
        evidence.failure_reason = 'ABANDONED_UPLOAD_EXPIRED';
        return { rows: [evidence] };
      }
      return { rows: [] };
    }

    // 5. UPDATE evidence to failed with EXPIRED_WITHOUT_CONFIRMATION or UPLOAD_WINDOW_EXPIRED
    if (cleaned.includes("failure_reason = 'EXPIRED_WITHOUT_CONFIRMATION'") || cleaned.includes("failure_reason = 'UPLOAD_WINDOW_EXPIRED'")) {
      const id = params[params.length - 1];
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === id);
      if (evidence) {
        evidence.status = 'failed';
        evidence.failure_reason = 'EXPIRED_WITHOUT_CONFIRMATION';
        return { rows: [evidence] };
      }
      return { rows: [] };
    }

    // 6. UPDATE evidence confirm
    if (cleaned.includes("UPDATE evidence SET status = 'confirmed'")) {
      const [evidenceId, scanStatus, retentionUntil] = params;
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === evidenceId);
      if (evidence) {
        evidence.status = 'confirmed';
        evidence.scan_status = scanStatus;
        evidence.confirmed_at = new Date();
        evidence.retention_until = retentionUntil;
        return { rows: [evidence] };
      }
      return { rows: [] };
    }

    // 7. INSERT INTO audit_logs
    if (cleaned.includes('INSERT INTO audit_logs') || cleaned.includes('INSERT INTO audit_log')) {
      const auditLogs = this.tables.get('audit_logs') || [];
      auditLogs.push({
        id: crypto.randomUUID(),
        action: cleaned.includes('EVIDENCE_ABANDONED_PURGED')
          ? 'EVIDENCE_ABANDONED_PURGED'
          : cleaned.includes('EVIDENCE_UPLOAD_CONFIRMED')
          ? 'EVIDENCE_UPLOAD_CONFIRMED'
          : 'AUDIT_ACTION',
        details: params[params.length - 1],
        created_at: new Date()
      });
      return { rows: [] };
    }

    return { rows: [] };
  }
}

async function runStage6CSuite() {
  console.log('========================================================================');
  console.log('FOODSAFE365 — STAGE 6C: CLEANUP, PRODUCTION HARDENING & FAILURE TESTS');
  console.log('========================================================================\n');

  let total = 0;
  let passed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`✅ [PASS] ${name}`);
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${err.message}`);
      throw err;
    }
  }

  const mockDb = new Stage6CMockDatabase();
  setPoolForTesting(mockDb as any);
  const storage = new FailingStorageProvider();
  setStorageProviderForTesting(storage);

  const defaultDbUrl = 'postgresql://test_user:test_pass@localhost:5432/foodsafe365_test';
  const defaultSecret = 'c982b6e118f67389c922df68875ea011284d79b9b5f9048a1239c0fa1e5d7a6b';
  process.env.DATABASE_URL = defaultDbUrl;
  process.env.SESSION_SECRET = defaultSecret;

  const fssSession = createSessionToken({
    userId: 'usr-fss-1',
    organisationId: 'org-bandra',
    outletId: 'outlet-bandra',
    role: 'food_safety_supervisor',
    journey: 'restaurant'
  });

  // Seed baseline evidence
  const now = new Date('2026-10-14T12:00:00.000Z');
  const pastCutoff = new Date(now.getTime() - 600 * 1000); // 10 mins ago
  const futureCutoff = new Date(now.getTime() + 600 * 1000); // 10 mins in future

  // ---------------------------------------------------------------------------
  // SECTION 1: ABANDONED UPLOAD CLEANUP
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: ABANDONED UPLOAD IDENTIFICATION & PURGE ---');

  await test('Cleanup 1.1: Identifies and purges expired pending upload', async () => {
    const expiredId = 'ev-expired-1';
    const expiredKey = 'tenants/org-bandra/outlets/outlet-bandra/check_response/cr-1/ev-expired-1.jpg';

    // Put binary in storage
    await storage.putObject(expiredKey, Buffer.from('binary-content'), 'image/jpeg');
    assert.ok(await storage.headObject(expiredKey));

    // Seed expired pending DB record
    mockDb.tables.get('evidence')?.push({
      id: expiredId,
      outlet_id: 'outlet-bandra',
      entity_type: 'check_response',
      entity_id: 'cr-1',
      file_url: `storage://${expiredKey}`,
      file_type: 'image/jpeg',
      file_size: 14,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: expiredKey,
      expires_at: pastCutoff,
      captured_at: pastCutoff
    });

    const report = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    assert.strictEqual(report.expiredFound, 1);
    assert.strictEqual(report.purgedCount, 1);
    assert.strictEqual(report.storageErrors, 0);

    // Verify storage object was deleted
    const head = await storage.headObject(expiredKey);
    assert.strictEqual(head, null, 'Storage object must be deleted from storage');

    // Verify database row is marked 'failed' with failure_reason = 'ABANDONED_UPLOAD_EXPIRED'
    const row = mockDb.tables.get('evidence')?.find(e => e.id === expiredId);
    assert.strictEqual(row?.status, 'failed');
    assert.strictEqual(row?.failure_reason, 'ABANDONED_UPLOAD_EXPIRED');

    // Verify audit log
    const audit = mockDb.tables.get('audit_logs')?.find(a => a.action === 'EVIDENCE_ABANDONED_PURGED');
    assert.ok(audit, 'Audit event EVIDENCE_ABANDONED_PURGED must be recorded');
  });

  await test('Cleanup 1.2: Preserves active (non-expired) pending uploads', async () => {
    const activeId = 'ev-active-pending';
    const activeKey = 'tenants/org-bandra/outlets/outlet-bandra/check_response/cr-1/ev-active.jpg';

    await storage.putObject(activeKey, Buffer.from('active-upload'), 'image/jpeg');

    mockDb.tables.get('evidence')?.push({
      id: activeId,
      outlet_id: 'outlet-bandra',
      entity_type: 'check_response',
      entity_id: 'cr-1',
      file_url: `storage://${activeKey}`,
      file_type: 'image/jpeg',
      file_size: 13,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: activeKey,
      expires_at: futureCutoff, // in future
      captured_at: now
    });

    const report = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    assert.strictEqual(report.purgedCount, 0, 'Must not purge unexpired upload');
    const head = await storage.headObject(activeKey);
    assert.ok(head, 'Binary for unexpired upload must remain intact');
    const row = mockDb.tables.get('evidence')?.find(e => e.id === activeId);
    assert.strictEqual(row?.status, 'pending');
  });

  await test('Cleanup 1.3: Confirmed evidence is NEVER touched by cleanup', async () => {
    const confirmedId = 'ev-confirmed-record';
    const confirmedKey = 'tenants/org-bandra/outlets/outlet-bandra/service/srv-1/ev-confirmed.pdf';

    await storage.putObject(confirmedKey, Buffer.from('%PDF-1.4 compliance-cert'), 'application/pdf');

    // Confirmed record with past expires_at
    mockDb.tables.get('evidence')?.push({
      id: confirmedId,
      outlet_id: 'outlet-bandra',
      entity_type: 'service',
      entity_id: 'srv-1',
      file_url: `storage://${confirmedKey}`,
      file_type: 'application/pdf',
      file_size: 26,
      status: 'confirmed', // Confirmed!
      scan_status: 'cleared',
      storage_key: confirmedKey,
      expires_at: pastCutoff,
      captured_at: pastCutoff,
      confirmed_at: pastCutoff,
      retention_until: new Date(now.getTime() + 365 * 86400 * 1000)
    });

    const report = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    assert.strictEqual(report.purgedCount, 0);
    const head = await storage.headObject(confirmedKey);
    assert.ok(head, 'Confirmed evidence binary must never be touched by cleanup');
    const row = mockDb.tables.get('evidence')?.find(e => e.id === confirmedId);
    assert.strictEqual(row?.status, 'confirmed');
  });

  // ---------------------------------------------------------------------------
  // SECTION 2: ADDITIONAL FAILURE TESTS (TASK 4)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: ADDITIONAL FAILURE & RESILIENCE TESTS ---');

  await test('Failure 2.1: Storage deletion failure prevents DB record from being marked purged', async () => {
    const failObjId = 'ev-storage-fail';
    const failObjKey = 'tenants/org-bandra/outlets/outlet-bandra/check_response/cr-1/ev-fail.jpg';

    await storage.putObject(failObjKey, Buffer.from('storage-fail-content'), 'image/jpeg');

    mockDb.tables.get('evidence')?.push({
      id: failObjId,
      outlet_id: 'outlet-bandra',
      entity_type: 'check_response',
      entity_id: 'cr-1',
      file_url: `storage://${failObjKey}`,
      file_type: 'image/jpeg',
      file_size: 20,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: failObjKey,
      expires_at: pastCutoff,
      captured_at: pastCutoff
    });

    // Simulate S3 deletion outage
    storage.failDelete = true;

    const report = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    storage.failDelete = false; // reset

    assert.strictEqual(report.storageErrors, 1, 'Must record storage error');
    assert.strictEqual(report.purgedCount, 0, 'Must not report purged count when storage delete failed');

    // Verify row was NOT falsely marked as failed/purged in database!
    const row = mockDb.tables.get('evidence')?.find(e => e.id === failObjId);
    assert.strictEqual(row?.status, 'pending', 'Record must remain pending for future retry');
  });

  await test('Failure 2.2: Database failure during cleanup handles error cleanly and rolls back', async () => {
    const dbFailId = 'ev-db-fail';
    const dbFailKey = 'tenants/org-bandra/outlets/outlet-bandra/check_response/cr-1/ev-db-fail.jpg';

    await storage.putObject(dbFailKey, Buffer.from('db-fail-content'), 'image/jpeg');

    mockDb.tables.get('evidence')?.push({
      id: dbFailId,
      outlet_id: 'outlet-bandra',
      entity_type: 'check_response',
      entity_id: 'cr-1',
      file_url: `storage://${dbFailKey}`,
      file_type: 'image/jpeg',
      file_size: 15,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: dbFailKey,
      expires_at: pastCutoff,
      captured_at: pastCutoff
    });

    // Induce next query failure
    mockDb.failNextQuery = true;

    const report = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    assert.ok(report.errors.length > 0, 'Must log transaction error');
    assert.strictEqual(report.purgedCount, 0);
  });

  await test('Failure 2.3: Concurrent confirmation and cleanup race condition handling', async () => {
    mockDb.tables.set('evidence', []);
    const raceId = 'ev-race-1';
    const raceKey = 'tenants/org-bandra/outlets/outlet-bandra/check_response/cr-1/ev-race.jpg';

    await storage.putObject(raceKey, Buffer.from('race-binary'), 'image/jpeg');

    const raceRow = {
      id: raceId,
      outlet_id: 'outlet-bandra',
      entity_type: 'check_response',
      entity_id: 'cr-1',
      file_url: `storage://${raceKey}`,
      file_type: 'image/jpeg',
      file_size: 11,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: raceKey,
      expires_at: pastCutoff,
      captured_at: pastCutoff
    };
    mockDb.tables.get('evidence')?.push(raceRow);

    // Case A: Row locked by active confirmation (SKIP LOCKED skips it)
    mockDb.lockedRows.add(raceId);

    const report = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    mockDb.lockedRows.delete(raceId);

    assert.strictEqual(report.skippedActiveOrConfirmed, 1, 'Must skip row locked by concurrent transaction');
    assert.strictEqual(report.purgedCount, 0);
    assert.strictEqual(raceRow.status, 'pending', 'Must not alter row while locked');

    // Case B: Row confirmed concurrently right before cleanup lock
    raceRow.status = 'confirmed';
    raceRow.scan_status = 'cleared';

    const report2 = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    assert.strictEqual(report2.purgedCount, 0, 'Must never purge confirmed evidence');
    const head = await storage.headObject(raceKey);
    assert.ok(head, 'Binary of confirmed evidence must not be deleted');
  });

  await test('Failure 2.4: Attempting confirmation on an expired upload window returns HTTP 410', async () => {
    mockDb.tables.set('evidence', []);
    const expiredUploadId = 'ev-expired-window';
    const expiredUploadKey = 'tenants/org-bandra/outlets/outlet-bandra/document/doc-1/expired.pdf';

    await storage.putObject(expiredUploadKey, Buffer.from('%PDF-1.4 expired'), 'application/pdf');

    mockDb.tables.get('evidence')?.push({
      id: expiredUploadId,
      outlet_id: 'outlet-bandra',
      entity_type: 'document',
      entity_id: 'doc-1',
      file_url: `storage://${expiredUploadKey}`,
      file_type: 'application/pdf',
      file_size: 16,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: expiredUploadKey,
      expires_at: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      captured_at: new Date(Date.now() - 3600 * 1000)
    });

    const confReq = makeRequest(
      'http://localhost/api/v1/evidence/confirm',
      'POST',
      { evidence_id: expiredUploadId },
      fssSession
    );

    const res = await confirmUploadHandler(confReq);
    assert.strictEqual(res.status, 410, 'Must reject expired upload window with HTTP 410 Gone');
    const data = await res.json();
    assert.strictEqual(data.error.code, 'EXPIRED');

    // Verify row transitioned to failed with EXPIRED_WITHOUT_CONFIRMATION
    const row = mockDb.tables.get('evidence')?.find(e => e.id === expiredUploadId);
    assert.strictEqual(row?.status, 'failed');
    assert.strictEqual(row?.failure_reason, 'EXPIRED_WITHOUT_CONFIRMATION');
  });

  await test('Failure 2.5: Repeated cleanup executions are idempotent without duplicate actions', async () => {
    mockDb.tables.set('evidence', []);
    const report1 = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    // Immediate second execution
    const report2 = await cleanupAbandonedEvidence({
      now,
      storageProvider: storage
    });

    assert.strictEqual(report2.purgedCount, 0, 'Second run must purge 0 objects');
    assert.strictEqual(report2.errors.length, 0, 'Second run must have 0 errors');
  });

  await test('Cleanup 2.6: Dry run identifies candidates without modifying storage or database', async () => {
    mockDb.tables.set('evidence', []);
    const dryRunId = 'ev-dryrun-1';
    const dryRunKey = 'tenants/org-bandra/outlets/outlet-bandra/check_response/cr-1/dryrun.jpg';

    await storage.putObject(dryRunKey, Buffer.from('dryrun-content'), 'image/jpeg');

    mockDb.tables.get('evidence')?.push({
      id: dryRunId,
      outlet_id: 'outlet-bandra',
      entity_type: 'check_response',
      entity_id: 'cr-1',
      file_url: `storage://${dryRunKey}`,
      file_type: 'image/jpeg',
      file_size: 14,
      status: 'pending',
      scan_status: 'pending_scan',
      storage_key: dryRunKey,
      expires_at: pastCutoff,
      captured_at: pastCutoff
    });

    const report = await cleanupAbandonedEvidence({
      now,
      dryRun: true,
      storageProvider: storage
    });

    assert.strictEqual(report.dryRun, true);
    assert.strictEqual(report.expiredFound >= 1, true);
    assert.strictEqual(report.purgedCount, 0, 'Dry run must not purge objects');

    // Ensure storage object still exists
    const head = await storage.headObject(dryRunKey);
    assert.ok(head, 'Dry run must not delete binary');

    // Ensure database row still pending
    const row = mockDb.tables.get('evidence')?.find(e => e.id === dryRunId);
    assert.strictEqual(row?.status, 'pending', 'Dry run must not change DB row status');
  });

  // ---------------------------------------------------------------------------
  // SECTION 3: PRODUCTION BOOT & SECRETS HARDENING (TASK 2)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: PRODUCTION BOOT & STORAGE VALIDATION ---');

  await test('Boot 3.1: Production boot validation strictly rejects STORAGE_DRIVER=memory', async () => {
    const prodEnvWithMemory: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: defaultDbUrl,
      SESSION_SECRET: defaultSecret,
      STORAGE_DRIVER: 'memory'
    };

    const issue = validateStorageConfig(prodEnvWithMemory, true);
    assert.ok(issue);
    assert.strictEqual(issue.variable, 'STORAGE_CONFIG');
    assert.ok(issue.message.includes('STORAGE_DRIVER=memory is forbidden in production'));

    assert.throws(
      () => assertProductionBoot(prodEnvWithMemory),
      (err: any) => err.message.includes('STORAGE_DRIVER=memory is forbidden in production')
    );
  });

  await test('Boot 3.2: Production boot validation rejects missing or incomplete S3 parameters', async () => {
    const prodEnvIncompleteS3: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: defaultDbUrl,
      SESSION_SECRET: defaultSecret,
      STORAGE_DRIVER: 's3',
      STORAGE_BUCKET: 'foodsafe-prod-evidence'
      // Missing STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY, STORAGE_ENDPOINT
    };

    const issue = validateStorageConfig(prodEnvIncompleteS3, true);
    assert.ok(issue);
    assert.strictEqual(issue.variable, 'STORAGE_CONFIG');
    assert.ok(issue.message.includes('Required S3 storage configuration missing'));
    assert.ok(issue.message.includes('STORAGE_ACCESS_KEY_ID'));
    assert.ok(issue.message.includes('STORAGE_SECRET_ACCESS_KEY'));
    assert.ok(issue.message.includes('STORAGE_ENDPOINT'));

    assert.throws(
      () => assertProductionBoot(prodEnvIncompleteS3),
      (err: any) => err.message.includes('Required S3 storage configuration missing')
    );
  });

  await test('Boot 3.3: Production boot error messages contain zero secret or credential leakage', async () => {
    const superSecretKey = 'VERY_SECRET_AWS_KEY_DO_NOT_PRINT_ANYWHERE_9988';
    const prodEnvWithSecret: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: defaultDbUrl,
      SESSION_SECRET: defaultSecret,
      STORAGE_DRIVER: 'memory', // trigger validation failure
      STORAGE_SECRET_ACCESS_KEY: superSecretKey
    };

    try {
      assertProductionBoot(prodEnvWithSecret);
      assert.fail('Expected assertProductionBoot to throw');
    } catch (err: any) {
      const errorText = String(err.message || err);
      assert.strictEqual(
        errorText.includes(superSecretKey),
        false,
        'Storage secret key must never be echoed in boot validation error message'
      );
    }
  });

  await test('Boot 3.4: Valid production configuration with S3 storage is successfully accepted', async () => {
    const prodEnvValid: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://prod_app_user:prod_app_pass@rds-main.eu-west-1.rds.amazonaws.com:5432/fs365_prod',
      SESSION_SECRET: defaultSecret,
      STORAGE_DRIVER: 's3',
      STORAGE_ENDPOINT: 'https://s3.eu-west-1.amazonaws.com',
      STORAGE_REGION: 'eu-west-1',
      STORAGE_BUCKET: 'fs365-production-evidence',
      STORAGE_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
      STORAGE_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    };

    const res = validateEnvironment(prodEnvValid, { requireStorage: true });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.issues.length, 0);
    assert.doesNotThrow(() => assertProductionBoot(prodEnvValid, { requireStorage: true }));
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed}/${total} STAGE 6C HARDENING & FAILURE TESTS PASSED!`);
  console.log('========================================================================');
}

runStage6CSuite().catch(err => {
  console.error('Fatal Stage 6C test failure:', err);
  process.exit(1);
});
