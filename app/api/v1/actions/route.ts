import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query, getPool } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { createDemoAction, listDemoActions } from '@/lib/demo-store';
import { requireOutletAccess } from '@/lib/tenant';

let tableChecked = false;
async function ensureColumns() {
  if (tableChecked) return;
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(`
      ALTER TABLE corrective_actions ADD COLUMN IF NOT EXISTS requires_external_service boolean DEFAULT false;
      ALTER TABLE corrective_actions ADD COLUMN IF NOT EXISTS service_category text NULL;
      ALTER TABLE corrective_actions ADD COLUMN IF NOT EXISTS source_check_code text NULL;
    `);
    tableChecked = true;
  } catch (e) {
    console.warn('[actions API] Migration check warning:', e);
  }
}

export async function GET(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'actions:read')) return fail('FORBIDDEN', 'You do not have permission to view corrective actions', 403);

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const requestedOutlet = url.searchParams.get('outletId');

  let targetOutletId = auth.outletId;
  if (requestedOutlet && requestedOutlet !== 'all') {
    const access = await requireOutletAccess(requestedOutlet, req);
    if (!access.ok) {
      return fail('FORBIDDEN', access.message, access.status);
    }
    targetOutletId = requestedOutlet;
  }

  if (!process.env.DATABASE_URL) {
    const all = listDemoActions(auth.userId);
    const scoped = targetOutletId ? all.filter(a => !a.outletId || a.outletId === targetOutletId) : all;
    const visible = status ? scoped.filter(a => a.status === status) : scoped;
    const counts = {
      open: scoped.filter(a => a.status === 'open').length,
      inProgress: scoped.filter(a => a.status === 'in_progress').length,
      awaitingVerification: scoped.filter(a => a.status === 'awaiting_verification').length,
      overdue: scoped.filter(a => a.status === 'overdue' || a.status === 'escalated').length,
      closed: scoped.filter(a => a.status === 'closed').length,
      total: scoped.length
    };
    return ok({ actions: visible, counts, demo: true });
  }

  await ensureColumns();

  const params: any[] = [targetOutletId];
  let where = `ca.outlet_id = $1`;
  if (status) {
    params.push(status);
    where += ` AND ca.status = $2`;
  }

  const rows = await query<any>(`
    SELECT 
      ca.id,
      ca.outlet_id "outletId",
      ca.title,
      ca.description,
      ca.severity,
      ca.priority,
      ca.assigned_to "assignedTo",
      ca.due_date "dueDate",
      ca.status,
      ca.root_cause "rootCause",
      ca.immediate_action "immediateAction",
      ca.corrective_action "correctiveAction",
      ca.preventive_action "preventiveAction",
      ca.created_at "createdAt",
      ca.closed_at "closedAt",
      ca.source_type "sourceType",
      ca.source_id "sourceId",
      ca.source_check_code "sourceCheckCode",
      ca.requires_external_service "requiresExternalService",
      ca.service_category "serviceCategory",
      o.id observation_id 
    FROM corrective_actions ca 
    LEFT JOIN observations o ON o.id = ca.source_id 
    WHERE ${where} 
    ORDER BY 
      CASE ca.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, 
      ca.due_date NULLS LAST, 
      ca.created_at DESC
  `, params);

  const counts = (await query<any>(`
    SELECT 
      count(*) FILTER (WHERE status = 'open')::int open,
      count(*) FILTER (WHERE status = 'in_progress')::int "inProgress",
      count(*) FILTER (WHERE status = 'awaiting_verification')::int "awaitingVerification",
      count(*) FILTER (WHERE status IN ('overdue', 'escalated') OR (due_date < current_date AND status NOT IN ('closed')))::int overdue,
      count(*) FILTER (WHERE status = 'closed')::int closed,
      count(*)::int total 
    FROM corrective_actions 
    WHERE outlet_id = $1
  `, [targetOutletId]))[0];

  return ok({ actions: rows, counts });
}

