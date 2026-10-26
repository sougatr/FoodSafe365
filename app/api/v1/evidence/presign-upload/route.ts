import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { getStorageProvider, buildEvidenceStorageKey, MAX_FILE_SIZE_BYTES } from '@/lib/storage';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const ALLOWED_ENTITIES = new Set([
  'check_response',
  'observation',
  'corrective_action',
  'document',
  'service',
  'haccp_monitoring'
]);

export async function POST(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  if (!can(auth.role, 'checks:write') && !can(auth.role, 'records:write')) {
    return fail('FORBIDDEN', 'Insufficient permissions to upload evidence', 403);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Malformed JSON payload', 400);
  }

  const { outlet_id, entity_type, entity_id, file_name, file_type, file_size, sha256_hash, description } = body || {};

  if (!outlet_id || !entity_type || !entity_id || !file_name || !file_type || file_size === undefined) {
    return fail('VALIDATION_ERROR', 'outlet_id, entity_type, entity_id, file_name, file_type, and file_size are required.', 400);
  }

  const cleanMime = String(file_type).toLowerCase().trim();
  if (!ALLOWED_MIME.has(cleanMime)) {
    return fail('VALIDATION_ERROR', 'Unsupported file type. Allowed types: JPG, PNG, PDF.', 400);
  }

  const cleanSize = Number(file_size);
  if (isNaN(cleanSize) || cleanSize <= 0 || cleanSize > MAX_FILE_SIZE_BYTES) {
    return fail('VALIDATION_ERROR', `File size must be between 1 byte and ${MAX_FILE_SIZE_BYTES} bytes.`, 400);
  }

  const cleanEntity = String(entity_type).toLowerCase().trim();
  if (!ALLOWED_ENTITIES.has(cleanEntity)) {
    return fail('VALIDATION_ERROR', `Invalid entity_type "${entity_type}".`, 400);
  }

  if (sha256_hash && !/^[a-fA-F0-9]{64}$/.test(String(sha256_hash).trim())) {
    return fail('VALIDATION_ERROR', 'sha256_hash must be a 64-character hexadecimal string.', 400);
  }

  // Verify outlet access
  if (auth.role !== 'platform_admin' && auth.role !== 'admin' && auth.role !== 'superadmin' && auth.role !== 'owner' && auth.role !== 'org_admin') {
    if (auth.outletId !== outlet_id) {
      return fail('FORBIDDEN', 'Access denied to target outlet', 403);
    }
  }

  try {
    let outletRows: any[] = [];
    if (process.env.DATABASE_URL) {
      outletRows = await query<any>(
        `SELECT id FROM outlets WHERE id = $1 AND organisation_id = $2 AND status = 'active'`,
        [outlet_id, auth.organisationId]
      );
      if (!outletRows[0] && auth.role !== 'platform_admin' && auth.role !== 'superadmin') {
        return fail('FORBIDDEN', 'Outlet does not belong to your organisation or is inactive.', 403);
      }

      // Verify entity ownership
      const entityQueries: Record<string, string> = {
        check_response: `SELECT cr.id FROM check_responses cr JOIN check_instances ci ON ci.id = cr.check_instance_id WHERE cr.id = $1 AND ci.outlet_id = $2`,
        observation: `SELECT id FROM observations WHERE id = $1 AND outlet_id = $2`,
        corrective_action: `SELECT id FROM corrective_actions WHERE id = $1 AND outlet_id = $2`,
        document: `SELECT id FROM documents WHERE id = $1 AND outlet_id = $2`,
        service: `SELECT id FROM service_requests WHERE id = $1 AND outlet_id = $2`,
        haccp_monitoring: `SELECT mr.id FROM monitoring_records mr JOIN ccps c ON c.id = mr.ccp_id WHERE mr.id = $1 AND mr.outlet_id = $2`
      };

      const entityCheck = await query<any>(entityQueries[cleanEntity], [entity_id, outlet_id]);
      if (!entityCheck[0]) {
        return fail('FORBIDDEN', `Target ${cleanEntity} does not belong to the specified outlet.`, 403);
      }
    }

    const storage = getStorageProvider();
    const evidenceId = crypto.randomUUID();
    const storageKey = buildEvidenceStorageKey({
      organisationId: auth.organisationId,
      outletId: outlet_id,
      entityType: cleanEntity,
      entityId: String(entity_id),
      fileName: String(file_name),
      evidenceId
    });

    const presigned = await storage.createPresignedUploadUrl({
      key: storageKey,
      contentType: cleanMime,
      contentLength: cleanSize,
      checksumSha256: sha256_hash ? String(sha256_hash).trim() : undefined,
      expiresInSeconds: 300
    });

    if (process.env.DATABASE_URL) {
      await query<any>(
        `INSERT INTO evidence (
          id, outlet_id, entity_type, entity_id, file_url, file_type, file_size,
          hash, captured_by, captured_at, description, status, scan_status,
          storage_key, expires_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, 'pending', 'pending_scan', $11, $12
        )`,
        [
          evidenceId,
          outlet_id,
          cleanEntity,
          entity_id,
          `storage://${storageKey}`,
          cleanMime,
          cleanSize,
          sha256_hash ? String(sha256_hash).trim() : null,
          auth.userId,
          description ? String(description).trim() : null,
          storageKey,
          presigned.expiresAt
        ]
      );
    }

    return ok(
      {
        evidence_id: evidenceId,
        upload_url: presigned.url,
        storage_key: storageKey,
        required_headers: presigned.headers,
        expires_at: presigned.expiresAt.toISOString()
      },
      201
    );
  } catch (err: any) {
    if (err.message && err.message.includes('STORAGE_CONFIGURATION_ERROR')) {
      return fail('CONFIGURATION_ERROR', 'Storage service is misconfigured or unavailable.', 500);
    }
    return fail('DATABASE_ERROR', 'Unable to initialize evidence upload intent.', 500);
  }
}
