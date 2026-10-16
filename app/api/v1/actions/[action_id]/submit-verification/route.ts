import { getAuthContext } from '../../../../../../lib/auth';
import { can } from '../../../../../../lib/permissions';
import { query } from '../../../../../../lib/db';
import { ok, fail } from '../../../../../../lib/response';
import { getDemoAction, updateDemoAction } from '../../../../../../lib/demo-store';

export async function POST(req: Request, { params }: { params: { action_id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'actions:write')) {
    return fail('FORBIDDEN', 'You do not have permission to submit actions for verification', 403);
  }
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant corrective actions', 403);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  let b: any = {};
  try {
    const text = await req.text();
    if (text) b = JSON.parse(text);
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  const patchFields: any = {};
  if (b.immediate_action !== undefined) patchFields.immediateAction = b.immediate_action;
  if (b.corrective_action !== undefined) patchFields.correctiveAction = b.corrective_action;
  if (b.root_cause !== undefined) patchFields.rootCause = b.root_cause;

  if (!process.env.DATABASE_URL) {
    const demo = getDemoAction(params.action_id, auth.userId);
    if (!demo) return fail('NOT_FOUND', 'Corrective action not found', 404);

    if (demo.organisationId && auth.organisationId && demo.organisationId !== auth.organisationId && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
      return fail('FORBIDDEN', 'Action access denied: organisation mismatch', 403);
    }

    const isOrgOrAdmin = ['platform_admin', 'admin', 'superadmin', 'org_admin', 'owner'].includes(auth.role);
    if (!isOrgOrAdmin && demo.outletId && auth.outletId && demo.outletId !== auth.outletId) {
      return fail('FORBIDDEN', 'Action access denied: outlet mismatch', 403);
    }

    if (!['open', 'in_progress', 'overdue', 'escalated'].includes(demo.status)) {
      return fail('INVALID_STATE', `Action in status ${demo.status} cannot be submitted for verification`, 409);
    }

    const updated = updateDemoAction(params.action_id, {
      status: 'awaiting_verification',
      ...patchFields
    }, auth.userId);

    return ok({ actionId: params.action_id, status: updated?.status, demo: true });
  }

  const action = (await query<any>(
    `SELECT ca.*, o.organisation_id 
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

  if (!['open', 'in_progress', 'overdue', 'escalated'].includes(action.status)) {
    return fail('INVALID_STATE', `Action in status ${action.status} cannot be submitted for verification`, 409);
  }

  const sets = [`status = 'awaiting_verification'::action_status`];
  const vals: any[] = [params.action_id];
  let n = 2;
  if (b.immediate_action !== undefined) {
    sets.push(`immediate_action = $${n++}`);
    vals.push(b.immediate_action);
  }
  if (b.corrective_action !== undefined) {
    sets.push(`corrective_action = $${n++}`);
    vals.push(b.corrective_action);
  }
  if (b.root_cause !== undefined) {
    sets.push(`root_cause = $${n++}`);
    vals.push(b.root_cause);
  }

  const row = (await query<any>(
    `UPDATE corrective_actions 
     SET ${sets.join(', ')} 
     WHERE id = $1 
     RETURNING id, status, immediate_action "immediateAction", corrective_action "correctiveAction", root_cause "rootCause"`,
    vals
  ))[0];

  await query(
    `INSERT INTO audit_logs(id, organisation_id, user_id, entity_type, entity_id, action, new_value) 
     VALUES(gen_random_uuid(), $1, $2, 'corrective_action', $3, 'submitted_for_verification', $4)`,
    [auth.organisationId, auth.userId, params.action_id, JSON.stringify({ status: 'awaiting_verification', ...b })]
  );

  return ok(row);
}