export async function POST(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'actions:write')) return fail('FORBIDDEN', 'You do not have permission to create corrective actions', 403);

  let b: any;
  try {
    b = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  const title = String(b?.title || '').trim();
  const description = String(b?.description || '').trim();
  const targetOutletId = b?.outletId || auth.outletId;

  if (targetOutletId && targetOutletId !== auth.outletId) {
    const access = await requireOutletAccess(targetOutletId, req);
    if (!access.ok) {
      return fail('FORBIDDEN', access.message, access.status);
    }
  }

  const severity = ['low', 'moderate', 'high', 'critical'].includes(b?.severity) ? b.severity : 'high';
  const priority = ['low', 'medium', 'high', 'critical'].includes(b?.priority) ? b.priority : (severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium');
  const immediateAction = b?.immediateAction ? String(b.immediateAction).trim() : null;
  const correctiveAction = b?.correctiveAction ? String(b.correctiveAction).trim() : null;
  const rootCause = b?.rootCause ? String(b.rootCause).trim() : null;
  const sourceCheckCode = b?.sourceCheckCode || b?.checkCode || null;
  const requiresExternalService = Boolean(b?.requiresExternalService);
  const serviceCategory = b?.serviceCategory ? String(b.serviceCategory).trim() : null;
  const sourceType = b?.sourceType || 'manual';
  const dueDate = b?.dueDate || null;
  const assignedTo = b?.assignedTo || auth.userId;

  if (!title || !description) {
    return fail('VALIDATION_ERROR', 'title and description are required', 400);
  }

  if (!process.env.DATABASE_URL) {
    const action = createDemoAction({
      title,
      description,
      severity,
      priority,
      assignedTo,
      dueDate,
      status: 'open',
      sourceType,
      sourceId: sourceCheckCode,
      sourceCheckCode,
      immediateAction,
      correctiveAction,
      rootCause,
      outletId: targetOutletId,
      requiresExternalService,
      serviceCategory,
      responsiblePerson: b?.responsiblePerson || 'Duty Supervisor / Manager'
    }, auth.userId);
    return ok({ ...action, demo: true }, 201);
  }

  await ensureColumns();

  const row = (await query<any>(`
    INSERT INTO corrective_actions(
      id, outlet_id, source_type, source_id, title, description, 
      severity, priority, assigned_to, due_date, status, 
      immediate_action, corrective_action, root_cause, 
      source_check_code, requires_external_service, service_category, created_at
    )
    VALUES(
      gen_random_uuid(), $1, $2, NULL, $3, $4, 
      $5, $6, $7, $8, 'open', 
      $9, $10, $11, 
      $12, $13, $14, now()
    )
    RETURNING 
      id, outlet_id "outletId", title, description, severity, priority, 
      assigned_to "assignedTo", due_date "dueDate", status, 
      immediate_action "immediateAction", corrective_action "correctiveAction", root_cause "rootCause",
      source_check_code "sourceCheckCode", requires_external_service "requiresExternalService", service_category "serviceCategory",
      created_at "createdAt", source_type "sourceType", source_id "sourceId"
  `, [
    targetOutletId, sourceType, title, description,
    severity, priority, auth.userId, dueDate,
    immediateAction, correctiveAction, rootCause,
    sourceCheckCode, requiresExternalService, serviceCategory
  ]))[0];

  try {
    await query(`INSERT INTO restaurant_activity(id,organisation_id,outlet_id,user_id,event_type,entity_type,entity_id) VALUES(gen_random_uuid(),$1,$2,$3,'action_created','corrective_action',$4)`, [auth.organisationId, targetOutletId, auth.userId, row.id]);
    await query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) VALUES(gen_random_uuid(),$1,$2,'corrective_action',$3,'created',$4)`, [auth.organisationId, auth.userId, row.id, JSON.stringify({ title, source: sourceType, checkCode: sourceCheckCode })]);
  } catch (err) {
    console.warn('[actions API] Non-fatal activity log warning:', err);
  }

  return ok(row, 201);
}
