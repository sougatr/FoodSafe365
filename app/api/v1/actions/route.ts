import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { createDemoAction, listDemoActions } from '@/lib/demo-store';

export async function GET(req: Request) {
  const auth = await getAuthContext();
  if (!auth) return fail('UNAUTHENTICATED','Authentication required',401);
  if (!can(auth.role,'actions:read')) return fail('FORBIDDEN','You do not have permission to view corrective actions',403);
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  if (!process.env.DATABASE_URL) {
    const all = listDemoActions(auth.userId);
    const visible = status ? all.filter(a=>a.status===status) : all;
    const counts = {
      open: all.filter(a=>a.status==='open').length,
      inProgress: all.filter(a=>a.status==='in_progress').length,
      awaitingVerification: all.filter(a=>a.status==='awaiting_verification').length,
      overdue: all.filter(a=>a.status==='overdue' || a.status==='escalated').length,
      closed: all.filter(a=>a.status==='closed').length,
      total: all.length
    };
    return ok({actions:visible,counts,demo:true});
  }
  const params:any[]=[auth.outletId];
  let where=`ca.outlet_id=$1`;
  if(status){params.push(status);where+=` AND ca.status=$2`;}
  const rows=await query<any>(`SELECT ca.id,ca.title,ca.description,ca.severity,ca.priority,ca.assigned_to "assignedTo",ca.due_date "dueDate",ca.status,ca.root_cause "rootCause",ca.immediate_action "immediateAction",ca.corrective_action "correctiveAction",ca.preventive_action "preventiveAction",ca.created_at "createdAt",ca.closed_at "closedAt",ca.source_type "sourceType",ca.source_id "sourceId",o.id observation_id FROM corrective_actions ca LEFT JOIN observations o ON o.id=ca.source_id WHERE ${where} ORDER BY CASE ca.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, ca.due_date NULLS LAST, ca.created_at DESC`,params);
  const counts=(await query<any>(`SELECT count(*) FILTER(WHERE status='open')::int open,count(*) FILTER(WHERE status='in_progress')::int "inProgress",count(*) FILTER(WHERE status='awaiting_verification')::int "awaitingVerification",count(*) FILTER(WHERE status IN ('overdue','escalated') OR (due_date<current_date AND status NOT IN ('closed')))::int overdue,count(*) FILTER(WHERE status='closed')::int closed,count(*)::int total FROM corrective_actions WHERE outlet_id=$1`,[auth.outletId]))[0];
  return ok({actions:rows,counts});
}

export async function POST(req: Request) {
  const auth = await getAuthContext();
  if (!auth) return fail('UNAUTHENTICATED','Authentication required',401);
  if (!can(auth.role,'actions:write')) return fail('FORBIDDEN','You do not have permission to create corrective actions',403);
  let b:any;
  try { b=await req.json(); } catch { return fail('VALIDATION_ERROR','Invalid JSON body',400); }
  const title=String(b?.title||'').trim();
  const description=String(b?.description||'').trim();
  const severity=['low','moderate','high','critical'].includes(b?.severity)?b.severity:'high';
  const priority=['low','medium','high','critical'].includes(b?.priority)?b.priority:(severity==='critical'?'critical':severity==='high'?'high':'medium');
  if(!title||!description) return fail('VALIDATION_ERROR','title and description are required',400);
  if(!process.env.DATABASE_URL){
    const action=createDemoAction({title,description,severity,priority,assignedTo:auth.userId,dueDate:b?.dueDate,status:'open',sourceType:b?.sourceType||'manual'},auth.userId);
    return ok({...action,demo:true},201);
  }
  const dueDate=b?.dueDate||null;
  const row=(await query<any>(`INSERT INTO corrective_actions(id,outlet_id,source_type,source_id,title,description,severity,priority,assigned_to,due_date,status,created_at)
    VALUES(gen_random_uuid(),$1,'manual',NULL,$2,$3,$4,$5,$6,$7,'open',now())
    RETURNING id,title,description,severity,priority,assigned_to "assignedTo",due_date "dueDate",status,created_at "createdAt",source_type "sourceType",source_id "sourceId"`,
    [auth.outletId,title,description,severity,priority,auth.userId,dueDate]))[0];
  await query(`INSERT INTO restaurant_activity(id,organisation_id,outlet_id,user_id,event_type,entity_type,entity_id) VALUES(gen_random_uuid(),$1,$2,$3,'action_created','corrective_action',$4)`,[auth.organisationId,auth.outletId,auth.userId,row.id]);
  await query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) VALUES(gen_random_uuid(),$1,$2,'corrective_action',$3,'created',$4)`,[auth.organisationId,auth.userId,row.id,JSON.stringify({title,source:'sprint19_recommended_check'})]);
  return ok(row,201);
}
