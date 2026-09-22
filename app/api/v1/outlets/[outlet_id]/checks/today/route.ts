import { requireOutletAccess } from '@/lib/tenant';
import { query, transaction } from '@/lib/db';
import { ok, fail } from '@/lib/response';
import { evaluateApplicability } from '@/lib/rule-applicability';

export async function GET(_:Request,{params}:{params:{outlet_id:string}}){
 const access=await requireOutletAccess(params.outlet_id);
 if(!access.ok)return fail(access.status===401?'UNAUTHENTICATED':access.status===403?'FORBIDDEN':'NOT_FOUND',access.message,access.status);
 if(!process.env.DATABASE_URL)return ok({outletId:params.outlet_id,checks:[{id:'demo-check',templateCode:'DAILY_FOOD_SAFETY',name:'Daily Food Safety Check',status:'in_progress',completionPercentage:89,items:[]}],demo:true});
 try{
  let instances=await query<any>(`SELECT ci.id,ct.code template_code,ct.name,ci.status,ci.completion_percentage,ci.started_at,ci.completed_at
    FROM check_instances ci JOIN check_templates ct ON ct.id=ci.check_template_id
    WHERE ci.outlet_id=$1 AND ci.started_at::date=current_date ORDER BY ci.started_at DESC`,[params.outlet_id]);
  if(!instances.length){
    const template=(await query<any>(`SELECT id,code,name,frequency,role_code FROM check_templates WHERE code='DAILY_FOOD_SAFETY' AND active=true ORDER BY version DESC LIMIT 1`))[0];
    if(template){
      const profile=(await query<any>(`SELECT COALESCE((SELECT json_agg(fp.code) FROM outlet_processes op JOIN food_processes fp ON fp.id=op.process_id WHERE op.outlet_id=o.id AND op.active=true),'[]') processes,COALESCE((SELECT json_agg(et.code) FROM equipment e JOIN equipment_types et ON et.id=e.equipment_type_id WHERE e.outlet_id=o.id AND e.status='active'),'[]') equipment FROM outlets o WHERE o.id=$1`,[params.outlet_id]))[0];
      const rows=await query<any>(`SELECT i.id,i.rule_id,i.question,i.response_type,i.required,i.evidence_required,COALESCE(string_agg(rc.value->>'text',' | '),'') applicability FROM check_template_items i LEFT JOIN rule_conditions rc ON rc.rule_id=i.rule_id WHERE i.check_template_id=$1 AND i.active=true GROUP BY i.id ORDER BY i.sequence_no`,[template.id]);
      const p={processCodes:profile?.processes||[],equipmentCodes:profile?.equipment||[]};
      const count=rows.filter(x=>evaluateApplicability([{field_name:'applicability',value:{text:x.applicability}}],p)).length;
      if(count>0){
       const created=await transaction(async client=>{
         const row=(await client.query(`INSERT INTO check_instances(id,outlet_id,check_template_id,assigned_to,started_at,status,completion_percentage) VALUES(gen_random_uuid(),$1,$2,$3,now(),'not_started',0) ON CONFLICT DO NOTHING RETURNING id`,[params.outlet_id,template.id,access.auth.userId])).rows[0];
         return row;
       });
      }
      instances=await query<any>(`SELECT ci.id,ct.code template_code,ct.name,ci.status,ci.completion_percentage,ci.started_at,ci.completed_at FROM check_instances ci JOIN check_templates ct ON ct.id=ci.check_template_id WHERE ci.outlet_id=$1 AND ci.started_at::date=current_date ORDER BY ci.started_at DESC`,[params.outlet_id]);
    }
  }
  return ok({outletId:params.outlet_id,checks:instances});
 }catch(e:any){return fail('INTERNAL_ERROR',e.message||'Unable to load today\'s checks',500)}
}
