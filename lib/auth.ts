import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export type AuthContext = { userId: string; organisationId: string; outletId: string; role: string; providerId?: string };

export async function getAuthContext(req?: Request): Promise<AuthContext | null> {
  try {
    const c = cookies();
    const userId = c.get('fs_user_id')?.value;
    const organisationId = c.get('fs_org_id')?.value;
    const outletId = c.get('fs_outlet_id')?.value;
    const role = c.get('fs_role')?.value;
    const providerId = c.get('fs_provider_id')?.value;
    if (userId && (organisationId || providerId) && role) {
      return { 
        userId, 
        organisationId: organisationId || 'provider-org', 
        outletId: outletId || 'none', 
        role,
        providerId: providerId || (role === 'vendor' || role === 'provider' ? userId : undefined)
      };
    }
  } catch {}

  if (req) {
    const userId = req.headers.get('x-foodsafe-user-id');
    const organisationId = req.headers.get('x-foodsafe-org-id') || 'demo-org';
    const outletId = req.headers.get('x-foodsafe-outlet-id') || 'demo-outlet';
    const role = req.headers.get('x-foodsafe-role') || 'owner';
    const providerId = req.headers.get('x-foodsafe-provider-id') || (role === 'vendor' || role === 'provider' ? userId || undefined : undefined);
    if (userId) {
      return { userId, organisationId, outletId, role, providerId };
    }
  }

  return null;
}

export function demoAuthHeaders() {
  return { 'x-foodsafe-user-id': randomUUID() };
}
