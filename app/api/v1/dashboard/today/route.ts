import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { requireOutletAccess } from '@/lib/tenant';
import {query} from '@/lib/db'; import {demo} from '@/lib/demo'; import {ok,fail} from '@/lib/response';
export async function GET(req:Request){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401);
 if(!can(auth.role,'dashboard:read'))return fail('FORBIDDEN','Dashboard access denied',403);
 const outletId=new URL(req.url).searchParams.get('outlet_id')||auth.outletId;
 const access=await requireOutletAccess(outletId); if(!access.ok)return fail(access.status===401?'UNAUTHENTICATED':access.status===403?'FORBIDDEN':'NOT_FOUND',access.message,access.status);
 if(!process.env.DATABASE_URL)return ok(demo.dashboard);
 try{
  const outlet=(await query<any>(`SELECT id,name FROM outlets WHERE id=$1 AND organisation_id=$2 AND status='active'`,[outletId,auth.organisationId]))[0]; if(!outlet)return fail('NOT_FOUND','Outlet not found',404);
  const checks=(await query<any>(`SELECT count(*)::int total,count(*) FILTER(WHERE status IN ('completed','verified'))::int completed,count(*) FILTER(WHERE status IN ('not_started','in_progress'))::int pending FROM check_instances WHERE outlet_id=$1 AND started_at::date=current_date`,[outletId]))[0];
  const issues=(await query<any>(`SELECT count(*)::int open,count(*) FILTER(WHERE severity IN ('high','critical'))::int high_priority FROM observations WHERE outlet_id=$1 AND status IN ('open','linked')`,[outletId]))[0];
  const actions=(await query<any>(`SELECT count(*)::int open,count(*) FILTER(WHERE status IN ('overdue','escalated') OR due_date<current_date AND status NOT IN ('closed'))::int overdue FROM corrective_actions WHERE outlet_id=$1 AND status NOT IN ('closed')`,[outletId]))[0];
  const docs=(await query<any>(`SELECT count(*)::int expiring_soon FROM documents WHERE outlet_id=$1 AND expiry_date BETWEEN current_date AND current_date+interval '30 days'`,[outletId]))[0];
  const responses=(await query<any>(`SELECT count(*) FILTER(WHERE cr.status IN ('pass','na'))::int good,count(*) FILTER(WHERE cr.status='warning')::int warning,count(*) FILTER(WHERE cr.status='fail')::int fail FROM check_responses cr JOIN check_instances ci ON ci.id=cr.check_instance_id WHERE ci.outlet_id=$1 AND ci.started_at::date=current_date`,[outletId]))[0];
  const evaluated=(responses.good||0)+(responses.warning||0)+(responses.fail||0); const value=evaluated?Math.round((responses.good/evaluated)*100):null;
  const label=(issues.high_priority>0||actions.overdue>0||responses.fail>0)?'ACTION REQUIRED':(issues.open>0||actions.open>0||responses.warning>0||docs.expiring_soon>0)?'ATTENTION':'GOOD';
  let insight:string|undefined;
  if(responses.fail>0) insight=`${responses.fail} response${responses.fail===1?'':'s'} require corrective action.`;
  else if(actions.overdue>0) insight=`${actions.overdue} corrective action${actions.overdue===1?' is':'s are'} overdue.`;
  else if(issues.open>0) insight=`${issues.open} food-safety issue${issues.open===1?' is':'s are'} open.`;
  return ok({outlet,status:{value,label,metric:'Internal control coverage; not an FSSAI Hygiene Rating'},checks,issues,actions,documents:docs,insight,responses});
 }catch(e:any){return fail('INTERNAL_ERROR',e.message||'Unable to load dashboard',500)}
}
