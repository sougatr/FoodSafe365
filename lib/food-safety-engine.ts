import { PoolClient } from 'pg';
import { query } from './db';
import { applicable, Profile } from './rule-applicability';

export type EvaluationOutcome='GOOD'|'ATTENTION'|'ACTION_REQUIRED'|'NOT_APPLICABLE'|'NOT_VERIFIED';
export type Evaluation={outcome:EvaluationOutcome;responseStatus:'pass'|'fail'|'warning'|'na';riskLevel:'low'|'moderate'|'high'|'critical';explanation:string;nextStep:string;shouldObserve:boolean;};

type RuleConfig={
  pass_values?:unknown[];
  fail_values?:unknown[];
  warning_values?:unknown[];
  numeric_min?:number;
  numeric_max?:number;
  unit?:string;
  next_step?:string;
};

function same(a:unknown,b:unknown){return JSON.stringify(a)===JSON.stringify(b)}
function normalize(v:unknown){return typeof v==='string'?v.trim().toLowerCase():v}

export async function getRuleProfile(outletId:string):Promise<Profile>{
  const [p,e,r]=await Promise.all([
    query<any>(`SELECT fp.code FROM outlet_processes op JOIN food_processes fp ON fp.id=op.process_id WHERE op.outlet_id=$1 AND op.active=true`,[outletId]),
    query<any>(`SELECT et.code FROM equipment e JOIN equipment_types et ON et.id=e.equipment_type_id WHERE e.outlet_id=$1 AND e.status <> 'retired'`,[outletId]),
    query<any>(`SELECT rt.code FROM outlets o LEFT JOIN restaurant_types rt ON rt.id=o.restaurant_type_id WHERE o.id=$1`,[outletId])
  ]);
  return {processCodes:p.map(x=>x.code),equipmentCodes:e.map(x=>x.code),restaurantType:r[0]?.code};
}

export async function getRuleForResponse(checkTemplateItemId:string){
  const rows=await query<any>(`SELECT r.*, cti.question, cti.response_type, cti.required, cti.evidence_required
    FROM check_template_items cti JOIN rules r ON r.id=cti.rule_id
    WHERE cti.id=$1 AND cti.active=true AND r.active=true`,[checkTemplateItemId]);
  return rows[0]||null;
}

export function evaluateRule(rule:any,responseType:string,responseValue:unknown):Evaluation{
  const value=normalize(responseValue);
  if(responseType==='na'||value==='na'||value===null||value===undefined||value==='not_applicable'){
    return {outcome:'NOT_APPLICABLE',responseStatus:'na',riskLevel:rule.risk_level,explanation:'This check has been marked not applicable.',nextStep:'No action required for this check.',shouldObserve:false};
  }
  let config:RuleConfig={};
  if(rule.evaluation_config){try{config=typeof rule.evaluation_config==='string'?JSON.parse(rule.evaluation_config):rule.evaluation_config;}catch{config={};}}
  if(responseType==='number'||responseType==='temperature'){
    const n=typeof responseValue==='number'?responseValue:Number(responseValue);
    if(!Number.isFinite(n)) return {outcome:'NOT_VERIFIED',responseStatus:'warning',riskLevel:rule.risk_level,explanation:'A numeric value is required for this check.',nextStep:'Enter a valid measured value.',shouldObserve:false};
    if(config.numeric_min===undefined&&config.numeric_max===undefined){
      return {outcome:'NOT_VERIFIED',responseStatus:'warning',riskLevel:rule.risk_level,explanation:'No validated process/product limit is configured for this rule.',nextStep:'Use the restaurant’s validated SOP or HACCP/process limit before deciding whether the value is acceptable.',shouldObserve:false};
    }
    const below=config.numeric_min!==undefined&&n<config.numeric_min;
    const above=config.numeric_max!==undefined&&n>config.numeric_max;
    if(below||above) return {outcome:'ACTION_REQUIRED',responseStatus:'fail',riskLevel:rule.risk_level,explanation:`The recorded value (${n}${config.unit?' '+config.unit:''}) is outside the configured validated control limit.`,nextStep:config.next_step||'Protect affected food, follow the applicable SOP and investigate the cause.',shouldObserve:true};
    return {outcome:'GOOD',responseStatus:'pass',riskLevel:'low',explanation:'The recorded value is within the configured validated control limit.',nextStep:'No further action required for this response.',shouldObserve:false};
  }
  if(config.pass_values?.some(x=>same(normalize(x),value))) return {outcome:'GOOD',responseStatus:'pass',riskLevel:'low',explanation:'The response meets the configured rule condition.',nextStep:'No further action required for this response.',shouldObserve:false};
  if(config.warning_values?.some(x=>same(normalize(x),value))) return {outcome:'ATTENTION',responseStatus:'warning',riskLevel:rule.risk_level,explanation:'The response indicates a condition that needs attention.',nextStep:config.next_step||'Review the condition and correct it according to the applicable SOP.',shouldObserve:true};
  if(config.fail_values?.some(x=>same(normalize(x),value))) return {outcome:'ACTION_REQUIRED',responseStatus:'fail',riskLevel:rule.risk_level,explanation:`The response triggers the failure condition for ${rule.rule_code}.`,nextStep:config.next_step||'Complete the immediate and corrective action specified for this rule.',shouldObserve:true};
  // Default semantics for positive yes/no and pass/fail checks. Rule-specific inversions should be configured in evaluation_config.
  if(value==='yes'||value==='pass'||value===true) return {outcome:'GOOD',responseStatus:'pass',riskLevel:'low',explanation:'The response indicates the control is in place.',nextStep:'No further action required for this response.',shouldObserve:false};
  if(value==='no'||value==='fail'||value===false) return {outcome:'ACTION_REQUIRED',responseStatus:'fail',riskLevel:rule.risk_level,explanation:`The response does not meet the applicable rule condition for ${rule.rule_code}.`,nextStep:config.next_step||'Correct the condition and record the corrective action.',shouldObserve:true};
  return {outcome:'ATTENTION',responseStatus:'warning',riskLevel:rule.risk_level,explanation:'The response requires review before it can be treated as compliant.',nextStep:'Review the applicable rule and restaurant SOP.',shouldObserve:true};
}

