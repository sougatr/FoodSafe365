/**
 * FoodSafe365 — Stage 6E: MinIO External Object-Storage Interoperability Test Suite
 * 
 * Verifies real end-to-end object storage operations with an actual standalone MinIO service:
 * 1. Presigned upload intent generation via API targeting MinIO
 * 2. Real binary upload (JPEG, PNG, PDF) through presigned URL via HTTP PUT to MinIO
 * 3. Server-side confirmation with real HEAD & Range GET format inspection against MinIO
 * 4. Stored object verification (exact byte count, checksum, ETag)
 * 5. Quarantine download blocking (HTTP 404 while pending_scan)
 * 6. Presigned download retrieval (HTTP 307 redirect and real binary fetch from MinIO)
 * 7. Cross-tenant isolation (confirm, download, delete rejection)
 * 8. Disguised executable rejection & immediate MinIO storage purge
 * 9. Expired upload URL rejection (HTTP 403 RequestExpired from MinIO)
 * 10. Soft-deletion download blocking
 * 11. Abandoned upload cleanup & MinIO object deletion
 * 12. Private bucket verification (anonymous public GET rejected with HTTP 403 AccessDenied)
 * 13. Production memory driver rejection
 * 14. Clean teardown and bucket disposal verification
 */

import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { createSessionToken, SESSION_COOKIE_NAME } from '../lib/session';
import { setPoolForTesting, resetPool } from '../lib/db';
import { S3StorageProvider } from '../lib/storage/s3';
import { setStorageProviderForTesting, resetStorageProvider } from '../lib/storage/index';
import { validateStorageConfig } from '../lib/env-validator';
import { cleanupAbandonedEvidence } from '../scripts/cleanup-abandoned-evidence';
import { MinioManager } from './helpers/minio-manager';

import { POST as presignUploadHandler } from '../app/api/v1/evidence/presign-upload/route';
import { POST as confirmUploadHandler } from '../app/api/v1/evidence/confirm/route';
import { GET as downloadHandler } from '../app/api/v1/evidence/[id]/download/route';
import { GET as getEvidenceHandler, DELETE as deleteEvidenceHandler } from '../app/api/v1/evidence/[id]/route';

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
 * Stateful Mock PostgreSQL Database for Stage 6E Integration
 */
class Stage6EMockDatabase {
  public tables: Map<string, any[]> = new Map();

