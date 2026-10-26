import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query } from '@/lib/db';
import { fail } from '@/lib/response';
import { getStorageProvider, sanitizeFileName } from '@/lib/storage';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  if (!can(auth.role, 'checks:read') && !can(auth.role, 'records:read')) {
    return fail('FORBIDDEN', 'Insufficient permissions to view evidence', 403);
  }

  const evidenceId = params.id;
  if (!evidenceId) {
    return fail('VALIDATION_ERROR', 'Evidence ID is required', 400);
  }

  if (!process.env.DATABASE_URL) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: `memory://mock-s3/download/${evidenceId}?simulated=true`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        Pragma: 'no-cache'
      }
    });
  }

  try {
    const rows = await query<any>(
      `SELECT e.*, o.organisation_id 
       FROM evidence e 
       JOIN outlets o ON o.id = e.outlet_id 
       WHERE e.id = $1`,
      [evidenceId]
    );

    const record = rows[0];
    if (!record) {
      return fail('NOT_FOUND', 'Evidence not found', 404);
    }

    // Tenant authorization check
    if (record.organisation_id !== auth.organisationId && auth.role !== 'platform_admin' && auth.role !== 'superadmin') {
      return fail('FORBIDDEN', 'Access denied to target evidence.', 403);
    }

    // Outlet authorization check for non-org-level roles
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

    // Quarantine & Availability Gate (Mandatory Safety Rule 5):
    // Pending, failed, deleted, or uncleared (pending_scan/quarantined) evidence MUST be inaccessible
    if (record.status !== 'confirmed' || record.deleted_at !== null || record.scan_status !== 'cleared') {
      return fail('RESOURCE_UNAVAILABLE', 'Evidence is unavailable, pending scan clearance, or has been removed.', 404);
    }

    const storage = getStorageProvider();
    const safeFilename = sanitizeFileName(record.file_name || `evidence_${evidenceId}.${record.file_type === 'application/pdf' ? 'pdf' : 'jpg'}`);

    const downloadUrl = await storage.createPresignedDownloadUrl({
      key: record.storage_key,
      filename: safeFilename,
      disposition: 'inline',
      expiresInSeconds: 60
    });

    // Audit log (Presigned URLs are strictly NOT logged)
    try {
      await query<any>(
        `INSERT INTO audit_log (
          id, outlet_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'EVIDENCE_DOWNLOAD_REQUESTED', $3, $4, $5, now()
        )`,
        [
          record.outlet_id,
          auth.userId,
          record.entity_type,
          record.entity_id,
          JSON.stringify({
            evidence_id: evidenceId,
            storage_key: record.storage_key,
            client_ip: req.headers.get('x-forwarded-for') || 'internal'
          })
        ]
      );
    } catch {
      // Audit failure must not leak secrets or crash user response
    }

    return new Response(null, {
      status: 307,
      headers: {
        Location: downloadUrl,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        Pragma: 'no-cache'
      }
    });
  } catch (err: any) {
    if (err.message && err.message.includes('STORAGE_CONFIGURATION_ERROR')) {
      return fail('CONFIGURATION_ERROR', 'Storage service is misconfigured or unavailable.', 500);
    }
    return fail('DATABASE_ERROR', 'Unable to retrieve evidence download URL.', 500);
  }
}
