import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { fail } from '../../../../../lib/response';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions, SessionJourney } from '../../../../../lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '../../../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../../../lib/body-guard';
import { verifyPassword } from '../../../../../lib/passwords';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Enforce 1 MB body size cap and safe JSON parsing
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return fail(parseRes.code, parseRes.message, parseRes.status);
    }
    const body = parseRes.data || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
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
    if (!password) return fail('VALIDATION_ERROR', 'Password is required', 400);

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
      let journey: SessionJourney = 'restaurant';
      let allowedDemoPasswords = ['demo'];

      if (requestedRole === 'grocery' || email.includes('naturefresh') || email.includes('grocery')) {
        userId = 'mgr-store-nature-basket-bandra';
        organisationId = 'org-nature-basket';
        outletId = requestedOutletId || 'store-nature-basket-bandra';
        role = 'outlet_manager';
        journey = 'grocery';
        allowedDemoPasswords = ['grocery123', 'demo'];
      } else if (requestedRole === 'provider' || email.includes('labcare') || email.includes('partner') || requestedRole === 'vendor') {
        userId = 'prov-refrig-frost';
        organisationId = 'org-frostline';
        outletId = 'none';
        role = 'vendor';
        providerId = 'prov-refrig-frost';
        journey = 'provider';
        allowedDemoPasswords = ['partner123', 'demo'];
      } else if (requestedRole === 'client' || email.includes('diner')) {
        userId = 'diner-guest-01';
        organisationId = 'diner-org';
        outletId = 'none';
        role = 'customer';
        journey = 'client';
        allowedDemoPasswords = ['diner123', 'demo'];
      } else if (email === 'admin@foodsafe365.com') {
        userId = 'admin-user-01';
        organisationId = 'platform-org';
        outletId = 'all';
        role = 'platform_admin';
        journey = 'platform';
        allowedDemoPasswords = ['demo'];
      } else if (requestedRole === 'manager' || requestedRole === 'outlet_manager') {
        userId = 'demo-manager-01';
        organisationId = 'demo-org';
        outletId = requestedOutletId || 'the-table';
        role = 'outlet_manager';
        journey = 'restaurant';
        allowedDemoPasswords = ['demo'];
      }

      if (!allowedDemoPasswords.includes(password)) {
        return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
      }

      const sessionToken = createSessionToken({
        userId,
        organisationId,
        outletId,
        role,
        providerId,
        journey
      });

      const res = NextResponse.json({
        data: {
          user: { id: userId, email },
          organisation: { id: organisationId, name: 'FoodSafe365 Enterprise' },
          outlet: { id: outletId, name: outletId },
          role,
          providerId,
          journey,
          token: sessionToken
        },
        error: null
      }, { status: 200 });

      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

      for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
        res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
      }

      return res;
    }

    // Production / Database Mode
    if (requestedRole === 'client') {
      return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
    }

    // 1. Grocery Store Manager Journey
    if (requestedRole === 'grocery') {
      const groceryParams: any[] = [email];
      let groceryWhere = `lower(contact_email) = lower($1)`;
      if (requestedOutletId) {
        groceryParams.push(requestedOutletId);
        groceryWhere += ` AND id = $2`;
      }

      const groceryRows = await query<any>(
        `SELECT id, name, contact_email, password_hash
         FROM grocery_outlets
         WHERE ${groceryWhere}
         ORDER BY created_at ASC
         LIMIT 1`,
        groceryParams
      );

      const storeRow = groceryRows[0];
      if (!storeRow || !storeRow.password_hash) {
        return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
      }

      const passwordValid = await verifyPassword(password, storeRow.password_hash);
      if (!passwordValid) {
        return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
      }

      const userId = `mgr-${storeRow.id}`;
      const organisationId = `org-${storeRow.id}`;
      const outletId = storeRow.id;
      const role = 'outlet_manager';
      const journey: SessionJourney = 'grocery';

      const sessionToken = createSessionToken({
        userId,
        organisationId,
        outletId,
        role,
        journey
      });

      const res = NextResponse.json({
        data: {
          user: { id: userId, email: storeRow.contact_email || email },
          organisation: { id: organisationId, name: storeRow.name },
          outlet: { id: outletId, name: storeRow.name },
          role,
          journey,
          token: sessionToken
        },
        error: null
      });

      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());
      for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
        res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
      }
      return res;
    }

    // 2. Service Provider Journey
    if (requestedRole === 'provider' || requestedRole === 'vendor') {
      const providerRows = await query<any>(
        `SELECT id, business_name, email, password_hash, status
         FROM service_providers
         WHERE lower(email) = lower($1) AND status = 'active'
         ORDER BY created_at ASC
         LIMIT 1`,
        [email]
      );

      const providerRow = providerRows[0];
      if (!providerRow || !providerRow.password_hash) {
        return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
      }

      const passwordValid = await verifyPassword(password, providerRow.password_hash);
      if (!passwordValid) {
        return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
      }

      const userId = providerRow.id;
      const organisationId = `org-${providerRow.id}`;
      const outletId = 'none';
      const role = 'vendor';
      const providerId = providerRow.id;
      const journey: SessionJourney = 'provider';

      const sessionToken = createSessionToken({
        userId,
        organisationId,
        outletId,
        role,
        providerId,
        journey
      });

      const res = NextResponse.json({
        data: {
          user: { id: userId, email: providerRow.email || email },
          organisation: { id: organisationId, name: providerRow.business_name },
          outlet: { id: outletId },
          role,
          providerId,
          journey,
          token: sessionToken
        },
        error: null
      });

      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());
      for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
        res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
      }
      return res;
    }

    // 3. Restaurant / Core Platform User Journey (F-01, F-02, F-10)
    // Never trust client-supplied `role`; resolve role strictly from active DB membership.
    const userParams: any[] = [email];
    let outletFilterSql = '';
    if (requestedOutletId) {
      userParams.push(requestedOutletId);
      outletFilterSql = ` AND o.id::text = $2`;
    }

    const rows = await query<any>(
      `SELECT u.id AS user_id,
              u.email,
              u.password_hash,
              m.organisation_id,
              o.id AS outlet_id,
              r.code AS role
       FROM users u
       JOIN memberships m ON m.user_id = u.id AND m.status = 'active'
       JOIN organisations org ON org.id = m.organisation_id AND org.status = 'active'
       JOIN outlets o ON o.organisation_id = m.organisation_id
                     AND o.status = 'active'
                     AND (m.outlet_id IS NULL OR o.id = m.outlet_id)
       JOIN roles r ON r.id = m.role_id
       WHERE lower(u.email) = lower($1)
         AND u.status = 'active'${outletFilterSql}
       ORDER BY o.created_at ASC
       LIMIT 1`,
      userParams
    );

    const userRow = rows[0];
    if (!userRow || !userRow.password_hash) {
      return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
    }

    const passwordValid = await verifyPassword(password, userRow.password_hash);
    if (!passwordValid) {
      return fail('UNAUTHENTICATED', 'Invalid credentials', 401);
    }

    const grantedRole = String(userRow.role);
    const journey: SessionJourney =
      grantedRole === 'platform_admin' || grantedRole === 'admin' || grantedRole === 'superadmin'
        ? 'platform'
        : 'restaurant';

    const sessionToken = createSessionToken({
      userId: userRow.user_id,
      organisationId: userRow.organisation_id,
      outletId: userRow.outlet_id,
      role: grantedRole,
      journey
    });

    const res = NextResponse.json({
      data: {
        user: { id: userRow.user_id, email: userRow.email || email },
        organisation: { id: userRow.organisation_id },
        outlet: { id: userRow.outlet_id },
        role: grantedRole,
        journey,
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
