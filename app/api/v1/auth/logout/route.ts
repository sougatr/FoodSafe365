import { NextResponse } from 'next/server';
export async function POST(){const r=NextResponse.json({data:{success:true},error:null}); for(const k of ['fs_user_id','fs_org_id','fs_outlet_id','fs_role']) r.cookies.set(k,'',{httpOnly:true,maxAge:0,path:'/'}); return r;}