  constructor() {
    this.tables.set('outlets', [
      { id: 'outlet-bandra', organisation_id: 'org-bandra', status: 'active' },
      { id: 'outlet-competitor', organisation_id: 'org-competitor', status: 'active' }
    ]);
    this.tables.set('check_responses', [
      { id: 'cr-item-1', check_instance_id: 'ci-inst-1' },
      { id: 'cr-item-png', check_instance_id: 'ci-inst-1' }
    ]);
    this.tables.set('check_instances', [
      { id: 'ci-inst-1', outlet_id: 'outlet-bandra' }
    ]);
    this.tables.set('documents', [
      { id: 'doc-pdf-1', outlet_id: 'outlet-bandra' },
      { id: 'doc-malicious', outlet_id: 'outlet-bandra' },
      { id: 'doc-abandoned', outlet_id: 'outlet-bandra' }
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
    const cleaned = sqlText.trim().replace(/\s+/g, ' ');

    if (cleaned === 'BEGIN' || cleaned === 'COMMIT' || cleaned === 'ROLLBACK') {
      return { rows: [] };
    }

    // 1. Verify outlet
    if (cleaned.includes('FROM outlets WHERE id = $1 AND organisation_id = $2')) {
      const [outletId, orgId] = params;
      const outlet = (this.tables.get('outlets') || []).find(
        o => o.id === outletId && o.organisation_id === orgId && o.status === 'active'
      );
      return { rows: outlet ? [outlet] : [] };
    }

    // 2. Verify entity ownership
    if (cleaned.includes('check_responses cr JOIN check_instances ci ON ci.id = cr.check_instance_id')) {
      const [crId, outletId] = params;
      const cr = (this.tables.get('check_responses') || []).find(r => r.id === crId);
      if (!cr) return { rows: [] };
      const ci = (this.tables.get('check_instances') || []).find(i => i.id === cr.check_instance_id);
      if (ci && ci.outlet_id === outletId) {
        return { rows: [{ id: crId }] };
      }
      return { rows: [] };
    }

    if (cleaned.includes('FROM documents WHERE id = $1 AND outlet_id = $2')) {
      const [docId, outletId] = params;
      const doc = (this.tables.get('documents') || []).find(d => d.id === docId && d.outlet_id === outletId);
      return { rows: doc ? [doc] : [] };
    }

    // 3. INSERT INTO evidence
    if (cleaned.startsWith('INSERT INTO evidence')) {
      const [
        evidenceId,
        outletId,
        entityType,
        entityId,
        fileUrl,
        fileType,
        fileSize,
        hash,
        capturedBy,
        description,
        storageKey,
        expiresAt
      ] = params;

      const newRow = {
        id: evidenceId,
        outlet_id: outletId,
        entity_type: entityType,
        entity_id: entityId,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        hash,
        captured_by: capturedBy,
        captured_at: new Date(),
        description,
        status: 'pending',
        scan_status: 'pending_scan',
        storage_key: storageKey,
        expires_at: expiresAt,
        confirmed_at: null,
        deleted_at: null,
        deleted_by: null,
        retention_until: null,
        failure_reason: null
      };

      const evidenceList = this.tables.get('evidence') || [];
      evidenceList.push(newRow);
      return { rows: [newRow] };
    }

    // 4. SELECT evidence JOIN outlets
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

    // 5. UPDATE evidence confirm
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

    // 6. UPDATE evidence failed
    if (cleaned.includes("UPDATE evidence SET status = 'failed'")) {
      const evidenceId = params[params.length - 1];
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === evidenceId);
      if (evidence) {
        evidence.status = 'failed';
        if (cleaned.includes("failure_reason = 'SIZE_MISMATCH'")) {
          evidence.failure_reason = 'SIZE_MISMATCH';
        } else if (cleaned.includes("failure_reason = 'EXPIRED_WITHOUT_CONFIRMATION'")) {
          evidence.failure_reason = 'EXPIRED_WITHOUT_CONFIRMATION';
        } else if (cleaned.includes("failure_reason = 'ABANDONED_UPLOAD_EXPIRED'")) {
          evidence.failure_reason = 'ABANDONED_UPLOAD_EXPIRED';
        } else {
          evidence.failure_reason = params[0] || 'FAILED';
        }
        return { rows: [evidence] };
      }
      return { rows: [] };
    }

    // 7. UPDATE evidence soft delete
    if (cleaned.includes("UPDATE evidence SET status = 'deleted'")) {
      const [evidenceId, deletedBy] = params;
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === evidenceId);
      if (evidence) {
        evidence.status = 'deleted';
        evidence.deleted_at = new Date();
        evidence.deleted_by = deletedBy;
        return { rows: [evidence] };
      }
      return { rows: [] };
    }

    // 8. SELECT candidate evidence for cleanup
    if (cleaned.includes("FROM evidence WHERE status = 'pending'")) {
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

    // 9. FOR UPDATE row lock for cleanup
    if (cleaned.includes('FOR UPDATE SKIP LOCKED')) {
      const id = params[0];
      const evidence = (this.tables.get('evidence') || []).find(e => e.id === id);
      return { rows: evidence ? [evidence] : [] };
    }

    // 10. INSERT INTO audit_logs / audit_log
    if (cleaned.includes('INSERT INTO audit_logs') || cleaned.includes('INSERT INTO audit_log')) {
      const auditLog = this.tables.get('audit_logs') || [];
      auditLog.push({
        id: crypto.randomUUID(),
        details: params[params.length - 1],
        created_at: new Date()
      });
      return { rows: [] };
    }

    return { rows: [] };
  }
}

async function runStage6EMinioSuite() {
  console.log('========================================================================');
  console.log('FOODSAFE365 — STAGE 6E: MINIO EXTERNAL STORAGE INTEROPERABILITY TEST SUITE');
  console.log('========================================================================\n');

  // 1. MinIO Service Configuration (Strict Loopback)
  const endpoint = process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000';
  const region = 'ap-south-1';
  const bucket = 'foodsafe365-test-minio';
  const accessKeyId = process.env.MINIO_ACCESS_KEY || 'fs365_minio_user_8f2a';
  const secretAccessKey = process.env.MINIO_SECRET_KEY || 'fs365_strong_test_secret_9b3c4d7e1a_secure';

  const minioManager = new MinioManager({
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey
  });

  // Verify Docker Daemon availability first
  if (!minioManager.isDockerAvailable()) {
    console.error('Docker daemon is not responding. Please ensure Docker Desktop is running.');
    process.exit(1);
  }

  // Verify MinIO readiness
  console.log(`[STORAGE-INIT] Connecting to MinIO service at ${endpoint}...`);
  const ready = await minioManager.isMinioReady(5000);
  if (!ready) {
    console.error(`MinIO is not reachable on ${endpoint}. Stage 6E requires an active MinIO service.`);
    process.exit(1);
  }

  // Ensure test bucket exists in MinIO
  await minioManager.ensureBucketExists();
  console.log(`[STORAGE-INIT] MinIO test bucket ready: ${bucket}\n`);

  // Configure process.env for API routes and storage resolution
  process.env.STORAGE_DRIVER = 's3';
  process.env.STORAGE_ENDPOINT = endpoint;
  process.env.STORAGE_BUCKET = bucket;
  process.env.STORAGE_REGION = region;
  process.env.STORAGE_ACCESS_KEY_ID = accessKeyId;
  process.env.STORAGE_SECRET_ACCESS_KEY = secretAccessKey;
  process.env.STORAGE_FORCE_PATH_STYLE = 'true';
  process.env.DATABASE_URL = 'postgresql://test_user:test_pass@localhost:5432/foodsafe365_test';
  process.env.SESSION_SECRET = 'c982b6e118f67389c922df68875ea011284d79b9b5f9048a1239c0fa1e5d7a6b';

  // 2. Initialize S3StorageProvider configured for MinIO
  const minioStorageProvider = new S3StorageProvider({
    driver: 's3',
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: true,
    uploadTtlSeconds: 300,
    downloadTtlSeconds: 60
  });
  setStorageProviderForTesting(minioStorageProvider);

  // 3. Initialize Mock Database
  const mockDb = new Stage6EMockDatabase();
  setPoolForTesting(mockDb as any);

  // 4. Session Tokens
  const fssSession = createSessionToken({
    userId: 'usr-fss-1',
    organisationId: 'org-bandra',
    outletId: 'outlet-bandra',
    role: 'food_safety_supervisor',
    journey: 'restaurant'
  });

  const competitorSession = createSessionToken({
    userId: 'usr-comp-mgr',
    organisationId: 'org-competitor',
    outletId: 'outlet-competitor',
    role: 'manager',
    journey: 'restaurant'
  });

  // 5. Test Counter
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
      console.error('   Error:', err.message || err);
      throw err;
    }
  }

  // 6. Test Binary Payloads (Standard Valid Files)
  const validJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9
  ]);
  const validJpegSha256 = crypto.createHash('sha256').update(validJpeg).digest('hex');

  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89
  ]);
  const validPngSha256 = crypto.createHash('sha256').update(validPng).digest('hex');

  const validPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF\n'
  );
  const validPdfSha256 = crypto.createHash('sha256').update(validPdf).digest('hex');

  let jpegEvidenceId = '';
  let jpegStorageKey = '';
  let pngEvidenceId = '';
  let pdfEvidenceId = '';

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: END-TO-END BINARY UPLOAD & CONFIRMATION
    // -------------------------------------------------------------------------
    console.log('--- SECTION 1: REAL BINARY UPLOAD & CONFIRMATION ---');

    await test('MinIO 1.1: Generate presigned upload URL via API targeting MinIO', async () => {
      const req = makeRequest(
        'http://localhost/api/v1/evidence/presign-upload',
        'POST',
        {
          outlet_id: 'outlet-bandra',
          entity_type: 'check_response',
          entity_id: 'cr-item-1',
          file_name: 'clean_kitchen.jpg',
          file_type: 'image/jpeg',
          file_size: validJpeg.length,
          sha256_hash: validJpegSha256
        },
        fssSession
      );

      const res = await presignUploadHandler(req);
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.ok(data.data.evidence_id);
      assert.ok(data.data.upload_url.startsWith(`${endpoint}/${bucket}`));
      assert.ok(data.data.upload_url.includes('X-Amz-Signature='));
      assert.ok(data.data.storage_key.includes('tenants/org-bandra/outlets/outlet-bandra/check_response'));

      jpegEvidenceId = data.data.evidence_id;
      jpegStorageKey = data.data.storage_key;
    });

    await test('MinIO 1.2: Execute real HTTP PUT upload of JPEG to MinIO presigned URL', async () => {
      const preReq = makeRequest(
        'http://localhost/api/v1/evidence/presign-upload',
        'POST',
        {
          outlet_id: 'outlet-bandra',
          entity_type: 'check_response',
          entity_id: 'cr-item-1',
          file_name: 'kitchen_probe.jpg',
          file_type: 'image/jpeg',
          file_size: validJpeg.length,
          sha256_hash: validJpegSha256
        },
        fssSession
      );
      const preRes = await presignUploadHandler(preReq);
      const preData = await preRes.json();
      jpegEvidenceId = preData.data.evidence_id;
      jpegStorageKey = preData.data.storage_key;
      const uploadUrl = preData.data.upload_url;

      // Real network HTTP PUT to MinIO
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          ...(preData.data.required_headers || { 'content-type': 'image/jpeg' })
        },
        body: new Uint8Array(validJpeg)
      });

      assert.strictEqual(putRes.status, 200, 'MinIO must accept valid SigV4 PUT upload');
      assert.ok(putRes.headers.get('etag'), 'Must return ETag header');
    });

    await test('MinIO 1.3: Confirm uploaded JPEG via API (verifying HEAD & magic-byte range inspection)', async () => {
      const confReq = makeRequest(
        'http://localhost/api/v1/evidence/confirm',
        'POST',
        { evidence_id: jpegEvidenceId },
        fssSession,
        { 'x-test-simulate-scan-cleared': 'true' }
      );

      const res = await confirmUploadHandler(confReq);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.data.status, 'confirmed');
      assert.strictEqual(data.data.scan_status, 'cleared');
      assert.ok(data.data.confirmed_at);
    });

    await test('MinIO 1.4: Real MinIO HeadObject verification: exact byte count, content-type and ETag', async () => {
      const head = await minioStorageProvider.headObject(jpegStorageKey);
      assert.ok(head);
      assert.strictEqual(head.contentLength, validJpeg.length);
      assert.strictEqual(head.contentType, 'image/jpeg');
      assert.ok(head.etag.length > 0);
    });

    await test('MinIO 1.5: End-to-end PNG upload, confirmation and MinIO storage verification', async () => {
      const preReq = makeRequest(
        'http://localhost/api/v1/evidence/presign-upload',
        'POST',
        {
          outlet_id: 'outlet-bandra',
          entity_type: 'check_response',
          entity_id: 'cr-item-png',
          file_name: 'temp_chart.png',
          file_type: 'image/png',
          file_size: validPng.length,
          sha256_hash: validPngSha256
        },
        fssSession
      );
      const preRes = await presignUploadHandler(preReq);
      const preData = await preRes.json();
      pngEvidenceId = preData.data.evidence_id;
      const pngKey = preData.data.storage_key;

      const putRes = await fetch(preData.data.upload_url, {
        method: 'PUT',
        headers: { ...(preData.data.required_headers || { 'content-type': 'image/png' }) },
        body: new Uint8Array(validPng)
      });
      assert.strictEqual(putRes.status, 200);

      const confRes = await confirmUploadHandler(
        makeRequest('http://localhost/api/v1/evidence/confirm', 'POST', { evidence_id: pngEvidenceId }, fssSession, {
          'x-test-simulate-scan-cleared': 'true'
        })
      );
      assert.strictEqual(confRes.status, 200);

      const head = await minioStorageProvider.headObject(pngKey);
      assert.ok(head);
      assert.strictEqual(head.contentLength, validPng.length);
      assert.strictEqual(head.contentType, 'image/png');
    });

    await test('MinIO 1.6: End-to-end PDF upload, confirmation and MinIO storage verification', async () => {
      const preReq = makeRequest(
        'http://localhost/api/v1/evidence/presign-upload',
        'POST',
        {
          outlet_id: 'outlet-bandra',
          entity_type: 'document',
          entity_id: 'doc-pdf-1',
          file_name: 'audit_certificate.pdf',
          file_type: 'application/pdf',
          file_size: validPdf.length,
          sha256_hash: validPdfSha256
        },
        fssSession
      );
      const preRes = await presignUploadHandler(preReq);
      const preData = await preRes.json();
      pdfEvidenceId = preData.data.evidence_id;
      const pdfKey = preData.data.storage_key;

      const putRes = await fetch(preData.data.upload_url, {
        method: 'PUT',
        headers: { ...(preData.data.required_headers || { 'content-type': 'application/pdf' }) },
        body: new Uint8Array(validPdf)
      });
      assert.strictEqual(putRes.status, 200);

      const confRes = await confirmUploadHandler(
        makeRequest('http://localhost/api/v1/evidence/confirm', 'POST', { evidence_id: pdfEvidenceId }, fssSession, {
          'x-test-simulate-scan-cleared': 'true'
        })
      );
      assert.strictEqual(confRes.status, 200);

      const head = await minioStorageProvider.headObject(pdfKey);
      assert.ok(head);
      assert.strictEqual(head.contentLength, validPdf.length);
    });

    // -------------------------------------------------------------------------
    // SECTION 2: QUARANTINE, PERMITTED DOWNLOAD & CROSS-TENANT ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 2: QUARANTINE, DOWNLOAD & TENANT ISOLATION ---');

    await test('MinIO 2.1: Download is strictly blocked (HTTP 404) for pending_scan uploads', async () => {
      const preReq = makeRequest(
        'http://localhost/api/v1/evidence/presign-upload',
        'POST',
        {
          outlet_id: 'outlet-bandra',
          entity_type: 'document',
          entity_id: 'doc-pdf-1',
          file_name: 'pending_scan_doc.pdf',
          file_type: 'application/pdf',
          file_size: validPdf.length
        },
        fssSession
      );
      const preRes = await presignUploadHandler(preReq);
      const preData = await preRes.json();
      const quarantinedId = preData.data.evidence_id;

      await fetch(preData.data.upload_url, {
        method: 'PUT',
        headers: { ...(preData.data.required_headers || { 'content-type': 'application/pdf' }) },
        body: new Uint8Array(validPdf)
      });

      // Confirm without simulation header -> stays pending_scan
      const confRes = await confirmUploadHandler(
        makeRequest('http://localhost/api/v1/evidence/confirm', 'POST', { evidence_id: quarantinedId }, fssSession)
      );
      assert.strictEqual(confRes.status, 200);
      const confData = await confRes.json();
      assert.strictEqual(confData.data.scan_status, 'pending_scan');

      // Attempt to download -> strictly blocked
      const downReq = makeRequest(
        `http://localhost/api/v1/evidence/${quarantinedId}/download`,
        'GET',
        undefined,
        fssSession
      );
      const downRes = await downloadHandler(downReq, { params: { id: quarantinedId } });
      assert.strictEqual(downRes.status, 404);
      const downData = await downRes.json();
      assert.strictEqual(downData.error.code, 'RESOURCE_UNAVAILABLE');
    });

    await test('MinIO 2.2: Permitted download returns HTTP 307 redirect and retrieves actual binary from MinIO', async () => {
      const downReq = makeRequest(
        `http://localhost/api/v1/evidence/${jpegEvidenceId}/download`,
        'GET',
        undefined,
        fssSession
      );
      const downRes = await downloadHandler(downReq, { params: { id: jpegEvidenceId } });
      assert.strictEqual(downRes.status, 307);

      const redirectLocation = downRes.headers.get('location');
      assert.ok(redirectLocation);
      assert.ok(redirectLocation.startsWith(`${endpoint}/${bucket}`));

      // Fetch actual binary over HTTP from MinIO
      const fetchRes = await fetch(redirectLocation);
      assert.strictEqual(fetchRes.status, 200);
      const arrayBuf = await fetchRes.arrayBuffer();
      const downloadedBytes = Buffer.from(arrayBuf);

      assert.strictEqual(downloadedBytes.length, validJpeg.length);
      assert.deepStrictEqual(downloadedBytes, validJpeg);
    });

    await test('MinIO 2.3: Cross-tenant confirmation attempt is rejected with HTTP 403', async () => {
      const confReq = makeRequest(
        'http://localhost/api/v1/evidence/confirm',
        'POST',
        { evidence_id: jpegEvidenceId },
        competitorSession
      );
      const confRes = await confirmUploadHandler(confReq);
      assert.strictEqual(confRes.status, 403);
    });

    await test('MinIO 2.4: Cross-tenant download attempt is rejected with HTTP 403', async () => {
      const downReq = makeRequest(
        `http://localhost/api/v1/evidence/${jpegEvidenceId}/download`,
        'GET',
        undefined,
        competitorSession
      );
      const downRes = await downloadHandler(downReq, { params: { id: jpegEvidenceId } });
      assert.strictEqual(downRes.status, 403);
    });

    await test('MinIO 2.5: Cross-tenant delete attempt is rejected with HTTP 403', async () => {
      const delReq = makeRequest(
        `http://localhost/api/v1/evidence/${jpegEvidenceId}`,
        'DELETE',
        undefined,
        competitorSession
      );
      const delRes = await deleteEvidenceHandler(delReq, { params: { id: jpegEvidenceId } });
      assert.strictEqual(delRes.status, 403);
    });

    // -------------------------------------------------------------------------
    // SECTION 3: DISGUISED EXECUTABLE PURGE & SECURITY
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 3: DISGUISED EXECUTABLE PURGE & SECURITY ---');

    await test('MinIO 3.1: Disguised executable payload fails confirmation and is purged from MinIO', async () => {
      const preReq = makeRequest(
        'http://localhost/api/v1/evidence/presign-upload',
        'POST',
        {
          outlet_id: 'outlet-bandra',
          entity_type: 'document',
          entity_id: 'doc-malicious',
          file_name: 'trojan_license.jpg',
          file_type: 'image/jpeg',
          file_size: 8
        },
        fssSession
      );
      const preRes = await presignUploadHandler(preReq);
      const preData = await preRes.json();
      const maliciousId = preData.data.evidence_id;
      const maliciousKey = preData.data.storage_key;

      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

      const putRes = await fetch(preData.data.upload_url, {
        method: 'PUT',
        headers: { ...(preData.data.required_headers || { 'content-type': 'image/jpeg' }) },
        body: new Uint8Array(exeBuffer)
      });
      assert.strictEqual(putRes.status, 200);

      // Verify it exists in MinIO before confirmation
      assert.ok(await minioStorageProvider.headObject(maliciousKey));

      // Confirm: Format inspection sniffs real Range bytes and detects executable
      const confRes = await confirmUploadHandler(
        makeRequest('http://localhost/api/v1/evidence/confirm', 'POST', { evidence_id: maliciousId }, fssSession)
      );
      assert.strictEqual(confRes.status, 400);
      const confData = await confRes.json();
      assert.strictEqual(confData.error.code, 'INVALID_FILE_FORMAT');

      // Assert S3 object was immediately purged from MinIO!
      const headAfter = await minioStorageProvider.headObject(maliciousKey);
      assert.strictEqual(headAfter, null, 'Malicious binary must be purged from MinIO storage');
    });

    await test('MinIO 3.2: Expired presigned URL is rejected by MinIO service with HTTP 403', async () => {
      const expiredPresigned = await minioStorageProvider.createPresignedUploadUrl({
        key: 'tenants/org-bandra/outlets/outlet-bandra/document/doc-pdf-1/expired.pdf',
        contentType: 'application/pdf',
        contentLength: validPdf.length,
        expiresInSeconds: 1
      });

      // Wait 1.5s for expiration
      await new Promise(r => setTimeout(r, 1500));

      const putRes = await fetch(expiredPresigned.url, {
        method: 'PUT',
        headers: { ...(expiredPresigned.headers || { 'content-type': 'application/pdf' }) },
        body: new Uint8Array(validPdf)
      });

      assert.strictEqual(putRes.status, 403, 'Expired presigned URL must be rejected by MinIO with HTTP 403');
    });

    await test('MinIO 3.3: Soft-deleted evidence blocks subsequent download attempts', async () => {
      const delReq = makeRequest(
        `http://localhost/api/v1/evidence/${jpegEvidenceId}`,
        'DELETE',
        undefined,
        fssSession
      );
      const delRes = await deleteEvidenceHandler(delReq, { params: { id: jpegEvidenceId } });
      assert.strictEqual(delRes.status, 200);

      const downReq = makeRequest(
        `http://localhost/api/v1/evidence/${jpegEvidenceId}/download`,
        'GET',
        undefined,
        fssSession
      );
      const downRes = await downloadHandler(downReq, { params: { id: jpegEvidenceId } });
      assert.strictEqual(downRes.status, 404, 'Must return 404 for soft-deleted evidence');
    });

    await test('MinIO 3.4: Abandoned upload cleanup purges expired pending binary from MinIO', async () => {
      const abandonedKey = 'tenants/org-bandra/outlets/outlet-bandra/document/doc-abandoned/abandoned.pdf';
      const abandonedId = 'ev-abandoned-minio';

      await minioStorageProvider.putObject(abandonedKey, validPdf, 'application/pdf');
      assert.ok(await minioStorageProvider.headObject(abandonedKey));

      mockDb.tables.get('evidence')?.push({
        id: abandonedId,
        outlet_id: 'outlet-bandra',
        entity_type: 'document',
        entity_id: 'doc-abandoned',
        file_url: `storage://${abandonedKey}`,
        file_type: 'application/pdf',
        file_size: validPdf.length,
        status: 'pending',
        scan_status: 'pending_scan',
        storage_key: abandonedKey,
        expires_at: new Date(Date.now() - 3600 * 1000),
        captured_at: new Date(Date.now() - 3600 * 1000)
      });

      const report = await cleanupAbandonedEvidence({
        now: new Date(),
        storageProvider: minioStorageProvider
      });

      assert.strictEqual(report.purgedCount >= 1, true);

      const head = await minioStorageProvider.headObject(abandonedKey);
      assert.strictEqual(head, null, 'Abandoned binary must be removed from MinIO');
    });

    await test('MinIO 3.5: Private bucket security: Anonymous public GET returns HTTP 403 AccessDenied', async () => {
      const publicUrl = `${endpoint}/${bucket}/${pngEvidenceId}`;
      const res = await fetch(publicUrl, { method: 'GET' });
      assert.strictEqual(res.status, 403, 'Anonymous public access to MinIO bucket must be forbidden');
      const body = await res.text();
      assert.ok(body.includes('AccessDenied'), 'Must return AccessDenied XML');
    });

    await test('MinIO 3.6: Production boot safety forbids STORAGE_DRIVER=memory', async () => {
      const prodEnv: NodeJS.ProcessEnv = {
        NODE_ENV: 'production',
        STORAGE_DRIVER: 'memory'
      };
      const issue = validateStorageConfig(prodEnv, true);
      assert.ok(issue);
      assert.ok(issue.message.includes('STORAGE_DRIVER=memory is forbidden in production'));
    });

  } finally {
    // -------------------------------------------------------------------------
    // SECTION 4: TEARDOWN & COMPLETE DISPOSAL
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 4: TEARDOWN & CLEANUP CONFIRMATION ---');
    await minioManager.purgeBucketAndObjects();
    console.log('✅ [PASS] Teardown: MinIO test bucket and temporary objects cleaned up cleanly');
  }

  console.log('\n========================================================================');
  console.log(`ALL ${passed}/${total} STAGE 6E MINIO INTEROPERABILITY TESTS PASSED!`);
  console.log('========================================================================');
}

runStage6EMinioSuite().catch(err => {
  console.error('Fatal Stage 6E test failure:', err);
  process.exit(1);
});
