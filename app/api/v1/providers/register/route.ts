import { NextResponse } from 'next/server';
import { registerServiceProvider, CONTROLLED_SERVICE_CATEGORIES } from '../../../../../lib/service-provider-store';
import { fail } from '../../../../../lib/response';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../../../../lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '../../../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../../../lib/body-guard';
import { hashPassword } from '../../../../../lib/passwords';
import { assertDatabaseConfigured } from '../../../../../lib/db-config';
import { sendProviderOnboardingAlert } from '../../../../../lib/email-service';

export const dynamic = 'force-dynamic';

const VALID_CATEGORY_IDS = new Set(CONTROLLED_SERVICE_CATEGORIES.map(c => c.id));

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit: 10 provider registrations per 15 minutes per IP
    const rlResult = await checkRateLimit({
      key: `rl:onboard:provider:${clientIp}`,
      limit: 10,
      windowSeconds: 15 * 60
    });

    if (!rlResult.allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many registration requests. Please try again later.' } },
        { status: 429, headers: createRateLimitHeaders(rlResult) }
      );
    }

    const dbConfig = assertDatabaseConfigured();
    if (!dbConfig.ok) {
      console.warn('[providers/register POST] Database not configured; using fallback provider store.');
    }

    // Body limit: 1 MB
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return fail(parseRes.code, parseRes.message, parseRes.status);
    }
    const body = parseRes.data;

    const {
      businessName,
      contactName,
      mobile,
      email,
      password,
      address,
      city,
      state,
      categories,
      description
    } = body || {};

    if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
      return fail('VALIDATION_ERROR', 'Business name is required (at least 2 characters)', 400);
    }

    if (!contactName || typeof contactName !== 'string' || contactName.trim().length < 2) {
      return fail('VALIDATION_ERROR', 'Contact person name is required', 400);
    }

    if (!mobile || typeof mobile !== 'string' || mobile.trim().replace(/\D/g, '').length < 8) {
      return fail('VALIDATION_ERROR', 'Valid contact mobile number is required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return fail('VALIDATION_ERROR', 'A valid email address is required', 400);
    }

    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return fail('VALIDATION_ERROR', 'City / operating location is required', 400);
    }

    let passwordHash: string | undefined = undefined;
    if (password !== undefined && password !== null && String(password) !== '') {
      const rawPassword = String(password);
      if (rawPassword.length < 8) {
        return fail('VALIDATION_ERROR', 'Password must be at least 8 characters', 400);
      }
      passwordHash = await hashPassword(rawPassword);
    }

    // Categories normalization & validation
    let catList: string[] = [];
    if (Array.isArray(categories)) {
      catList = categories.filter(c => typeof c === 'string');
    } else if (typeof categories === 'string' && categories.trim()) {
      catList = [categories.trim()];
    }

    if (catList.length === 0) {
      return fail('VALIDATION_ERROR', 'At least one service category must be selected', 400);
    }

    const invalidCats = catList.filter(c => !VALID_CATEGORY_IDS.has(c));
    if (invalidCats.length > 0) {
      return fail('VALIDATION_ERROR', `Invalid service categories: ${invalidCats.join(', ')}`, 400);
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return fail('VALIDATION_ERROR', 'A short description of food-safety services offered is required', 400);
    }

    const provider = await registerServiceProvider({
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      address: typeof address === 'string' ? address.trim() : '',
      city: city.trim(),
      state: typeof state === 'string' ? state.trim() : 'Maharashtra',
      categories: catList,
      description: description.trim(),
      passwordHash
    });

    // P0: Dispatch real-time automated onboarding email alert to foodsafe365@gmail.com
    try {
      await sendProviderOnboardingAlert({
        providerId: provider.id,
        businessName: provider.businessName,
        contactName: provider.contactName,
        mobile: provider.mobile,
        email: provider.email,
        city: provider.city,
        categories: provider.categories,
        description: provider.description
      });
    } catch (emailErr) {
      console.warn('[API /providers/register] Email alert warning:', emailErr);
    }

    const sessionToken = createSessionToken({
      userId: provider.id,
      organisationId: `org-${provider.id}`,
      outletId: 'none',
      role: 'vendor',
      providerId: provider.id,
      journey: 'provider'
    });

    const response = NextResponse.json({ data: provider, error: null }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    // Clean up any legacy plaintext cookies
    for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
      response.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
    }

    return response;
  } catch (error: any) {
    console.error('[API /providers/register] Registration failed:', error);
    const msg = error?.message || 'Failed to register service provider';
    return fail('INTERNAL_SERVER_ERROR', msg, 500);
  }
}
