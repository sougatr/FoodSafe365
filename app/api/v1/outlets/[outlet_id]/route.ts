import { requireOutletAccess } from '@/lib/tenant';
import {query} from '@/lib/db'; import {fail,ok} from '@/lib/response'; export async function GET(_:Request,{params}:{params:{outlet_id:string}}){
 const access=await requireOutletAccess(params.outlet_id);
 if(!access.ok) return fail(access.status===401?'UNAUTHENTICATED':access.status===403?'FORBIDDEN':'NOT_FOUND',access.message,access.status);if(!process.env.DATABASE_URL)return ok({id:params.outlet_id,name:'ABC Restaurant',city:'Mumbai'}); const r=await query('SELECT id,name,city,state,status FROM outlets WHERE id=$1',[params.outlet_id]); if(!r.length)return fail('NOT_FOUND','Outlet not found',404); return ok(r[0]);}
