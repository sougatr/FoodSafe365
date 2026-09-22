import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export type AuthContext = { userId:string; organisationId:string; outletId:string; role:string };

export async function getAuthContext():Promise<AuthContext|null>{
  const c=cookies();
  const userId=c.get('fs_user_id')?.value;
  const organisationId=c.get('fs_org_id')?.value;
  const outletId=c.get('fs_outlet_id')?.value;
  const role=c.get('fs_role')?.value;
  if(!userId||!organisationId||!outletId||!role) return null;
  return {userId,organisationId,outletId,role};
}

export function demoAuthHeaders(){
 return { 'x-foodsafe-user-id': randomUUID() };
}
