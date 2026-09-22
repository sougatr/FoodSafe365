import { requireOutletAccess } from '@/lib/tenant';
import {query} from '@/lib/db'; import {ok,fail} from '@/lib/response'; import {evaluateApplicability} from '@/lib/rule-applicability';
export async function GET(_:Request,{params}:{params:{outlet_id:string}}){
 const access=await requireOutletAccess(params.outlet_id);
 if(!access.ok) return fail(access.status===401?'UNAUTHENTICATED':access.status===403?'FORBIDDEN':'NOT_FOUND',access.message,access.status);
 if(!process.env.DATABASE_URL)return ok({outletId:params.outlet_id,templates:[{code:'DAILY_FOOD_SAFETY',name:'Daily Food Safety Check',frequency:'daily',items:[]} ]});
 const profile=(await query<any>(`SELECT COALESCE((SELECT json_agg(fp.code) FROM outlet_processes op JOIN food_processes fp ON fp.id=op.process_id WHERE op.outlet_id=o.id AND op.active=true),'[]') processes, COALESCE((SELECT json_agg(et.code) FROM equipment e JOIN equipment_types et ON et.id=e.equipment_type_id WHERE e.outlet_id=o.id AND e.status='active'),'[]') equipment FROM outlets o WHERE o.id=$1`,[params.outlet_id]))[0]; if(!profile)return fail('NOT_FOUND','Outlet not found',404);
 const rows=await query<any>(`SELECT t.code,t.name,t.frequency,t.role_code,i.id,i.rule_id,i.question,i.help_text,i.response_type,i.sequence_no,i.required,i.evidence_required,COALESCE((SELECT string_agg(rc.value->>'text',' | ') FROM rule_conditions rc WHERE rc.rule_id=i.rule_id),'') applicability FROM check_templates t JOIN check_template_items i ON i.check_template_id=t.id AND i.active=true WHERE t.active=true AND t.code='DAILY_FOOD_SAFETY' ORDER BY i.sequence_no`);
 const p={processCodes:profile.processes||[],equipmentCodes:profile.equipment||[]}; const items=rows.filter(x=>evaluateApplicability([{field_name:'applicability',value:{text:x.applicability}}],p)).map(({applicability,...x})=>x); return ok({outletId:params.outlet_id,templates:[{code:'DAILY_FOOD_SAFETY',name:'Daily Food Safety Check',frequency:'daily',role_code:'food_handler',items}]});
}
