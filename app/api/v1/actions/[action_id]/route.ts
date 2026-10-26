import { getAuthContext } from '../../../../../lib/auth';
import { can } from '../../../../../lib/permissions';
import { query } from '../../../../../lib/db';
import { ok, fail } from '../../../../../lib/response';
import { getDemoAction, updateDemoAction } from '../../../../../lib/demo-store';

export async function GET(req: Request, { params }: { params: { action_id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'actions:read')) return fail('FORBIDDEN', 'You do not have permission to view corrective actions', 403);
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant corrective actions', 403);
  }

  if (!process.env.DATABASE_URL) {
    const demo = getDemoAction(params.action_id, auth.userId);
    if (!demo) return fail('NOT_FOUND', 'Corrective action not found', 404);
    if (demo.organisationId && auth.organisationId && demo.organisationId !== auth.organisationId && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
      return fail('FORBIDDEN', 'Action access denied: organisation mismatch', 403);
    }
    const isOrgOrAdmin = ['platform_admin', 'admin', 'superadmin', 'org_admin', 'owner'].includes(auth.role);
    if (!isOrgOrAdmin && demo.outletId && auth.outletId && demo.outletId !== auth.outletId) {
      return fail('FORBIDDEN', 'Action access denied for your outlet', 403);
    }
    return ok({ ...demo, verifications: demo.verifications || [], demo: true });
  }

  const isOrgOrAdmin = ['platform_admin', 'admin', 'superadmin', 'org_admin', 'owner'].includes(auth.role);
  let queryText: string;
  let queryParams: any[];
  if (['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    queryText = `SELECT ca.id,ca.outlet_id "outletId",ca.title,ca.description,ca.severity,ca.priority,ca.assigned_to "assignedTo",ca.due_date "dueDate",ca.status,ca.root_cause "rootCause",ca.immediate_action "immediateAction",ca.corrective_action "correctiveAction",ca.preventive_action "preventiveAction",ca.created_at "createdAt",ca.closed_at "closedAt",ca.source_type "sourceType",ca.source_id "sourceId",ca.source_check_code "sourceCheckCode",ca.requires_external_service "requiresExternalService",ca.service_category "serviceCategory" FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1`;
    queryParams = [params.action_id];
  } else if (['org_admin', 'owner'].includes(auth.role)) {
    queryText = `SELECT ca.id,ca.outlet_id "outletId",ca.title,ca.description,ca.severity,ca.priority,ca.assigned_to "assignedTo",ca.due_date "dueDate",ca.status,ca.root_cause "rootCause",ca.immediate_action "immediateAction",ca.corrective_action "correctiveAction",ca.preventive_action "preventiveAction",ca.created_at "createdAt",ca.closed_at "closedAt",ca.source_type "sourceType",ca.source_id "sourceId",ca.source_check_code "sourceCheckCode",ca.requires_external_service "requiresExternalService",ca.service_category "serviceCategory" FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1 AND o.organisation_id=$2`;
    queryParams = [params.action_id, auth.organisationId];
  } else {
    queryText = `SELECT ca.id,ca.outlet_id "outletId",ca.title,ca.description,ca.severity,ca.priority,ca.assigned_to "assignedTo",ca.due_date "dueDate",ca.status,ca.root_cause "rootCause",ca.immediate_action "immediateAction",ca.corrective_action "correctiveAction",ca.preventive_action "preventiveAction",ca.created_at "createdAt",ca.closed_at "closedAt",ca.source_type "sourceType",ca.source_id "sourceId",ca.source_check_code "sourceCheckCode",ca.requires_external_service "requiresExternalService",ca.service_category "serviceCategory" FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1 AND ca.outlet_id=$2 AND o.organisation_id=$3`;
    queryParams = [params.action_id, auth.outletId, auth.organisationId];
  }

  const row = (await query<any>(queryText, queryParams))[0];
  if (!row) return fail('NOT_FOUND', 'Corrective action not found', 404);
  const verifications = await query<any>(`SELECT av.id,av.result,av.notes,av.verification_method "verificationMethod",av.verified_at "verifiedAt",u.name "verifiedBy" FROM action_verifications av LEFT JOIN users u ON u.id=av.verified_by WHERE av.corrective_action_id=$1 ORDER BY av.verified_at DESC`, [params.action_id]);
  return ok({ ...row, verifications });
}

