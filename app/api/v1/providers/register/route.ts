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

    const cleanBusiness = (businessName && typeof businessName === 'string' && businessName.trim().length >= 2)
      ? businessName.trim()
      : 'Food Safety Service Partner';

    const cleanContact = (contactName && typeof contactName === 'string' && contactName.trim().length >= 2)
      ? contactName.trim()
      : 'Service Representative';

    let cleanMobile = typeof mobile === 'string' ? mobile.trim() : '';
    if (!cleanMobile) {
      cleanMobile = '8390367199';
    }

    let cleanEmail = typeof email === 'string' ? email.trim() : '';
    if (!cleanEmail) {
      cleanEmail = 'partner@foodsafe365.in';
    } else if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@gmail.com`;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      cleanEmail = 'partner@foodsafe365.in';
    }

    const cleanCity = (typeof city === 'string' && city.trim()) ? city.trim() : 'India';

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
      catList = categories.filter(c => typeof c === 'string' && VALID_CATEGORY_IDS.has(c));
    } else if (typeof categories === 'string' && categories.trim() && VALID_CATEGORY_IDS.has(categories.trim())) {
      catList = [categories.trim()];
    }

    if (catList.length === 0) {
      catList = ['pest_control'];
    }

    const cleanDescription = (description && typeof description === 'string' && description.trim().length >= 5)
      ? description.trim()
      : 'Food safety compliance service partner offering accredited kitchen hygiene services.';

    const provider = await registerServiceProvider({
      businessName: cleanBusiness,
      contactName: cleanContact,
      mobile: cleanMobile,
      email: cleanEmail.toLowerCase(),
      address: typeof address === 'string' ? address.trim() : '',
      city: cleanCity,
      state: typeof state === 'string' ? state.trim() : 'Maharashtra',
      categories: catList,
      description: cleanDescription,
      passwordHash
    });

    // P0: Dispatch real-time automated onboarding email alert to foodsafe365@gmail.com
    let emailAlertResult: any = null;
    try {
      emailAlertResult = await sendProviderOnboardingAlert({
        providerId: provider.id,
        businessName: provider.businessName,
        contactName: provider.contactName,
        mobile: provider.mobile,
        email: provider.email,
        city: provider.city,
        categories: provider.categories,
        description: provider.description
      });
      console.log('[API /providers/register] Email alert result:', emailAlertResult);
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

    const response = NextResponse.json({ data: provider, emailAlertResult, error: null }, { status: 201 });
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
