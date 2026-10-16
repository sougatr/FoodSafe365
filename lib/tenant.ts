import { query, isDatabaseConfigured, assertDatabaseConfigured } from './db';
import { getAuthContext, AuthContext } from './auth';
import { getRestaurantEntry, getRestaurantEntryAsync } from './unclaimed-restaurant-store';

export async function requireOutletAccess(outletId: string, req?: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return { ok: false as const, status: 401, message: 'Authentication required' };

  if (
    auth.role === 'vendor' ||
    auth.role === 'provider' ||
    auth.role === 'customer' ||
    auth.role === 'diner' ||
    Boolean(auth.providerId) ||
    (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role))
  ) {
    return { ok: false as const, status: 403, message: 'Outlet access denied: account is not authorized for restaurant operations' };
  }

  const dbConfig = assertDatabaseConfigured();
  if (!dbConfig.ok && (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview')) {
    return { ok: false as const, status: 500, code: 'CONFIGURATION_ERROR', message: dbConfig.error };
  }

  // Platform admin can access any outlet
  if (auth.role === 'platform_admin' || auth.role === 'admin' || auth.role === 'superadmin') return { ok: true as const, auth };

  // Org admin / owner can access outlets within their organisation
  if (auth.role === 'org_admin' || auth.role === 'owner') {
    if (isDatabaseConfigured()) {
      try {
        const rows = await query<any>(`SELECT id FROM outlets WHERE id = $1 AND organisation_id = $2 AND status = 'active'`, [outletId, auth.organisationId]);
        if (!rows[0]) return { ok: false as const, status: 403, code: 'FORBIDDEN', message: 'Outlet access denied for organisation' };
      } catch (err) {
        return { ok: false as const, status: 500, code: 'DATABASE_ERROR', message: 'Unable to verify outlet access.' };
      }
    }
    return { ok: true as const, auth };
  }

  // Manager or Supervisor is restricted to their specific outlet
  if (auth.outletId !== outletId) return { ok: false as const, status: 403, code: 'FORBIDDEN', message: 'Outlet access denied' };
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<any>(`SELECT id FROM outlets WHERE id = $1 AND organisation_id = $2 AND status = 'active'`, [outletId, auth.organisationId]);
      if (!rows[0]) return { ok: false as const, status: 404, code: 'NOT_FOUND', message: 'Outlet not found' };
    } catch (err) {
      return { ok: false as const, status: 500, code: 'DATABASE_ERROR', message: 'Unable to verify outlet access.' };
    }
  }
  return { ok: true as const, auth };
}

export type FeedbackAuthorizationResult =
  | { ok: true; auth: AuthContext; targetOutletId: string | null }
  | { ok: false; status: 401 | 403 | 404 | 500; code: string; message: string };

/**
 * Authorize restaurant manager access for Customer Food-Safety Feedback.
 * - platform_admin: Can access all or any specific outlet.
 * - org_admin / owner: Can access all or specific outlets belonging to their organisation.
 * - outlet_manager / manager / food_safety_supervisor: Can strictly access their assigned outlet only.
 * - Unclaimed restaurants cannot be accessed by managers until claimed and verified.
 */
export async function authorizeFeedbackAccess(
  requestedOutletId: string | null,
  req?: Request,
  allowExplicitDemo: boolean = false
): Promise<FeedbackAuthorizationResult> {
  const requested = requestedOutletId && requestedOutletId !== 'all' ? requestedOutletId.trim() : null;

  // Check if requested restaurant is UNCLAIMED
  if (requested) {
    const restEntry = await getRestaurantEntryAsync(requested);
    if (restEntry && (restEntry.status === 'UNCLAIMED' || restEntry.status === 'DISCOVERED' || restEntry.status === 'INVITED')) {
      const authCheck = await getAuthContext(req);
      if (!authCheck || (authCheck.role !== 'platform_admin' && authCheck.role !== 'admin' && authCheck.role !== 'superadmin')) {
        return {
          ok: false,
          status: 403,
          code: 'RESTAURANT_UNCLAIMED',
          message: `Access denied: ${restEntry.name || requested} has not yet claimed its FoodSafe365 profile. Ownership verification and claim required.`
        };
      }
    }
  }

  const auth = await getAuthContext(req);

  // If unauthenticated, allow only if explicitly in local demo mode (database unset and non-production)
  if (!auth) {
    if (allowExplicitDemo && !isDatabaseConfigured() && process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'preview') {
      const demoAuth: AuthContext = {
        userId: 'demo-manager',
        organisationId: 'demo-org',
        outletId: requested && requested !== 'all' ? requested : 'the-table',
        role: 'outlet_manager'
      };
      return { ok: true, auth: demoAuth, targetOutletId: requested };
    }
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Authentication required. Please sign in as a restaurant manager.'
    };
  }

  if (
    auth.role === 'vendor' ||
    auth.role === 'provider' ||
    auth.role === 'customer' ||
    auth.role === 'diner' ||
    Boolean(auth.providerId) ||
    (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role))
  ) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied: Insufficient permissions to access customer feedback records.'
    };
  }

  const dbConfig = assertDatabaseConfigured();
  if (!dbConfig.ok && (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview')) {
    return {
      ok: false,
      status: 500,
      code: 'CONFIGURATION_ERROR',
      message: dbConfig.error
    };
  }

  // 1. Platform administrator: unrestricted access
  if (auth.role === 'platform_admin' || auth.role === 'admin' || auth.role === 'superadmin') {
    return { ok: true, auth, targetOutletId: requested };
  }

  // 2. Organisation administrator / Owner: access all or specific outlets in their organisation
  if (auth.role === 'org_admin' || auth.role === 'owner') {
    if (isDatabaseConfigured() && requested) {
      try {
        const rows = await query<any>(
          `SELECT id FROM outlets WHERE id = $1 AND organisation_id = $2`,
          [requested, auth.organisationId]
        );
        if (rows.length === 0) {
          return {
            ok: false,
            status: 403,
            code: 'FORBIDDEN',
            message: 'Access denied: Requested outlet does not belong to your organisation.'
          };
        }
      } catch {
        return {
          ok: false,
          status: 500,
          code: 'DATABASE_ERROR',
          message: 'Unable to verify organisation outlet ownership.'
        };
      }
    }
    return { ok: true, auth, targetOutletId: requested };
  }

  // 3. Outlet Manager / Food Safety Supervisor: restricted strictly to their assigned outletId
  if (auth.role === 'outlet_manager' || auth.role === 'manager' || auth.role === 'food_safety_supervisor') {
    if (requested && requested !== auth.outletId) {
      return {
        ok: false,
        status: 403,
        code: 'FORBIDDEN',
        message: `Access denied: You are only authorized to view customer feedback for your assigned outlet (${auth.outletId}).`
      };
    }
    // If they requested 'all' or omitted outletId, restrict targetOutletId to their assigned outletId
    return { ok: true, auth, targetOutletId: auth.outletId };
  }

  return {
    ok: false,
    status: 403,
    code: 'FORBIDDEN',
    message: 'Access denied: Insufficient permissions to access customer feedback records.'
  };
}
