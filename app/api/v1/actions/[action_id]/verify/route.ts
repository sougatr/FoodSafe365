import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query, transaction } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { updateDemoAction } from '@/lib/demo-store';
export async function POST(req:Request,{params}:{params:{action_id:string}}){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401);
 if(!can(auth.role,'actions:verify'))return fail('FORBIDDEN','Only authorised verifiers can verify corrective actions',403);
 let b:any;try{b=await req.json()}catch{return fail('VALIDATION_ERROR','Invalid JSON body',400)}
 if(!['pass','fail','conditional'].includes(b?.result))return fail('VALIDATION_ERROR','result must be pass, fail or conditional',400);
 if(!process.env.DATABASE_URL){ const next=b.result==='pass'?'closed':b.result==='conditional'?'in_progress':'open'; const demo=updateDemoAction(params.action_id,{status:next},auth.userId); if(!demo)return fail('NOT_FOUND','Corrective action not found',404); return ok({actionId:params.action_id,result:b.result,status:demo.status,demo:true}); }
 const action=(await query<any>(`SELECT ca.*,o.organisation_id FROM corrective_actions ca JOIN outlets o ON o.id=ca.outlet_id WHERE ca.id=$1`,[params.action_id]))[0]; if(!action)return fail('NOT_FOUND','Corrective action not found',404); if(action.organisation_id!==auth.organisationId||action.outlet_id!==auth.outletId)return fail('FORBIDDEN','Action access denied',403);
 if(action.status!=='awaiting_verification')return fail('INVALID_STATE','Action must be awaiting verification',409);
 const result=await transaction(async client=>{
   await client.query(`INSERT INTO action_verifications(id,corrective_action_id,verified_by,verification_method,result,notes,verified_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,now())`,[params.action_id,auth.userId,b.verification_method||'system_record_review',b.result,b.notes||null]);
   const next=b.result==='pass'?'closed':b.result==='conditional'?'in_progress':'open';
   const row=(await client.query(`UPDATE corrective_actions SET status=$2,closed_at=CASE WHEN $2='closed' THEN now() ELSE NULL END WHERE id=$1 RETURNING id,status,closed_at`,[params.action_id,next])).rows[0];
   if(b.result==='pass') await client.query(`UPDATE observations SET status='resolved' WHERE id IN (SELECT source_id FROM corrective_actions WHERE id=$1 AND source_type='check_response')`,[params.action_id]);
   if(b.result!=='pass') await client.query(`UPDATE observations SET status='open' WHERE id IN (SELECT source_id FROM corrective_actions WHERE id=$1 AND source_type='check_response')`,[params.action_id]);
   await client.query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) VALUES(gen_random_uuid(),$1,$2,'corrective_action',$3,'verified',$4)`,[auth.organisationId,auth.userId,params.action_id,JSON.stringify({result:b.result,status:next,notes:b.notes||null})]);
   await client.query(`INSERT INTO system_events(id,organisation_id,outlet_id,event_type,entity_type,entity_id,payload,processed,occurred_at) VALUES(gen_random_uuid(),$1,$2,'CORRECTIVE_ACTION_VERIFIED','corrective_action',$3,$4,false,now())`,[auth.organisationId,auth.outletId,params.action_id,JSON.stringify({result:b.result,status:next})]);
   return row;
 });
 return ok({actionId:params.action_id,result:b.result,...result});
}
