import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { requireOutletAccess } from '@/lib/tenant';
import { transaction, query } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { evaluateAndPersistResponse } from '@/lib/food-safety-engine';
import { applicable } from '@/lib/rule-applicability'; import {getDemoPlan} from '@/lib/demo-haccp'; import {addDemoMonitoring} from '@/lib/demo-monitoring'; import {createDemoAction} from '@/lib/demo-store';

export async function POST(req:Request,{params}:{params:{check_id:string}}){
  const auth=await getAuthContext();
  if(!auth) return fail('UNAUTHENTICATED','Authentication required',401);
  if(!can(auth.role,'checks:write')) return fail('FORBIDDEN','You do not have permission to submit check responses',403);
  let body:any; try{body=await req.json();}catch{return fail('VALIDATION_ERROR','Invalid JSON body',400)}
  if(!body?.item_id) return fail('VALIDATION_ERROR','item_id is required',400);
  if(body.response_value===undefined) return fail('VALIDATION_ERROR','response_value is required',400);
  const focusedNumericRules: Record<string, {max?: number; min?: number; unit: string; label: string}> = {
    'demo-focus-storage': {max: 5, unit: '°C', label: 'chilled-storage temperature'},
    'demo-focus-cooking': {min: 70, unit: '°C', label: 'cooking temperature'},
    'demo-focus-cooling': {max: 5, unit: '°C', label: 'cooling checkpoint temperature'},
    'demo-focus-thawing': {max: 5, unit: '°C', label: 'thawing temperature'},
    'demo-focus-reheating': {min: 75, unit: '°C', label: 'reheating core temperature'}
  };
  const numericRule=focusedNumericRules[body.item_id];
  if(body.item_id?.startsWith('demo-focus-')){
    if(!numericRule) return fail('VALIDATION_ERROR','Unknown focused temperature control.',400);
    const n=Number(body.numeric_value ?? body.response_value);
    if(!Number.isFinite(n)) return fail('VALIDATION_ERROR','Enter a valid temperature.',400);
    const within=(numericRule.min===undefined||n>=numericRule.min)&&(numericRule.max===undefined||n<=numericRule.max);
    let actionId:null|string=null;
    if(!within){
      if(!process.env.DATABASE_URL) actionId='demo-action';
      else actionId=createDemoAction({title:`Corrective action: ${numericRule.label} deviation`,description:`Recorded ${numericRule.label} ${n} ${numericRule.unit} is outside the configured reference range. Protect affected food, correct the condition and verify the action.`,severity:'high',priority:'high',sourceType:'check'},auth.userId).id;
    }
    return ok({outcome:within?'GOOD':'ACTION_REQUIRED',responseStatus:within?'pass':'fail',riskLevel:within?'low':'high',responseId:`focused-response-${params.check_id}-${body.item_id}`,observationId:within?null:`focused-observation-${body.item_id}`,correctiveActionId:actionId,explanation:within?`The recorded ${numericRule.label} (${n} ${numericRule.unit}) is within the configured reference range.`:`The recorded ${numericRule.label} (${n} ${numericRule.unit}) is outside the configured reference range.`,nextStep:within?'Measurement recorded. No corrective action required.':'Protect affected food, correct the condition and complete the corrective action before verification.',demo:true});
  }
  if(!process.env.DATABASE_URL){
    if(body.item_id==='demo-ccp-cooking'){
      const ccp=getDemoPlan().ccps.find(c=>c.id==='ccp-1'); const n=Number(body.numeric_value ?? body.response_value);
      if(!ccp?.validationStatus) return fail('INVALID_STATE','Validate the cooking CCP critical limit in HACCP before recording this Daily Check.',409);
      if(!Number.isFinite(n)) return fail('VALIDATION_ERROR','Enter a valid numeric CCP monitoring value.',400);
      const within=(ccp.criticalLimitMin!==undefined?n>=ccp.criticalLimitMin:true)&&(ccp.criticalLimitMax!==undefined?n<=ccp.criticalLimitMax:true); let actionId:null|string=null;
      if(!within){const a=createDemoAction({title:'Corrective action: Cooking CCP deviation',description:`Cooking CCP value ${n} ${ccp.unit} is outside the validated critical limit. Protect affected food and follow the approved corrective-action procedure.`,severity:'high',priority:'high',sourceType:'haccp_monitoring'},auth.userId); actionId=a.id;}
      const rec=addDemoMonitoring({ccpId:'ccp-1',outletId:auth.outletId,recordedBy:auth.userId,observedValue:n,unit:ccp.unit,withinLimit:within,actionRequired:!within,correctiveActionId:actionId});
      return ok({outcome:within?'GOOD':'ACTION_REQUIRED',responseStatus:within?'pass':'fail',riskLevel:within?'low':'high',responseId:`demo-response-${params.check_id}-${body.item_id}`,observationId:within?null:'demo-observation-'+rec.id,correctiveActionId:actionId,explanation:within?'The recorded CCP value is within the validated control limit.':`The recorded CCP value (${n} ${ccp.unit}) is outside the validated control limit.`,nextStep:within?'Monitoring record saved. No corrective action required.':'Protect affected food, correct the process and complete the corrective action before verification.',demo:true,monitoringRecordId:rec.id});
    }
    const value=String(body.response_value).toLowerCase(); const failValue=value==='no'||value==='fail'||value==='true'; const na=value==='na'||value==='not_applicable';
    if(numericRule){
      const n=Number(body.numeric_value ?? body.response_value);
      if(!Number.isFinite(n)) return fail('VALIDATION_ERROR','Enter a valid temperature.',400);
      const within=(numericRule.min===undefined||n>=numericRule.min)&&(numericRule.max===undefined||n<=numericRule.max);
      const actionId=within?null:'demo-action';
      return ok({outcome:within?'GOOD':'ACTION_REQUIRED',responseStatus:within?'pass':'fail',riskLevel:within?'low':'high',responseId:`demo-response-${params.check_id}-${body.item_id}`,observationId:within?null:'demo-observation-'+body.item_id,correctiveActionId:actionId,explanation:within?`The recorded ${numericRule.label} (${n} ${numericRule.unit}) is within the demo reference range.`:`The recorded ${numericRule.label} (${n} ${numericRule.unit}) is outside the demo reference range.`,nextStep:within?'Measurement recorded. No corrective action required.':'Protect affected food, correct the condition and complete the corrective action before verification.',demo:true});
    }
    return ok({outcome:na?'NOT_APPLICABLE':failValue?'ACTION_REQUIRED':'GOOD',responseStatus:na?'na':failValue?'fail':'pass',riskLevel:failValue?'high':'low',responseId:`demo-response-${params.check_id}-${body.item_id}`,observationId:failValue?'demo-observation':null,correctiveActionId:failValue?'demo-action':null,explanation:na?'This check has been marked not applicable.':failValue?'The response triggers the failure condition.':'The response meets the configured rule condition.',nextStep:failValue?'Correct the condition and record the corrective action.':'No further action required for this response.',demo:true});
  }
  try{
    const check=(await query<any>(`SELECT id,outlet_id,status FROM check_instances WHERE id=$1`,[params.check_id]))[0];
    if(!check) return fail('NOT_FOUND','Check not found',404);
    const access=await requireOutletAccess(check.outlet_id); if(!access.ok) return fail(access.status===401?'UNAUTHENTICATED':access.status===403?'FORBIDDEN':'NOT_FOUND',access.message,access.status);
    const result=await transaction(async client=>{
      const evaluated=await evaluateAndPersistResponse(client,{checkId:params.check_id,itemId:body.item_id,responseValue:body.response_value,numericValue:body.numeric_value,temperatureValue:body.temperature_value,userId:auth.userId});
      const profileRows=(await client.query(`SELECT COALESCE((SELECT json_agg(fp.code) FROM outlet_processes op JOIN food_processes fp ON fp.id=op.process_id WHERE op.outlet_id=ci.outlet_id AND op.active=true),'[]') processes,COALESCE((SELECT json_agg(et.code) FROM equipment e JOIN equipment_types et ON et.id=e.equipment_type_id WHERE e.outlet_id=ci.outlet_id AND e.status='active'),'[]') equipment FROM check_instances ci WHERE ci.id=$1`,[params.check_id])).rows[0]||{};
      const itemRows=(await client.query(`SELECT cti.id,cti.required,COALESCE(string_agg(rc.value->>'text',' | '),'') applicability FROM check_template_items cti LEFT JOIN rule_conditions rc ON rc.rule_id=cti.rule_id WHERE cti.check_template_id=(SELECT check_template_id FROM check_instances WHERE id=$1) AND cti.active=true GROUP BY cti.id`,[params.check_id])).rows;
      const profile={processCodes:profileRows.processes||[],equipmentCodes:profileRows.equipment||[]};
      const applicableIds=new Set(itemRows.filter((x:any)=>applicable(x.applicability,profile)).map((x:any)=>x.id));
      const counts=(await client.query(`SELECT COUNT(*) FILTER(WHERE cti.required=true AND cti.id = ANY($2::uuid[])) required_count,COUNT(*) FILTER(WHERE cr.status IS NOT NULL AND cti.required=true AND cti.id = ANY($2::uuid[])) answered_count,COUNT(*) FILTER(WHERE cr.status IN ('fail','warning') AND cti.required=true AND cti.id = ANY($2::uuid[])) issue_count,COUNT(*) FILTER(WHERE cr.status='pass' AND cti.required=true AND cti.id = ANY($2::uuid[])) pass_count FROM check_template_items cti LEFT JOIN check_responses cr ON cr.check_template_item_id=cti.id AND cr.check_instance_id=$1 WHERE cti.check_template_id=(SELECT check_template_id FROM check_instances WHERE id=$1) AND cti.active=true`,[params.check_id,Array.from(applicableIds)])).rows[0];
      const pct=counts.required_count?Math.round(Number(counts.answered_count)/Number(counts.required_count)*100):0;
      const status=Number(counts.answered_count)>=Number(counts.required_count)?'completed':'in_progress';
      await client.query(`UPDATE check_instances SET completion_percentage=$2,status=$3,risk_status=CASE WHEN $4::int>0 THEN 'high' ELSE 'low' END,completed_at=CASE WHEN $3='completed' THEN COALESCE(completed_at,now()) ELSE completed_at END WHERE id=$1`,[params.check_id,pct,status,Number(counts.issue_count)]);
      if(status==='completed'){
        await client.query(`INSERT INTO restaurant_activity(id,organisation_id,outlet_id,user_id,event_type,entity_type,entity_id) SELECT gen_random_uuid(),o.organisation_id,o.id,$2,'check_completed','check',$1 FROM outlets o JOIN check_instances ci ON ci.outlet_id=o.id WHERE ci.id=$1`,[params.check_id,auth.userId]);
        await client.query(`INSERT INTO audit_logs(id,organisation_id,user_id,entity_type,entity_id,action,new_value) SELECT gen_random_uuid(),o.organisation_id,$2,'check',$1,'completed',$3 FROM outlets o JOIN check_instances ci ON ci.outlet_id=o.id WHERE ci.id=$1`,[params.check_id,auth.userId,JSON.stringify({completion_percentage:pct})]);
      }
      return {...evaluated,check:{completionPercentage:pct,status}};
    });
    return ok(result);
  }catch(e:any){return fail(e.code||'INTERNAL_ERROR',e.message||'Unable to submit response',e.code==='NOT_FOUND'?404:e.code==='INVALID_STATE'?409:500)}
}
