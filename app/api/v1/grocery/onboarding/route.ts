import { NextResponse } from 'next/server';
import { saveGroceryOutletAsync } from '../../../../../lib/grocery-store';
import { fail } from '../../../../../lib/response';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../../../../lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '../../../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../../../lib/body-guard';
import { hashPassword } from '../../../../../lib/passwords';
import { assertDatabaseConfigured } from '../../../../../lib/db-config';
import { sendGroceryActivationAlert } from '../../../../../lib/email-service';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit: 10 grocery onboarding attempts per 15 minutes per IP
    const rlResult = await checkRateLimit({
      key: `rl:onboard:grocery:${clientIp}`,
      limit: 10,
      windowSeconds: 15 * 60
    });

    if (!rlResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many onboarding requests. Please try again later.' } },
        { status: 429, headers: createRateLimitHeaders(rlResult) }
      );
    }

    const dbConfig = assertDatabaseConfigured();
    if (!dbConfig.ok) {
      console.warn('[grocery/onboarding POST] Database not configured; using fallback grocery store.');
    }

    // Body limit: 1 MB
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return fail(parseRes.code, parseRes.message, parseRes.status);
    }
    const body = parseRes.data;

    const name = String(body.name || '').trim();
    const city = String(body.city || 'Mumbai').trim();
    const branchName = String(body.branchName || `${city} Store`).trim();
    const address = String(body.address || '').trim() || `${name}, ${city}`;
    const dailyCheckPerson = String(body.dailyCheckPerson || '').trim();
    const managerName = String(body.managerName || dailyCheckPerson || 'Store Manager').trim();
    const contactNumber = String(body.contactNumber || 'Not provided').trim();
    const contactEmail = String(body.contactEmail || '').trim().toLowerCase();
    const fssaiNumber = String(body.fssaiNumber || '').trim();
    const storeType = body.storeType || 'supermarket';
    const selectedCategories = Array.isArray(body.selectedCategories) ? body.selectedCategories : [];

    if (!name) {
      return fail('VALIDATION_ERROR', 'Store name is required.', 400);
    }

    let passwordHash: string | undefined = undefined;
    if (body.password !== undefined && body.password !== null && String(body.password) !== '') {
      const rawPassword = String(body.password);
      if (rawPassword.length < 8) {
        return fail('VALIDATION_ERROR', 'Password must be at least 8 characters.', 400);
      }
      passwordHash = await hashPassword(rawPassword);
    }

    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const cleanBranch = (branchName || city).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const id = body.id || `store-${cleanName}-${cleanBranch}`;

    const saved = await saveGroceryOutletAsync({
      id,
      name,
      branchName,
      address,
      city,
      managerName,
      dailyCheckPerson: dailyCheckPerson || managerName,
      contactNumber,
      contactEmail: contactEmail || `manager@${id}.example.com`,
      fssaiNumber: fssaiNumber || '10000000000000',
      storeType,
      selectedCategories,
      passwordHash
    });

    // Dispatch automated grocery store activation alert to foodsafe365@gmail.com
    try {
      await sendGroceryActivationAlert({
        outletId: saved.id,
        name: saved.name,
        city: saved.city,
        managerName: saved.managerName,
        contactNumber: saved.contactNumber,
        contactEmail: saved.contactEmail,
        categories: saved.selectedCategories
      });
    } catch (emailErr) {
      console.warn('[grocery/onboarding] Failed to send activation email alert:', emailErr);
    }

    const response = NextResponse.json({
      success: true,
      data: saved
    });

    // Set cryptographically signed HTTP-only session cookie for the store manager
    const sessionToken = createSessionToken({
      userId: `mgr-${saved.id}`,
      organisationId: `org-${saved.id}`,
      outletId: saved.id,
      role: 'outlet_manager',
      journey: 'grocery'
    });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());
    response.cookies.set('fs_outlet_id', saved.id, { path: '/', httpOnly: false });
    response.cookies.set('fs_role', 'outlet_manager', { path: '/', httpOnly: false });
    response.cookies.set('fs_user_id', `mgr-${saved.id}`, { path: '/', httpOnly: false });

    return response;
  } catch (err: any) {
    const isDb = err?.code === 'DATABASE_ERROR' || err?.message?.includes('DATABASE_ERROR');
    const defaultMsg = isDb ? 'Database error occurred while onboarding grocery store.' : 'Failed to onboard grocery store.';
    const message = err?.message || defaultMsg;
    return fail(isDb ? 'DATABASE_ERROR' : 'SERVER_ERROR', message, 500);
  }
}
