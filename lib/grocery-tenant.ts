import { getAuthContext, AuthContext } from './auth';
import { isDatabaseConfigured, assertDatabaseConfigured } from './db';

export type GroceryAuthResult =
  | { ok: true; auth: AuthContext | null; outletId: string }
  | { ok: false; status: 401 | 403 | 500; code: string; message: string };

export interface GroceryAuthOptions {
  strictAuthRequired?: boolean;
  allowExplicitDemo?: boolean;
}

/**
 * Authorize grocery outlet access.
 * Enforces strict authentication and tenant scoping by default:
 * - Unauthenticated requests are rejected with 401 UNAUTHENTICATED by default.
 * - Demo fallback is strictly confined to local development (non-production and no DATABASE_URL)
 *   and requires explicit configuration.
 * - Authenticated users are strictly confined to their assigned outlet (auth.outletId).
 * - Cross-tenant access attempts are rejected with 403 FORBIDDEN.
 * - Administrative roles (platform_admin, admin, superadmin) can access any outlet.
 * - Non-management roles (customer, vendor) and non-grocery journey accounts are rejected with 403 FORBIDDEN.
 */
export async function authorizeGroceryAccess(
  requestedOutletId: string | null,
  req?: Request,
  optionsOrStrict: boolean | GroceryAuthOptions = true
): Promise<GroceryAuthResult> {
  const isStrict = typeof optionsOrStrict === 'boolean'
    ? optionsOrStrict
    : (optionsOrStrict?.strictAuthRequired ?? true);

  const allowExplicitDemo = typeof optionsOrStrict === 'object'
    ? Boolean(optionsOrStrict?.allowExplicitDemo)
    : !isStrict;

  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isProduction = process.env.NODE_ENV === 'production' && !isPreview;
  const hasDatabase = isDatabaseConfigured();

  const auth = await getAuthContext(req);

  // 1. Unauthenticated handling
  if (!auth) {
    // Confine demo browsing fallback strictly to local development without database and with explicit flag
    if (allowExplicitDemo && !isProduction && !hasDatabase) {
      const demoOutlet = (requestedOutletId && requestedOutletId !== 'all')
        ? requestedOutletId.trim()
        : 'store-nature-basket-bandra';
      return { ok: true, auth: null, outletId: demoOutlet };
    }

    return {
      ok: false,
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Authentication required. Please sign in as a grocery store manager.'
    };
  }

  // 2. Role & journey authorization: reject roles or journeys without grocery management privileges
  if (
    auth.role === 'customer' ||
    auth.role === 'diner' ||
    auth.role === 'vendor' ||
    auth.role === 'provider' ||
    Boolean(auth.providerId) ||
    (auth.journey && auth.journey !== 'grocery' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role))
  ) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied: Role is not authorized for grocery store operations.'
    };
  }

  if ((isProduction || isPreview) && !hasDatabase) {
    const dbCheck = assertDatabaseConfigured();
    return {
      ok: false,
      status: 500,
      code: 'CONFIGURATION_ERROR',
      message: dbCheck.ok ? 'Database configuration error' : dbCheck.error
    };
  }

  const requested = (requestedOutletId && requestedOutletId !== 'all')
    ? requestedOutletId.trim()
    : null;

  // 3. Platform administrators: granted cross-tenant administrative access
  if (auth.role === 'platform_admin' || auth.role === 'admin' || auth.role === 'superadmin') {
    return {
      ok: true,
      auth,
      outletId: requested || (auth.outletId && auth.outletId !== 'none' ? auth.outletId : 'store-nature-basket-bandra')
    };
  }

  // 4. Cross-outlet aggregation ('all') requires administrative permissions
  if (requestedOutletId === 'all') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied: Cross-outlet aggregation requires administrative permissions.'
    };
  }

  // 5. Must have an assigned outlet
  if (!auth.outletId || auth.outletId === 'none') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied: No grocery store outlet assigned to your account.'
    };
  }

  const isDemoOutlet = auth.outletId === 'demo-outlet' && !isProduction && !hasDatabase;

  // 6. Strict tenant isolation: reject untrusted client tenant IDs
  if (requested && auth.outletId !== requested && !isDemoOutlet) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: `Access denied: You are authorized for outlet ${auth.outletId}, but attempted to access ${requested}.`
    };
  }

  // Resolved outlet ID: server-verified outlet ID from session
  const targetOutlet = (isDemoOutlet && requested) ? requested : auth.outletId;

  return { ok: true, auth, outletId: targetOutlet };
}
