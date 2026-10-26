import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query, transaction } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { getStorageProvider, inspectBinaryContent } from '@/lib/storage';
import { resolveRetention } from '@/lib/storage/retention-policy';

export async function POST(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  if (!can(auth.role, 'checks:write') && !can(auth.role, 'records:write')) {
    return fail('FORBIDDEN', 'Insufficient permissions to confirm evidence', 403);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Malformed JSON payload', 400);
  }

  const { evidence_id } = body || {};
  if (!evidence_id || typeof evidence_id !== 'string') {
    return fail('VALIDATION_ERROR', 'evidence_id is required.', 400);
  }

  if (!process.env.DATABASE_URL) {
    return ok(
      {
        id: evidence_id,
        status: 'confirmed',
        scan_status: 'cleared',
        confirmed_at: new Date().toISOString(),
        demo: true
      },
      200
    );
  }

  try {
    const rows = await query<any>(
      `SELECT e.*, o.organisation_id 
       FROM evidence e 
       JOIN outlets o ON o.id = e.outlet_id 
       WHERE e.id = $1`,
      [evidence_id]
    );

    const record = rows[0];
    if (!record) {
      return fail('NOT_FOUND', 'Evidence upload intent not found.', 404);
    }

    // Tenant boundary check
    if (record.organisation_id !== auth.organisationId && auth.role !== 'platform_admin' && auth.role !== 'superadmin') {
      return fail('FORBIDDEN', 'Access denied to target evidence.', 403);
    }

    // Outlet boundary check for non-org-level roles
    if (
      auth.role !== 'platform_admin' &&
      auth.role !== 'admin' &&
      auth.role !== 'superadmin' &&
      auth.role !== 'owner' &&
      auth.role !== 'org_admin'
    ) {
      if (auth.outletId !== record.outlet_id) {
        return fail('FORBIDDEN', 'Access denied to target evidence outlet.', 403);
      }
    }

    // State machine check & Idempotency
    if (record.status === 'confirmed') {
      return ok(record, 200);
    }

    if (record.status === 'failed') {
      return fail('CONFLICT', `Evidence upload previously failed: ${record.failure_reason || 'FAILED'}.`, 409);
    }

    if (record.status === 'deleted') {
      return fail('CONFLICT', 'Evidence record has already been deleted.', 409);
    }

    // Expiry check
    if (record.expires_at && new Date() > new Date(record.expires_at)) {
      await query<any>(
        `UPDATE evidence SET status = 'failed', failure_reason = 'EXPIRED_WITHOUT_CONFIRMATION' WHERE id = $1`,
        [evidence_id]
      );
      return fail('EXPIRED', 'Presigned upload window has expired. Re-initiate upload.', 410);
    }

    const storage = getStorageProvider();
    const meta = await storage.headObject(record.storage_key);
    if (!meta) {
      return fail('STORAGE_OBJECT_NOT_FOUND', 'Uploaded binary not found in storage. Complete the upload before confirmation.', 400);
    }

    // Byte count integrity verification
    if (meta.contentLength !== Number(record.file_size)) {
      await query<any>(
        `UPDATE evidence SET status = 'failed', failure_reason = 'SIZE_MISMATCH' WHERE id = $1`,
        [evidence_id]
      );
      return fail('INTEGRITY_CHECK_FAILED', `Stored size (${meta.contentLength} bytes) does not match declared size (${record.file_size} bytes).`, 400);
    }

    // Checksum verification if S3 wire checksum available and client hash recorded
    if (meta.checksumSha256 && record.hash && meta.checksumSha256.toLowerCase() !== record.hash.toLowerCase()) {
      await query<any>(
        `UPDATE evidence SET status = 'failed', failure_reason = 'CHECKSUM_MISMATCH' WHERE id = $1`,
        [evidence_id]
      );
      return fail('INTEGRITY_CHECK_FAILED', 'SHA-256 wire checksum mismatch.', 400);
    }

    // Magic-byte format & script inspection
    const sample = await storage.readByteRange(record.storage_key, 0, 512);
    if (sample) {
      const inspection = inspectBinaryContent(sample, record.file_type, Number(record.file_size));
      if (!inspection.safe) {
        await storage.deleteObject(record.storage_key);
        await query<any>(
          `UPDATE evidence SET status = 'failed', failure_reason = $1 WHERE id = $2`,
          [inspection.reason || 'UNSAFE_OR_INVALID_FORMAT', evidence_id]
        );
        return fail('INVALID_FILE_FORMAT', inspection.reason || 'Binary failed format or security inspection.', 400);
      }
    }

    // Scan Status Resolution (Mandatory Rule 1):
    // In production, must remain 'pending_scan' unless a verified scanner clears it.
    let scanStatus: 'pending_scan' | 'cleared' | 'quarantined' = 'pending_scan';
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      const testSimulateCleared =
        req.headers.get('x-test-simulate-scan-cleared') === 'true' ||
        process.env.TEST_SIMULATE_SCAN_CLEARED === 'true';
      if (testSimulateCleared) {
        scanStatus = 'cleared';
      }
    }

    // Retention Policy Resolution (Mandatory Rule 2):
    const retention = resolveRetention(record.entity_type);
    const retentionUntil = retention.retentionUntil;

    // Transaction-safe state update
    const updated = await transaction(async client => {
      const uRes = await client.query(
        `UPDATE evidence 
         SET status = 'confirmed', scan_status = $2, confirmed_at = now(), retention_until = $3 
         WHERE id = $1 
         RETURNING *`,
        [evidence_id, scanStatus, retentionUntil]
      );

      // Audit log entry (Presigned URLs or credentials are NEVER logged)
      await client.query(
        `INSERT INTO audit_log (
          id, outlet_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'EVIDENCE_UPLOAD_CONFIRMED', $3, $4, $5, now()
        )`,
        [
          record.outlet_id,
          auth.userId,
          record.entity_type,
          record.entity_id,
          JSON.stringify({
            evidence_id,
            storage_key: record.storage_key,
            file_size: record.file_size,
            file_type: record.file_type,
            scan_status: scanStatus,
            retention_until: retentionUntil ? retentionUntil.toISOString() : null,
            retention_basis: retention.basis
          })
        ]
      );

      return uRes.rows[0];
    });

    return ok(updated, 200);
  } catch (err: any) {
    if (err.message && err.message.includes('STORAGE_CONFIGURATION_ERROR')) {
      return fail('CONFIGURATION_ERROR', 'Storage service is misconfigured or unavailable.', 500);
    }
    return fail('DATABASE_ERROR', 'Unable to confirm evidence upload.', 500);
  }
}
