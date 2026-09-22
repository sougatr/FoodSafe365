import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { getDemoAction, updateDemoAction } from '@/lib/demo-store';

export async function GET(_:Request,{params}:{params:{action_id:string}}){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401);
 if(!can(auth.role,'actions:read'))return fail('FORBIDDEN','You do not have permission to view corrective actions',403);
 if(!process.env.DATABASE_URL){ const demo=getDemoAction(params.action_id,auth.userId); return demo ? ok({...demo,verifications:[],demo:true}) : fail('NOT_FOUND','Corrective action not found',404); }
 const row=(await query<any>(`SELECT ca.id,ca.title,ca.description,ca.severity,ca.priority,ca.assigned_to "assignedTo",ca.due_date "dueDate",ca.status,ca.root_cause "rootCause",ca.immediate_action "immediateAction",ca.corrective_action "correctiveAction",ca.preventive_action "preventiveAction",ca.created_at "createdAt",ca.closed_at "closedAt",ca.source_type "sourceType",ca.source_id "sourceId" FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1 AND ca.outlet_id=$2 AND o.organisation_id=$3`,[params.action_id,auth.outletId,auth.organisationId]))[0];
 if(!row)return fail('NOT_FOUND','Corrective action not found',404);
 const verifications=await query<any>(`SELECT av.id,av.result,av.notes,av.verification_method "verificationMethod",av.verified_at "verifiedAt",u.name "verifiedBy" FROM action_verifications av LEFT JOIN users u ON u.id=av.verified_by WHERE av.corrective_action_id=$1 ORDER BY av.verified_at DESC`,[params.action_id]);
 return ok({...row,verifications});
}

export async function PATCH(req:Request,{params}:{params:{action_id:string}}){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401);
 if(!can(auth.role,'actions:write'))return fail('FORBIDDEN','You do not have permission to update corrective actions',403);
 let b:any;try{b=await req.json()}catch{return fail('VALIDATION_ERROR','Invalid JSON body',400)}
 const allowed=['assigned_to','due_date','root_cause','immediate_action','corrective_action','preventive_action','status'];
 if(Object.keys(b||{}).some(k=>!allowed.includes(k)))return fail('VALIDATION_ERROR','Unsupported action field',400);
 if(!process.env.DATABASE_URL){
  const patch:any = { status: b.status || 'in_progress' };
  if (b.assigned_to !== undefined) patch.assignedTo = b.assigned_to;
  if (b.due_date !== undefined) patch.dueDate = b.due_date;
  if (b.root_cause !== undefined) patch.rootCause = b.root_cause;
  if (b.immediate_action !== undefined) patch.immediateAction = b.immediate_action;
  if (b.corrective_action !== undefined) patch.correctiveAction = b.corrective_action;
  if (b.preventive_action !== undefined) patch.preventiveAction = b.preventive_action;
  const demo=updateDemoAction(params.action_id,patch,auth.userId);
  if(!demo)return fail('NOT_FOUND','Corrective action not found',404);
  return ok({...demo,demo:true});
 }
 const action=(await query<any>(`SELECT ca.id,ca.status,o.organisation_id FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1 AND ca.outlet_id=$2`,[params.action_id,auth.outletId]))[0];
 if(!action)return fail('NOT_FOUND','Corrective action not found',404); if(action.organisation_id!==auth.organisationId)return fail('FORBIDDEN','Action access denied',403);
 const sets:string[]=[];const vals:any[]=[params.action_id];let n=2;
 for(const k of allowed){if(b[k]!==undefined){sets.push(`${k}=$${n++}`);vals.push(b[k]);}}
 if(!sets.length)return fail('VALIDATION_ERROR','No fields to update',400);
 const row=(await query<any>(`UPDATE corrective_actions SET ${sets.join(',')} , closed_at=CASE WHEN status='closed' THEN COALESCE(closed_at,now()) ELSE NULL END WHERE id=$1 RETURNING id,status,assigned_to "assignedTo",due_date "dueDate",root_cause "rootCause",immediate_action "immediateAction",corrective_action "correctiveAction",preventive_action "preventiveAction"`,vals))[0];
 await query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) VALUES(gen_random_uuid(),$1,$2,'corrective_action',$3,'updated',$4)`,[auth.organisationId,auth.userId,params.action_id,JSON.stringify(b)]);
 return ok(row);
}
