import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { ok, fail } from '../../../../../lib/response';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../../../../lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '../../../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../../../lib/body-guard';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Enforce 1 MB body size cap and safe JSON parsing
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return fail(parseRes.code, parseRes.message, parseRes.status);
    }
    const body = parseRes.data;
    const email = String(body.email || '').trim().toLowerCase();
    const requestedRole = String(body.role || '').trim().toLowerCase();
    const requestedOutletId = String(body.outletId || '').trim();

    // Enforce strict login rate limit: 5 attempts per 15 minutes per IP
    const rateLimitKey = `rl:auth:login:${clientIp}`;
    const rlResult = await checkRateLimit({
      key: rateLimitKey,
      limit: 5,
      windowSeconds: 15 * 60
    });

    if (!rlResult.allowed) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many authentication attempts. Please try again later.'
          }
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rlResult)
        }
      );
    }

    if (!email) return fail('VALIDATION_ERROR', 'Email is required', 400);

    // In production, database authentication is strictly mandatory
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
    }

    // Development / Demo Mode (permitted ONLY when DATABASE_URL is not configured and NODE_ENV !== 'production')
    if (!process.env.DATABASE_URL) {
      let userId = 'demo-user';
      let organisationId = 'demo-org';
      let outletId = requestedOutletId || 'demo-outlet';
      let role = 'owner';
      let providerId: string | undefined = undefined;

      if (requestedRole === 'grocery' || email.includes('naturefresh') || email.includes('grocery')) {
        userId = 'mgr-store-nature-basket-bandra';
        organisationId = 'org-nature-basket';
        outletId = requestedOutletId || 'store-nature-basket-bandra';
        role = 'outlet_manager';
      } else if (requestedRole === 'provider' || email.includes('labcare') || email.includes('partner') || requestedRole === 'vendor') {
        userId = 'prov-refrig-frost';
        organisationId = 'org-frostline';
        outletId = 'none';
        role = 'vendor';
        providerId = 'prov-refrig-frost';
      } else if (requestedRole === 'client' || email.includes('diner')) {
        userId = 'diner-guest-01';
        organisationId = 'diner-org';
        outletId = 'none';
        role = 'customer';
      } else if (requestedRole === 'admin' || requestedRole === 'platform_admin' || email.includes('admin@foodsafe365.com')) {
        userId = 'admin-user-01';
        organisationId = 'platform-org';
        outletId = 'all';
        role = 'platform_admin';
      } else if (requestedRole === 'manager' || requestedRole === 'outlet_manager') {
        userId = 'demo-manager-01';
        organisationId = 'demo-org';
        outletId = requestedOutletId || 'the-table';
        role = 'outlet_manager';
      }

      // Mint cryptographically signed session token
      const sessionToken = createSessionToken({
        userId,
        organisationId,
        outletId,
        role,
        providerId
      });

      const res = NextResponse.json({
        data: {
          user: { id: userId, email },
          organisation: { id: organisationId, name: 'FoodSafe365 Enterprise' },
          outlet: { id: outletId, name: outletId },
          role,
          providerId,
          token: sessionToken
        },
        error: null
      }, { status: 200 });

      // Set cryptographically signed, HTTP-only session cookie
      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

      // Clean up any legacy plaintext cookies
      for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
        res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
      }

      return res;
    }

    // Production Database Mode
    const rows = await query<any>(
      `SELECT u.id user_id, u.email, m.organisation_id, o.id outlet_id, r.code role 
       FROM users u 
       JOIN memberships m ON m.user_id = u.id 
       JOIN outlets o ON o.organisation_id = m.organisation_id AND o.active = true 
       JOIN roles r ON r.id = m.role_id 
       WHERE lower(u.email) = lower($1) AND m.status = 'active' 
       ORDER BY o.created_at LIMIT 1`,
      [email]
    );

    if (!rows[0]) return fail('UNAUTHENTICATED', 'Invalid credentials', 401);

    const userRow = rows[0];
    const sessionToken = createSessionToken({
      userId: userRow.user_id,
      organisationId: userRow.organisation_id,
      outletId: userRow.outlet_id,
      role: userRow.role
    });

    const res = NextResponse.json({
      data: {
        user: { id: userRow.user_id, email },
        organisation: { id: userRow.organisation_id },
        outlet: { id: userRow.outlet_id },
        role: userRow.role,
        token: sessionToken
      },
      error: null
    });

    // Set cryptographically signed, HTTP-only session cookie
    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    // Clean up legacy cookies
    for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
      res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
    }

    return res;
  } catch (e: any) {
    return fail('INTERNAL_ERROR', 'Unable to login', 500);
  }
}
