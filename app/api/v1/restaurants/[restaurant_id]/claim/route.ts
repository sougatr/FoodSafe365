import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyClaimToken, markClaimTokenUsed, updateRestaurantStatus, getRestaurantEntry } from '@/lib/unclaimed-restaurant-store';
import { fail, ok } from '@/lib/response';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limiter';
import { parseBoundedJson } from '@/lib/body-guard';

const ClaimSchema = z.object({
  token: z.string().min(8, 'Valid claim token is required'),
  managerName: z.string().min(1, 'Manager name is required').default('Restaurant Manager'),
  managerEmail: z.string().email('Valid business email is required').optional(),
  managerMobile: z.string().optional(),
  password: z.string().optional()
});

export async function POST(
  req: NextRequest,
  { params }: { params: { restaurant_id: string } }
) {
  try {
    const clientIp = getClientIp(req);
    const restaurantId = params.restaurant_id?.trim();
    if (!restaurantId) {
      return fail('VALIDATION_ERROR', 'Restaurant ID is required', 400);
    }

    // Rate limit: 5 claim attempts per 15 minutes per IP
    const rlResult = await checkRateLimit({
      key: `rl:claim:${clientIp}:${restaurantId}`,
      limit: 5,
      windowSeconds: 15 * 60
    });

    if (!rlResult.allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many claim attempts. Please try again later.' } },
        { status: 429, headers: createRateLimitHeaders(rlResult) }
      );
    }

    // Body limit: 1 MB
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return fail(parseRes.code, parseRes.message, parseRes.status);
    }
    const body = parseRes.data;

    const parseResult = ClaimSchema.safeParse(body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return fail('VALIDATION_ERROR', msg, 400);
    }

    const { token, managerName, managerEmail } = parseResult.data;

    // 1. Verify claim token cryptographically
    const verification = verifyClaimToken(token, restaurantId);
    if (!verification.valid) {
      return fail('FORBIDDEN', `Claim token verification failed: ${verification.reason}`, 403);
    }

    // 2. Mark token as used
    const claimedBy = managerEmail || managerName;
    markClaimTokenUsed(token, claimedBy);

    // 3. Update restaurant status to CLAIMED
    const updated = updateRestaurantStatus(restaurantId, 'CLAIMED', claimedBy);

    // 4. Return success response and set manager authentication cookies for seamless onboarding
    const res = NextResponse.json({
      data: {
        success: true,
        restaurant: updated,
        message: `Successfully claimed profile for ${updated.name}. Restaurant status is now CLAIMED.`,
        manager: {
          name: managerName,
          email: managerEmail,
          outletId: restaurantId,
          role: 'outlet_manager'
        }
      },
      error: null
    }, { status: 200 });

    // Mint cryptographically signed session token for claimed restaurant manager
    const sessionToken = createSessionToken({
      userId: `usr-${Date.now()}`,
      organisationId: `org-${restaurantId}`,
      outletId: restaurantId,
      role: 'outlet_manager'
    });

    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    // Clean up legacy cookies
    for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role']) {
      res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
    }

    return res;
  } catch (err: any) {
    console.error('[API restaurant claim POST] Error:', err);
    return fail('INTERNAL_ERROR', err?.message || 'Failed to claim restaurant profile', 500);
  }
}
