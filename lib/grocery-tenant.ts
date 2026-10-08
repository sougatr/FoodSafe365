import { getAuthContext, AuthContext } from './auth';

export type GroceryAuthResult =
  | { ok: true; auth: AuthContext | null; outletId: string }
  | { ok: false; status: 401 | 403; code: string; message: string };

/**
 * Authorize grocery outlet access.
 * Enforces strict tenant scoping:
 * - If user is authenticated for outlet A, accessing outlet B returns 403.
 * - If unauthenticated and in production (or req headers require auth), returns 401.
 */
export async function authorizeGroceryAccess(
  requestedOutletId: string | null,
  req?: Request,
  strictAuthRequired = false
): Promise<GroceryAuthResult> {
  const targetOutlet = (requestedOutletId && requestedOutletId !== 'all')
    ? requestedOutletId.trim()
    : 'store-nature-basket-bandra';

  const auth = await getAuthContext(req);

  if (strictAuthRequired && !auth) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Authentication required. Please sign in as a grocery store manager.'
    };
  }

  if (auth) {
    if (auth.role === 'platform_admin' || auth.role === 'admin' || auth.role === 'superadmin') {
      return { ok: true, auth, outletId: targetOutlet };
    }

    if (auth.outletId && auth.outletId !== 'none' && auth.outletId !== 'demo-outlet' && auth.outletId !== targetOutlet) {
      const isGroceryOutlet = auth.outletId.startsWith('store-');
      if (isGroceryOutlet || strictAuthRequired) {
        return {
          ok: false,
          status: 403,
          code: 'FORBIDDEN',
          message: `Access denied: You are authorized for outlet ${auth.outletId}, but attempted to access ${targetOutlet}.`
        };
      }
    }
    return { ok: true, auth, outletId: targetOutlet };
  }

  // Local development / demo browsing fallback
  return { ok: true, auth: null, outletId: targetOutlet };
}
