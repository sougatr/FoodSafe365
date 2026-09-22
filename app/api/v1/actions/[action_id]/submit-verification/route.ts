import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { updateDemoAction } from '@/lib/demo-store';
export async function POST(_:Request,{params}:{params:{action_id:string}}){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401);
 if(!can(auth.role,'actions:write'))return fail('FORBIDDEN','You do not have permission to submit actions for verification',403);
 if(!process.env.DATABASE_URL){ const demo=updateDemoAction(params.action_id,{status:'awaiting_verification'},auth.userId); if(!demo)return fail('NOT_FOUND','Corrective action not found',404); return ok({actionId:params.action_id,status:demo.status,demo:true}); }
 const action=(await query<any>(`SELECT ca.*,o.organisation_id FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1`,[params.action_id]))[0];
 if(!action)return fail('NOT_FOUND','Corrective action not found',404); if(action.organisation_id!==auth.organisationId||action.outlet_id!==auth.outletId)return fail('FORBIDDEN','Action access denied',403);
 if(!['open','in_progress','overdue','escalated'].includes(action.status))return fail('INVALID_STATE',`Action in status ${action.status} cannot be submitted for verification`,409);
 const row=(await query<any>(`UPDATE corrective_actions SET status='awaiting_verification' WHERE id=$1 RETURNING id,status` ,[params.action_id]))[0];
 await query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) VALUES(gen_random_uuid(),$1,$2,'corrective_action',$3,'submitted_for_verification',$4)`,[auth.organisationId,auth.userId,params.action_id,JSON.stringify({status:'awaiting_verification'})]);
 return ok(row);
}
