import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';

export async function POST(req:Request){
 try{
  const body=await req.json(); const email=String(body.email||'').trim().toLowerCase();
  if(!email) return fail('VALIDATION_ERROR','Email is required',400);
  if(!process.env.DATABASE_URL){
    const res=NextResponse.json({data:{user:{id:'demo-user',email},organisation:{id:'demo-org',name:'Demo Restaurant Group'},outlet:{id:'demo-outlet',name:'Demo Restaurant'},role:'owner'},error:null},{status:200});
    for(const [k,v] of Object.entries({'fs_user_id':'demo-user','fs_org_id':'demo-org','fs_outlet_id':'demo-outlet','fs_role':'owner'})) res.cookies.set(k,v,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'});
    return res;
  }
  const rows=await query<any>(`SELECT u.id user_id,u.email,m.organisation_id,o.id outlet_id,r.code role FROM users u JOIN memberships m ON m.user_id=u.id JOIN outlets o ON o.organisation_id=m.organisation_id AND o.active=true JOIN roles r ON r.id=m.role_id WHERE lower(u.email)=lower($1) AND m.status='active' ORDER BY o.created_at LIMIT 1`,[email]);
  if(!rows[0]) return fail('UNAUTHENTICATED','Invalid credentials',401);
  const r=NextResponse.json({data:{user:{id:rows[0].user_id,email},organisation:{id:rows[0].organisation_id},outlet:{id:rows[0].outlet_id},role:rows[0].role},error:null});
  for(const [k,v] of Object.entries({'fs_user_id':rows[0].user_id,'fs_org_id':rows[0].organisation_id,'fs_outlet_id':rows[0].outlet_id,'fs_role':rows[0].role})) r.cookies.set(k,v,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'});
  return r;
 }catch(e){return fail('INTERNAL_ERROR','Unable to login',500)}
}
