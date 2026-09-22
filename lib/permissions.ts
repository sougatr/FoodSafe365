export const ROLE_PERMISSIONS:Record<string,string[]>= {
  owner:['*'],
  org_admin:['*'],
  outlet_manager:['dashboard:read','checks:read','checks:write','issues:write','actions:read','actions:write','actions:verify','records:read','records:write','haccp:read','haccp:write'],
  manager:['dashboard:read','checks:read','checks:write','issues:write','actions:read','actions:write','actions:verify','records:read','records:write','haccp:read','haccp:write'],
  food_safety_supervisor:['dashboard:read','checks:read','checks:write','issues:write','actions:read','actions:write','actions:verify','records:read','records:write','haccp:read','haccp:write'],
  food_handler:['dashboard:read','checks:read','checks:write','issues:write','actions:read'],
  auditor:['dashboard:read','checks:read','actions:read','records:read','haccp:read'],
};
export function can(role:string,permission:string){const p=ROLE_PERMISSIONS[role]||[];return p.includes('*')||p.includes(permission)}
