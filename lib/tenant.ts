import { query } from './db';
import { getAuthContext } from './auth';

export async function requireOutletAccess(outletId:string){
 const auth=await getAuthContext();
 if(!auth) return {ok:false as const,status:401,message:'Authentication required'};
 if(auth.outletId!==outletId) return {ok:false as const,status:403,message:'Outlet access denied'};
 if(process.env.DATABASE_URL){
   const rows=await query<any>(`SELECT id FROM outlets WHERE id=$1 AND organisation_id=$2 AND status='active'`,[outletId,auth.organisationId]);
   if(!rows[0]) return {ok:false as const,status:404,message:'Outlet not found'};
 }
 return {ok:true as const,auth};
}
