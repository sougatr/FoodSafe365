import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { requireOutletAccess } from '@/lib/tenant';
import { query, transaction } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { getRuleProfile } from '@/lib/food-safety-engine';
import { applicable } from '@/lib/rule-applicability';
import { randomUUID } from 'crypto';

export async function POST(_:Request,{params}:{params:{check_id:string}}){
  const auth=await getAuthContext();
  if(!auth) return fail('UNAUTHENTICATED','Authentication required',401);
  if(!can(auth.role,'checks:write')) return fail('FORBIDDEN','You do not have permission to start checks',403);
  if(!process.env.DATABASE_URL) return ok({checkId:params.check_id,status:'in_progress',startedAt:new Date().toISOString(),demo:true});
  try{
    const base=(await query<any>(`SELECT ci.*,o.id outlet_id FROM check_instances ci JOIN outlets o ON o.id=ci.outlet_id WHERE ci.id=$1`,[params.check_id]))[0];
    if(!base) return fail('NOT_FOUND','Check not found',404);
    const access=await requireOutletAccess(base.outlet_id); if(!access.ok) return fail(access.status===401?'UNAUTHENTICATED':access.status===403?'FORBIDDEN':'NOT_FOUND',access.message,access.status);
    if(base.status==='completed'||base.status==='verified') return ok({checkId:base.id,status:base.status,startedAt:base.started_at});
    if(base.status==='cancelled') return fail('INVALID_STATE','Cancelled checks cannot be started',409);
    const result=await transaction(async client=>{
      await client.query(`UPDATE check_instances SET status='in_progress',started_at=COALESCE(started_at,now()),assigned_to=COALESCE(assigned_to,$2) WHERE id=$1`,[params.check_id,auth.userId]);
      await client.query(`INSERT INTO restaurant_activity(id,organisation_id,outlet_id,user_id,event_type,entity_type,entity_id) VALUES(gen_random_uuid(),$1,$2,$3,'check_started','check',$4)`,[auth.organisationId,base.outlet_id,auth.userId,params.check_id]);
      await client.query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) VALUES(gen_random_uuid(),$1,$2,'check',$3,'started',$4)`,[auth.organisationId,auth.userId,params.check_id,JSON.stringify({status:'in_progress'})]);
      return (await client.query(`SELECT id,status,started_at,completion_percentage FROM check_instances WHERE id=$1`,[params.check_id])).rows[0];
    });
    return ok(result);
  }catch(e:any){return fail(e.code||'INTERNAL_ERROR',e.message||'Unable to start check',e.code==='INVALID_STATE'?409:500)}
}
