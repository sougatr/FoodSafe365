import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query, transaction } from '@/lib/db';
import { ok, fail } from '@/lib/response';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  if (!can(auth.role, 'checks:read') && !can(auth.role, 'records:read')) {
    return fail('FORBIDDEN', 'Insufficient permissions to view evidence', 403);
  }

  const evidenceId = params.id;
  if (!evidenceId) return fail('VALIDATION_ERROR', 'Evidence ID is required', 400);

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  if (!process.env.DATABASE_URL) {
    return ok({ id: evidenceId, status: 'confirmed', scan_status: 'cleared', demo: true }, 200);
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
    if (!record) return fail('NOT_FOUND', 'Evidence not found', 404);

    if (record.organisation_id !== auth.organisationId && auth.role !== 'platform_admin' && auth.role !== 'superadmin') {
      return fail('FORBIDDEN', 'Access denied to target evidence.', 403);
    }

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

    return ok(record, 200);
  } catch {
    return fail('DATABASE_ERROR', 'Unable to retrieve evidence metadata.', 500);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  // Deletion is strictly restricted to supervisory and managerial compliance roles
  const allowedRoles = new Set(['owner', 'org_admin', 'food_safety_supervisor', 'platform_admin', 'superadmin']);
  if (!allowedRoles.has(auth.role)) {
    return fail('FORBIDDEN', 'Only managers, food safety supervisors, or organisation administrators can delete compliance evidence.', 403);
  }

  const evidenceId = params.id;
  if (!evidenceId) return fail('VALIDATION_ERROR', 'Evidence ID is required', 400);

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  if (!process.env.DATABASE_URL) {
    return ok({ id: evidenceId, status: 'deleted', deleted_at: new Date().toISOString(), demo: true }, 200);
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
    if (!record) return fail('NOT_FOUND', 'Evidence not found', 404);

    if (record.organisation_id !== auth.organisationId && auth.role !== 'platform_admin' && auth.role !== 'superadmin') {
      return fail('FORBIDDEN', 'Access denied to target evidence.', 403);
    }

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

    // Already deleted
    if (record.status === 'deleted' || record.deleted_at !== null) {
      return ok({ id: evidenceId, status: 'deleted', alreadyDeleted: true }, 200);
    }

    // Retention Lock Enforcement (Mandatory Rule 2):
    // Evidence under an active retention lock cannot be deleted
    if (record.retention_until && new Date() < new Date(record.retention_until)) {
      return fail(
        'RETENTION_LOCKED',
        `Evidence is protected under an approved retention policy and cannot be deleted prior to ${new Date(record.retention_until).toISOString()}.`,
        423 // 423 Locked
      );
    }

    // Soft deletion inside atomic transaction
    const updated = await transaction(async client => {
      const dRes = await client.query(
        `UPDATE evidence 
         SET status = 'deleted', deleted_at = now(), deleted_by = $2 
         WHERE id = $1 
         RETURNING *`,
        [evidenceId, auth.userId]
      );

      // Audit log entry
      await client.query(
        `INSERT INTO audit_log (
          id, outlet_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'EVIDENCE_SOFT_DELETED', $3, $4, $5, now()
        )`,
        [
          record.outlet_id,
          auth.userId,
          record.entity_type,
          record.entity_id,
          JSON.stringify({
            evidence_id: evidenceId,
            storage_key: record.storage_key,
            deleted_by: auth.userId,
            deleted_at: new Date().toISOString()
          })
        ]
      );

      return dRes.rows[0];
    });

    return ok(updated, 200);
  } catch {
    return fail('DATABASE_ERROR', 'Unable to delete evidence record.', 500);
  }
}