export async function PATCH(req: Request, { params }: { params: { action_id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'actions:write')) return fail('FORBIDDEN', 'You do not have permission to update corrective actions', 403);
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant corrective actions', 403);
  }

  let b: any;
  try {
    b = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  const allowed = [
    'assigned_to', 'due_date', 'root_cause', 'immediate_action',
    'corrective_action', 'preventive_action', 'status',
    'requires_external_service', 'service_category'
  ];

  if (Object.keys(b || {}).some(k => !allowed.includes(k))) {
    return fail('VALIDATION_ERROR', 'Unsupported action field', 400);
  }

  // Guard against client-side bypass of server verification workflow
  if (b.status !== undefined) {
    if (b.status === 'closed') {
      return fail(
        'INVALID_TRANSITION',
        'Status "closed" cannot be set via general update endpoint. Server-authoritative manager verification is required.',
        400
      );
    }
    if (b.status === 'awaiting_verification') {
      return fail(
        'INVALID_TRANSITION',
        'Status "awaiting_verification" cannot be set via general update endpoint. Submit for verification via the dedicated endpoint.',
        400
      );
    }
    const allowedStatuses = ['open', 'in_progress', 'overdue', 'escalated'];
    if (!allowedStatuses.includes(b.status)) {
      return fail('VALIDATION_ERROR', `Invalid action status: ${b.status}`, 400);
    }
  }

  if (!process.env.DATABASE_URL) {
    const demo = getDemoAction(params.action_id, auth.userId);
    if (!demo) return fail('NOT_FOUND', 'Corrective action not found', 404);

    if (demo.organisationId && auth.organisationId && demo.organisationId !== auth.organisationId && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
      return fail('FORBIDDEN', 'Action access denied: organisation mismatch', 403);
    }

    const isOrgOrAdmin = ['platform_admin', 'admin', 'superadmin', 'org_admin', 'owner'].includes(auth.role);
    if (!isOrgOrAdmin && demo.outletId && auth.outletId && demo.outletId !== auth.outletId) {
      return fail('FORBIDDEN', 'Action access denied for your outlet', 403);
    }

    if (demo.status === 'closed') {
      return fail('INVALID_STATE', 'Closed corrective action cannot be modified', 409);
    }

    const patch: any = {};
    if (b.status !== undefined) patch.status = b.status;
    if (b.assigned_to !== undefined) patch.assignedTo = b.assigned_to;
    if (b.due_date !== undefined) patch.dueDate = b.due_date;
    if (b.root_cause !== undefined) patch.rootCause = b.root_cause;
    if (b.immediate_action !== undefined) patch.immediateAction = b.immediate_action;
    if (b.corrective_action !== undefined) patch.correctiveAction = b.corrective_action;
    if (b.preventive_action !== undefined) patch.preventiveAction = b.preventive_action;
    if (b.requires_external_service !== undefined) patch.requiresExternalService = b.requires_external_service;
    if (b.service_category !== undefined) patch.serviceCategory = b.service_category;

    const updated = updateDemoAction(params.action_id, patch, auth.userId);
    return ok({ ...updated, demo: true });
  }

  const action = (await query<any>(
    `SELECT ca.id, ca.status, ca.outlet_id, o.organisation_id 
     FROM corrective_actions ca 
     JOIN outlets o ON o.id = ca.outlet_id 
     WHERE ca.id = $1`,
    [params.action_id]
  ))[0];

  if (!action) return fail('NOT_FOUND', 'Corrective action not found', 404);

  if (action.organisation_id !== auth.organisationId && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Action access denied: organisation mismatch', 403);
  }

  const isOrgOrAdmin = ['platform_admin', 'admin', 'superadmin', 'org_admin', 'owner'].includes(auth.role);
  if (!isOrgOrAdmin && action.outlet_id !== auth.outletId) {
    return fail('FORBIDDEN', 'Action access denied: outlet mismatch', 403);
  }

  if (action.status === 'closed') {
    return fail('INVALID_STATE', 'Closed corrective action cannot be modified', 409);
  }

  const sets: string[] = [];
  const vals: any[] = [params.action_id];
  let n = 2;
  for (const k of allowed) {
    if (b[k] !== undefined) {
      if (k === 'status') {
        sets.push(`${k}=$${n++}::action_status`);
      } else {
        sets.push(`${k}=$${n++}`);
      }
      vals.push(b[k]);
    }
  }

  if (!sets.length) return fail('VALIDATION_ERROR', 'No fields to update', 400);

  const row = (await query<any>(
    `UPDATE corrective_actions 
     SET ${sets.join(', ')} 
     WHERE id = $1 
     RETURNING id, status, assigned_to "assignedTo", due_date "dueDate", 
               root_cause "rootCause", immediate_action "immediateAction", 
               corrective_action "correctiveAction", preventive_action "preventiveAction", 
               requires_external_service "requiresExternalService", service_category "serviceCategory"`,
    vals
  ))[0];

  await query(
    `INSERT INTO audit_logs(id, organisation_id, user_id, entity_type, entity_id, action, new_value) 
     VALUES(gen_random_uuid(), $1, $2, 'corrective_action', $3, 'updated', $4)`,
    [auth.organisationId, auth.userId, params.action_id, JSON.stringify(b)]
  );

  return ok(row);
}

