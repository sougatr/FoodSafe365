import { getAuthContext } from '../../../../../../lib/auth';
import { can } from '../../../../../../lib/permissions';
import { query, transaction } from '../../../../../../lib/db';
import { ok, fail } from '../../../../../../lib/response';
import { getDemoAction, updateDemoAction } from '../../../../../../lib/demo-store';

export async function POST(req: Request, { params }: { params: { action_id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'actions:verify')) {
    return fail('FORBIDDEN', 'Only authorised verifiers can verify corrective actions', 403);
  }
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant corrective actions', 403);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  let b: any;
  try {
    b = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  if (!['pass', 'fail', 'conditional'].includes(b?.result)) {
    return fail('VALIDATION_ERROR', 'result must be pass, fail or conditional', 400);
  }

  const verificationMethod = b.verification_method || 'system_record_review';
  const notes = b.notes || null;
  const nextStatus = b.result === 'pass' ? 'closed' : b.result === 'conditional' ? 'in_progress' : 'open';

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

    if (demo.status !== 'awaiting_verification') {
      return fail('INVALID_STATE', `Action must be awaiting verification to be verified. Current status: ${demo.status}`, 409);
    }

    const closedAt = nextStatus === 'closed' ? new Date().toISOString() : null;
    const verificationRecord = {
      id: `demo-verif-${Date.now()}`,
      correctiveActionId: params.action_id,
      verifiedBy: auth.userId,
      verificationMethod,
      result: b.result,
      notes,
      verifiedAt: new Date().toISOString()
    };

    const verifications = [...(demo.verifications || []), verificationRecord];
    const updated = updateDemoAction(params.action_id, {
      status: nextStatus,
      closedAt,
      verificationNote: notes,
      verifications
    }, auth.userId);

    return ok({
      actionId: params.action_id,
      result: b.result,
      status: updated?.status,
      closedAt,
      verification: verificationRecord,
      demo: true
    });
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

  if (action.status !== 'awaiting_verification') {
    return fail('INVALID_STATE', `Action must be awaiting verification to be verified. Current status: ${action.status}`, 409);
  }

  const result = await transaction(async client => {
    const verifRes = await client.query(
      `INSERT INTO action_verifications(id, corrective_action_id, verified_by, verification_method, result, notes, verified_at) 
       VALUES(gen_random_uuid(), $1, $2, $3, $4::verification_result, $5, now()) 
       RETURNING id, verified_at`,
      [params.action_id, auth.userId, verificationMethod, b.result, notes]
    );

    const row = (await client.query(
      `UPDATE corrective_actions 
       SET status = $2::action_status, closed_at = CASE WHEN $2::text = 'closed' THEN now() ELSE NULL END 
       WHERE id = $1 
       RETURNING id, status, closed_at`,
      [params.action_id, nextStatus]
    )).rows[0];

    const targetObsStatus = b.result === 'pass' ? 'resolved' : 'open';
    await client.query(
      `UPDATE observations obs
       SET status = $2::observation_status
       FROM corrective_actions ca
       WHERE ca.id = $1
         AND obs.outlet_id = ca.outlet_id
         AND (
           (ca.source_type = 'check_response' AND obs.check_response_id = ca.source_id)
           OR
           (ca.source_type = 'observation' AND obs.id = ca.source_id)
         )`,
      [params.action_id, targetObsStatus]
    );

    await client.query(
      `INSERT INTO audit_logs(id, organisation_id, user_id, entity_type, entity_id, action, new_value) 
       VALUES(gen_random_uuid(), $1, $2, 'corrective_action', $3, 'verified', $4)`,
      [auth.organisationId, auth.userId, params.action_id, JSON.stringify({ result: b.result, status: nextStatus, notes, verificationMethod })]
    );

    await client.query(
      `INSERT INTO system_events(id, organisation_id, outlet_id, event_type, entity_type, entity_id, payload, processed, occurred_at) 
       VALUES(gen_random_uuid(), $1, $2, 'CORRECTIVE_ACTION_VERIFIED', 'corrective_action', $3, $4, false, now())`,
      [auth.organisationId, auth.outletId, params.action_id, JSON.stringify({ result: b.result, status: nextStatus })]
    );

    return { ...row, verificationId: verifRes.rows[0]?.id, verifiedAt: verifRes.rows[0]?.verified_at };
  });

  return ok({ actionId: params.action_id, result: b.result, ...result });
}

