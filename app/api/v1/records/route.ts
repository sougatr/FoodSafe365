import { getAuthContext } from '../../../../lib/auth';
import { can } from '../../../../lib/permissions';
import { query } from '../../../../lib/db';
import { ok, fail } from '../../../../lib/response';
import { requireOutletAccess } from '../../../../lib/tenant';
import { listDemoActions } from '../../../../lib/demo-store';
import { listDemoMonitoring } from '../../../../lib/demo-monitoring';
import { getDemoPlan } from '../../../../lib/demo-haccp';

export async function GET(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  if (!can(auth.role, 'records:read') && !can(auth.role, 'actions:read')) {
    return fail('FORBIDDEN', 'You do not have permission to view records', 403);
  }

  if (
    auth.journey &&
    auth.journey !== 'restaurant' &&
    auth.journey !== 'platform' &&
    !['platform_admin', 'admin', 'superadmin'].includes(auth.role)
  ) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant records', 403);
  }

  const url = new URL(req.url);
  const requestedOutlet = url.searchParams.get('outlet_id') || url.searchParams.get('outletId') || auth.outletId;

  if (requestedOutlet) {
    const access = await requireOutletAccess(requestedOutlet, req);
    if (!access.ok) {
      return fail((access as any).code || 'FORBIDDEN', access.message, access.status);
    }
  }

  const targetOutletId = requestedOutlet || auth.outletId;

  if (!process.env.DATABASE_URL) {
    const actions = listDemoActions(auth.userId).filter(a => !a.outletId || a.outletId === targetOutletId);
    const monitoring = listDemoMonitoring().filter(m => !m.outletId || m.outletId === targetOutletId);
    const plan = getDemoPlan();
    const today = new Date();
    const day = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);
    const checks = [
      { id: 'demo-check-1', date: day(0), area: 'Kitchen', template: 'Daily Food Safety Check', completedBy: auth.userId, result: 'attention', issues: 1, time: new Date().toISOString() },
      { id: 'demo-check-2', date: day(1), area: 'Storage', template: 'Daily Food Safety Check', completedBy: auth.userId, result: 'good', issues: 0, time: day(1) },
      { id: 'demo-check-3', date: day(2), area: 'Preparation', template: 'Daily Food Safety Check', completedBy: auth.userId, result: 'good', issues: 0, time: day(2) }
    ];
    const timeline = actions.flatMap((action, i) => [
      { id: `evt-${i}-1`, at: action.createdAt, type: 'Corrective action opened', detail: action.title, status: action.status },
      ...(action.status === 'awaiting_verification' ? [{ id: `evt-${i}-2`, at: new Date().toISOString(), type: 'Correction submitted', detail: 'Corrective action submitted for independent verification.', status: 'awaiting_verification' }] : []),
      ...(action.status === 'closed' ? [{ id: `evt-${i}-3`, at: action.closedAt || new Date().toISOString(), type: 'Correction verified', detail: 'Verification completed and action closed.', status: 'closed' }] : [])
    ]);

    return ok({
      demo: true,
      outlet: { id: targetOutletId, name: 'ABC Restaurant' },
      checks,
      actions,
      timeline,
      monitoring,
      plan,
      summary: {
        checksRecorded: checks.length,
        issues: actions.length,
        openActions: actions.filter(a => a.status !== 'closed').length,
        closedActions: actions.filter(a => a.status === 'closed').length,
        monitoringRecords: monitoring.length
      }
    });
  }

  try {
    const [outletRows, checkRows, actionRows, auditRows, monitoringRows] = await Promise.all([
      query<any>(`SELECT id, name FROM outlets WHERE id = $1 LIMIT 1`, [targetOutletId]),
      query<any>(`
        SELECT 
          cr.id as id,
          ci.id as check_instance_id,
          ci.started_at::date::text as date,
          cr.responded_at as time,
          r.domain as area,
          ct.name as template,
          COALESCE(u.name, 'Staff') as "completedBy",
          r.rule_code as code,
          r.title as title,
          cr.status as result,
          cr.response_value as value,
          cr.observation as note
        FROM check_responses cr
        JOIN check_instances ci ON ci.id = cr.check_instance_id
        JOIN check_templates ct ON ct.id = ci.check_template_id
        JOIN check_template_items cti ON cti.id = cr.check_template_item_id
        JOIN rules r ON r.id = cti.rule_id
        LEFT JOIN users u ON u.id = cr.responded_by
        WHERE ci.outlet_id = $1
        ORDER BY cr.responded_at DESC
        LIMIT 100
      `, [targetOutletId]),
      query<any>(`
        SELECT 
          ca.id,
          ca.outlet_id as "outletId",
          ca.title,
          ca.description,
          ca.severity,
          ca.priority,
          ca.status,
          ca.source_type as "sourceType",
          ca.source_check_code as "sourceCheckCode",
          ca.created_at as "createdAt",
          ca.closed_at as "closedAt",
          ca.due_date as "dueDate",
          ca.assigned_to as "assignedTo",
          ca.immediate_action as "immediateAction",
          ca.corrective_action as "correctiveAction"
        FROM corrective_actions ca
        WHERE ca.outlet_id = $1
        ORDER BY ca.created_at DESC
        LIMIT 100
      `, [targetOutletId]),
      query<any>(`
        SELECT 
          al.id,
          al.occurred_at as at,
          al.action as type,
          al.entity_type as "entityType",
          al.entity_id as "entityId",
          al.new_value as detail,
          u.name as "userName"
        FROM audit_logs al
        LEFT JOIN users u ON u.id = al.user_id
        WHERE al.organisation_id = $1
        ORDER BY al.occurred_at DESC
        LIMIT 100
      `, [auth.organisationId]),
      query<any>(`
        SELECT 
          mr.id,
          mr.ccp_id as "ccpId",
          mr.observed_value as "observedValue",
          mr.unit,
          mr.within_limit as "withinLimit",
          mr.action_required as "actionRequired",
          mr.observation_time as "createdAt"
        FROM monitoring_records mr
        WHERE mr.outlet_id = $1
        ORDER BY mr.observation_time DESC
        LIMIT 100
      `, [targetOutletId])
    ]);

    const outletName = outletRows[0]?.name || 'Restaurant';

    const timeline = auditRows.map(row => ({
      id: row.id,
      at: row.at,
      type: row.type === 'completed' ? 'Check completed' : row.type === 'verified' ? 'Corrective action verified' : row.type,
      detail: typeof row.detail === 'object' ? JSON.stringify(row.detail) : String(row.detail || row.entityType),
      status: row.type
    }));

    return ok({
      outlet: { id: targetOutletId, name: outletName },
      checks: checkRows,
      actions: actionRows,
      timeline,
      monitoring: monitoringRows,
      summary: {
        checksRecorded: checkRows.length,
        issues: actionRows.length,
        openActions: actionRows.filter(a => a.status !== 'closed').length,
        closedActions: actionRows.filter(a => a.status === 'closed').length,
        monitoringRecords: monitoringRows.length
      }
    });
  } catch (err: any) {
    return fail('DATABASE_ERROR', 'Unable to load records.', 500);
  }
}