export async function evaluateAndPersistResponse(client:PoolClient,args:{checkId:string;itemId:string;responseValue:unknown;numericValue?:number|null;temperatureValue?:number|null;userId:string;}){
  const item=(await client.query(`SELECT cti.*, ci.outlet_id, ci.status check_status, r.rule_code, r.title rule_title, r.description rule_description, r.risk_level, r.evaluation_config, r.active rule_active, cti.ccp_id FROM check_template_items cti JOIN check_instances ci ON ci.check_template_id=cti.check_template_id JOIN rules r ON r.id=cti.rule_id WHERE cti.id=$1 AND ci.id=$2 AND cti.active=true`,[args.itemId,args.checkId])).rows[0];
  if(!item) throw Object.assign(new Error('Check item not found'),{code:'NOT_FOUND'});
  if(item.check_status==='completed'||item.check_status==='verified'||item.check_status==='cancelled') throw Object.assign(new Error('Check is not open for responses'),{code:'INVALID_STATE'});
  if(!item.rule_active) throw Object.assign(new Error('Rule is inactive'),{code:'INVALID_STATE'});
  let evaluation=evaluateRule(item,item.response_type,args.responseValue);
  let ccp:any=null;
  if(item.ccp_id && (item.response_type==='temperature'||item.response_type==='number')){
    ccp=(await client.query(`SELECT id,critical_limit,unit,critical_limit_min,critical_limit_max,validation_status FROM ccps WHERE id=$1 AND haccp_plan_id IN (SELECT id FROM haccp_plans WHERE outlet_id=$2)`,[item.ccp_id,item.outlet_id])).rows[0];
    const n=Number(args.numericValue ?? args.temperatureValue ?? args.responseValue);
    if(!ccp || ccp.validation_status!=='validated' || (ccp.critical_limit_min===null && ccp.critical_limit_max===null)){
      evaluation={outcome:'NOT_VERIFIED',responseStatus:'warning',riskLevel:item.risk_level,explanation:'No validated CCP critical limit is available for this monitoring point.',nextStep:'Validate the CCP limit in the HACCP plan before using this measurement for control decisions.',shouldObserve:false};
    } else if(!Number.isFinite(n)){
      evaluation={outcome:'NOT_VERIFIED',responseStatus:'warning',riskLevel:item.risk_level,explanation:'A numeric CCP monitoring value is required.',nextStep:'Enter a valid measured value.',shouldObserve:false};
    } else {
      const below=ccp.critical_limit_min!==null && n<Number(ccp.critical_limit_min); const above=ccp.critical_limit_max!==null && n>Number(ccp.critical_limit_max);
      const within=!below&&!above;
      evaluation=within?{outcome:'GOOD',responseStatus:'pass',riskLevel:'low',explanation:'The CCP monitoring value is within the validated critical limit.',nextStep:'Record retained. No corrective action required for this response.',shouldObserve:false}:{outcome:'ACTION_REQUIRED',responseStatus:'fail',riskLevel:item.risk_level,explanation:`The CCP monitoring value (${n}${ccp.unit?' '+ccp.unit:''}) is outside the validated critical limit.`,nextStep:'Protect affected food, restore process control and complete the corrective action.',shouldObserve:true};
    }
  }
  const responseId=(await client.query(`INSERT INTO check_responses(id,check_instance_id,check_template_item_id,response_value,numeric_value,temperature_value,status,observation,responded_at,responded_by)
    VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,now(),$8) ON CONFLICT (check_instance_id,check_template_item_id) DO UPDATE SET response_value=EXCLUDED.response_value,numeric_value=EXCLUDED.numeric_value,temperature_value=EXCLUDED.temperature_value,status=EXCLUDED.status,observation=EXCLUDED.observation,responded_at=EXCLUDED.responded_at,responded_by=EXCLUDED.responded_by RETURNING id`,[args.checkId,args.itemId,JSON.stringify(args.responseValue),args.numericValue??null,args.temperatureValue??null,evaluation.responseStatus,evaluation.explanation,args.userId])).rows[0].id;
  let observationId:null|string=null, actionId:null|string=null;
  if(evaluation.shouldObserve){
    observationId=(await client.query(`INSERT INTO observations(id,outlet_id,rule_id,check_response_id,severity,description,observed_at,observed_by,status) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,now(),$6,'open') RETURNING id`,[item.outlet_id,item.rule_id,responseId,evaluation.riskLevel,evaluation.explanation,args.userId])).rows[0].id;
    const priority=evaluation.riskLevel==='critical'?'critical':evaluation.riskLevel==='high'?'high':evaluation.riskLevel==='moderate'?'medium':'low';
    actionId=(await client.query(`INSERT INTO corrective_actions(id,outlet_id,source_type,source_id,title,description,severity,priority,assigned_to,due_date,status,created_at)
      VALUES(gen_random_uuid(),$1,'check_response',$2,$3,$4,$5,$6,$7,current_date,CASE WHEN $5 IN ('critical','high') THEN 'open' ELSE 'in_progress' END,now()) RETURNING id`,[item.outlet_id,responseId,`Corrective action: ${item.rule_title}`,evaluation.nextStep,evaluation.riskLevel,priority,args.userId])).rows[0].id;
    await client.query(`UPDATE observations SET status='linked' WHERE id=$1`,[observationId]);
    await client.query(`INSERT INTO system_events(id,organisation_id,outlet_id,event_type,entity_type,entity_id,payload,processed,occurred_at) SELECT gen_random_uuid(),o.organisation_id,o.id,'CORRECTIVE_ACTION_CREATED','corrective_action',$1,$2,false,now() FROM outlets o WHERE o.id=$3`,[actionId,JSON.stringify({observation_id:observationId,rule_code:item.rule_code,outcome:evaluation.outcome}),item.outlet_id]);
  }
  if(ccp && (args.numericValue!==undefined || args.temperatureValue!==undefined || item.response_type==='temperature'||item.response_type==='number')){
    const n=Number(args.numericValue ?? args.temperatureValue ?? args.responseValue); const min=ccp.critical_limit_min===null?undefined:Number(ccp.critical_limit_min); const max=ccp.critical_limit_max===null?undefined:Number(ccp.critical_limit_max); const within=evaluation.responseStatus==='pass';
    if(Number.isFinite(n) && ccp.validation_status==='validated') await client.query(`INSERT INTO monitoring_records(id,ccp_id,outlet_id,recorded_by,observed_value,unit,within_limit,observation_time,action_required,corrective_action_id) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6,now(),$7,$8)`,[ccp.id,item.outlet_id,args.userId,n,ccp.unit,within,!within,actionId]);
  }
  return {...evaluation,responseId,observationId,correctiveActionId:actionId};
}
