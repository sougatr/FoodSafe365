import { z } from 'zod';
import { transaction } from '../../../../lib/db';
import { fail } from '../../../../lib/response';
import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../../../lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '../../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../../lib/body-guard';
import { hashPassword } from '../../../../lib/passwords';
import { assertDatabaseConfigured } from '../../../../lib/db-config';

const S = z.object({
  user: z.object({
    name: z.string().min(1),
    mobile: z.string().min(6),
    email: z.string().email().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional()
  }),
  organisation: z.object({ name: z.string().min(1) }),
  outlet: z.object({ name: z.string().min(1), city: z.string().min(1), restaurantTypeId: z.string() }),
  processCodes: z.array(z.string()).default([]),
  equipmentCodes: z.array(z.string()).default([])
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit: 10 onboarding requests per 15 minutes per IP
    const rlResult = await checkRateLimit({
      key: `rl:onboard:org:${clientIp}`,
      limit: 10,
      windowSeconds: 15 * 60
    });

    if (!rlResult.allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many onboarding requests. Please try again later.' } },
        { status: 429, headers: createRateLimitHeaders(rlResult) }
      );
    }

    const dbConfig = assertDatabaseConfigured();
    if (!dbConfig.ok && (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview')) {
      return fail('CONFIGURATION_ERROR', dbConfig.error, 500);
    }

    // Body limit: 1 MB
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return fail(parseRes.code, parseRes.message, parseRes.status);
    }

    const parsed = S.safeParse(parseRes.data);
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => i.message).join('; ') || 'Invalid onboarding payload';
      return fail('VALIDATION_ERROR', msg, 400);
    }
    const b = parsed.data;
    const outletSlug = b.outlet?.name ? b.outlet.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'demo-outlet';

    if (!dbConfig.ok) {
      const res = NextResponse.json({
        data: { organisationId: 'demo-org', outletId: outletSlug, userId: 'demo-user' },
        error: null
      }, { status: 201 });

      const token = createSessionToken({
        userId: 'demo-user',
        organisationId: 'demo-org',
        outletId: outletSlug,
        role: 'owner',
        journey: 'restaurant'
      });
      res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
      for (const [k, v] of Object.entries({ 'fs_user_id': 'demo-user', 'fs_org_id': 'demo-org', 'fs_outlet_id': outletSlug, 'fs_role': 'owner' })) {
        res.cookies.set(k, v, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
      }
      return res;
    }

    const normalizedEmail = b.user.email ? b.user.email.trim().toLowerCase() : null;
    const passwordHash = b.user.password ? await hashPassword(b.user.password) : null;

    const result = await transaction(async c => {
      if (normalizedEmail) {
        const existing = (
          await c.query(`SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`, [normalizedEmail])
        ).rows[0];
        if (existing) {
          const dupErr: any = new Error('An account with this email address already exists.');
          dupErr.code = 'DUPLICATE_ACCOUNT';
          dupErr.status = 409;
          throw dupErr;
        }
      }

      const role = (await c.query(`SELECT id FROM roles WHERE code='org_admin' LIMIT 1`)).rows[0];
      if (!role?.id) {
        const roleErr: any = new Error('Required role org_admin is not configured in database.');
        roleErr.code = 'CONFIGURATION_ERROR';
        roleErr.status = 500;
        throw roleErr;
      }

      const u = (
        await c.query(
          `INSERT INTO users(id,name,mobile,email,password_hash,status,created_at,updated_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,'active',now(),now()) RETURNING id`,
          [b.user.name.trim(), b.user.mobile.trim(), normalizedEmail, passwordHash]
        )
      ).rows[0];

      const org = (
        await c.query(
          `INSERT INTO organisations(id,name,organisation_type,owner_user_id,subscription_plan,status,created_at,updated_at) VALUES(gen_random_uuid(),$1,'single_outlet',$2,'free','active',now(),now()) RETURNING id`,
          [b.organisation.name.trim(), u.id]
        )
      ).rows[0];

      const rt = (
        await c.query(
          `SELECT id FROM restaurant_types WHERE id::text = $1 OR code = $1 LIMIT 1`,
          [b.outlet.restaurantTypeId]
        )
      ).rows[0];

      const outlet = (
        await c.query(
          `INSERT INTO outlets(id,organisation_id,name,city,restaurant_type_id,status,created_at,updated_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,'active',now(),now()) RETURNING id`,
          [org.id, b.outlet.name.trim(), b.outlet.city.trim(), rt?.id || null]
        )
      ).rows[0];

      await c.query(
        `INSERT INTO memberships(id,user_id,organisation_id,outlet_id,role_id,status,created_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,'active',now())`,
        [u.id, org.id, outlet.id, role.id]
      );

      for (const code of (b.processCodes || [])) {
        await c.query(
          `INSERT INTO outlet_processes(id,outlet_id,process_id,active) SELECT gen_random_uuid(),$1,id,true FROM food_processes WHERE code=$2 ON CONFLICT DO NOTHING`,
          [outlet.id, code]
        );
      }
      for (const code of (b.equipmentCodes || [])) {
        await c.query(
          `INSERT INTO equipment(id,outlet_id,equipment_type_id,name,calibration_required,status) SELECT gen_random_uuid(),$1,id,name,false,'active' FROM equipment_types WHERE code=$2`,
          [outlet.id, code]
        );
      }
      return { organisationId: org.id, outletId: outlet.id, userId: u.id };
    });

    const sessionToken = createSessionToken({
      userId: result.userId,
      organisationId: result.organisationId,
      outletId: result.outletId,
      role: 'org_admin',
      journey: 'restaurant'
    });

    const res = NextResponse.json({ data: result, error: null }, { status: 201 });
    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());
    for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
      res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
    }
    return res;
  } catch (e: any) {
    if (e?.code === 'DUPLICATE_ACCOUNT' || e?.code === '23505') {
      return fail('DUPLICATE_ACCOUNT', e?.message || 'An account with this email already exists.', 409);
    }
    if (e?.code === 'CONFIGURATION_ERROR') {
      return fail('CONFIGURATION_ERROR', e?.message || 'Database configuration error', 500);
    }
    return fail('VALIDATION_OR_DATABASE_ERROR', e?.message || 'Unable to create organisation', 400);
  }
}
