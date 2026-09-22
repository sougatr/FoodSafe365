import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { ok, fail } from '@/lib/response';
import { listDemoActions } from '@/lib/demo-store'; import {listDemoMonitoring} from '@/lib/demo-monitoring'; import {getDemoPlan} from '@/lib/demo-haccp';
export async function GET(){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401); if(!can(auth.role,'actions:read'))return fail('FORBIDDEN','You do not have permission to view records',403);
 const actions=listDemoActions(auth.userId); const monitoring=listDemoMonitoring(); const plan=getDemoPlan(); const today=new Date(); const day=(n:number)=>new Date(today.getTime()-n*86400000).toISOString().slice(0,10);
 const checks=[{id:'demo-check-1',date:day(0),area:'Kitchen',template:'Daily Food Safety Check',completedBy:auth.userId,result:'attention',issues:1},{id:'demo-check-2',date:day(1),area:'Storage',template:'Daily Food Safety Check',completedBy:auth.userId,result:'good',issues:0},{id:'demo-check-3',date:day(2),area:'Preparation',template:'Daily Food Safety Check',completedBy:auth.userId,result:'good',issues:0}];
 const timeline=actions.flatMap((action,i)=>[{id:`evt-${i}-1`,at:action.createdAt,type:'Corrective action opened',detail:action.title,status:action.status},...(action.status==='awaiting_verification'?[{id:`evt-${i}-2`,at:new Date().toISOString(),type:'Correction submitted',detail:'Corrective action submitted for independent verification.',status:'awaiting_verification'}]:[]),...(action.status==='closed'?[{id:`evt-${i}-2`,at:action.closedAt||new Date().toISOString(),type:'Correction verified',detail:'Verification completed and action closed.',status:'closed'}]:[])]);
 return ok({demo:true,outlet:{id:auth.outletId,name:'ABC Restaurant'},checks,actions,timeline,monitoring,summary:{checksRecorded:checks.length,issues:actions.length,openActions:actions.filter(a=>a.status!=='closed').length,closedActions:actions.filter(a=>a.status==='closed').length,monitoringRecords:monitoring.length}});
}
