import { getAuthContext } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';

const MAX_BYTES=10*1024*1024;
const ALLOWED=['image/jpeg','image/png','application/pdf'];
export async function POST(req:Request){
 const auth=await getAuthContext(); if(!auth)return fail('UNAUTHENTICATED','Authentication required',401);
 if(!can(auth.role,'checks:write')&&!can(auth.role,'records:write'))return fail('FORBIDDEN','You do not have permission to add evidence',403);

 let b:any;
 const contentType=req.headers.get('content-type')||'';
 try{
   if(contentType.includes('multipart/form-data')){
     const form=await req.formData();
     const file=form.get('file');
     if(!(file instanceof File))return fail('VALIDATION_ERROR','Evidence file is required',400);
     b={
       outlet_id:String(form.get('outlet_id')||''),
       entity_type:String(form.get('entity_type')||''),
       entity_id:String(form.get('entity_id')||''),
       description:String(form.get('description')||''),
       file_url:`upload://evidence/${crypto.randomUUID()}/${file.name}`,
       file_type:file.type,
       file_size:file.size,
       file_name:file.name
     };
   } else {
     b=await req.json();
   }
 }catch{return fail('VALIDATION_ERROR','Invalid evidence request',400)}

 if(!b?.outlet_id||!b?.entity_type||!b?.entity_id||!b?.file_url||!b?.file_type||b?.file_size===undefined)return fail('VALIDATION_ERROR','outlet_id, entity_type, entity_id, file_url, file_type and file_size are required',400);
 if(!ALLOWED.includes(b.file_type))return fail('VALIDATION_ERROR','Unsupported file type. Use JPG, PNG or PDF',400);
 if(Number(b.file_size)>MAX_BYTES)return fail('VALIDATION_ERROR','Evidence file exceeds 10 MB limit',400);

 if(!process.env.DATABASE_URL){ return ok({id:`demo-evidence-${Date.now()}`,outlet_id:b.outlet_id,entity_type:b.entity_type,entity_id:b.entity_id,file_url:b.file_url,file_name:b.file_name||null,file_type:b.file_type,file_size:Number(b.file_size),captured_by:auth.userId,captured_at:new Date().toISOString(),description:b.description||null,demo:true},201); }
 const outlet=(await query<any>(`SELECT id FROM outlets WHERE id=$1 AND organisation_id=$2 AND status='active'`,[b.outlet_id,auth.organisationId]))[0]; if(!outlet)return fail('FORBIDDEN','Outlet access denied',403);
 const allowedEntity=['check_response','observation','corrective_action','document','service','haccp_monitoring']; if(!allowedEntity.includes(b.entity_type))return fail('VALIDATION_ERROR','Invalid evidence entity type',400);
 const entityQueries:any={
  check_response:`SELECT cr.id FROM check_responses cr JOIN check_instances ci ON ci.id=cr.check_instance_id WHERE cr.id=$1 AND ci.outlet_id=$2`,
  observation:`SELECT id FROM observations WHERE id=$1 AND outlet_id=$2`,
  corrective_action:`SELECT id FROM corrective_actions WHERE id=$1 AND outlet_id=$2`,
  document:`SELECT id FROM documents WHERE id=$1 AND outlet_id=$2`,
  service:`SELECT id FROM service_requests WHERE id=$1 AND outlet_id=$2`,
  haccp_monitoring:`SELECT mr.id FROM monitoring_records mr JOIN ccps c ON c.id=mr.ccp_id WHERE mr.id=$1 AND mr.outlet_id=$2`
 };
 const entity=(await query<any>(entityQueries[b.entity_type],[b.entity_id,b.outlet_id]))[0]; if(!entity)return fail('FORBIDDEN','Evidence entity does not belong to the outlet',403);
 // Production storage must issue a presigned upload URL and persist the resulting object reference.
 // This MVP records the validated upload metadata; binary storage is the next storage-integration step.
 const row=(await query<any>(`INSERT INTO evidence(id,outlet_id,entity_type,entity_id,file_url,file_type,file_size,hash,captured_by,captured_at,description) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,now(),$9) RETURNING *`,[b.outlet_id,b.entity_type,b.entity_id,b.file_url,b.file_type,Number(b.file_size),b.hash||null,auth.userId,b.description||null]))[0];
 return ok(row,201);
}
