import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyClaimTokenAsync,
  markClaimTokenUsedAsync,
  updateRestaurantStatusAsync,
  getRestaurantEntryAsync
} from '../../../../../../lib/unclaimed-restaurant-store';
import { fail, ok } from '../../../../../../lib/response';
import { createSessionToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../../../../../lib/session';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '../../../../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../../../../lib/body-guard';
import { POPULAR_RESTAURANTS } from '../../../../../../lib/restaurantsData';

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
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
    }

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

    // Check existing restaurant entry and status
    let restaurant = await getRestaurantEntryAsync(restaurantId);
    if (!restaurant) {
      const catalogItem = POPULAR_RESTAURANTS.find(r => r.id === restaurantId);
      if (catalogItem) {
        restaurant = {
          id: catalogItem.id,
          name: catalogItem.name,
          businessType: 'RESTAURANT',
          city: catalogItem.city,
          location: catalogItem.location,
          status: (catalogItem.status as any) || 'UNCLAIMED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }

    if (!restaurant) {
      return fail('NOT_FOUND', `Restaurant with ID '${restaurantId}' not found`, 404);
    }

    if (restaurant.status === 'CLAIMED' || restaurant.status === 'ACTIVE' || restaurant.status === 'ONBOARDED') {
      return fail('INVALID_STATE', 'Restaurant profile has already been claimed.', 409);
    }

    // 1. Verify claim token cryptographically
    const verification = await verifyClaimTokenAsync(token, restaurantId);
    if (!verification.valid) {
      return fail('FORBIDDEN', `Claim token verification failed: ${verification.reason}`, 403);
    }

    // 2. Mark token as used (single-use enforcement)
    const claimedBy = managerEmail || managerName;
    const marked = await markClaimTokenUsedAsync(token, claimedBy);
    if (!marked) {
      return fail('CONFLICT', 'Claim token has already been used or has expired.', 409);
    }

    // 3. Update restaurant status to CLAIMED
    const updated = await updateRestaurantStatusAsync(restaurantId, 'CLAIMED', claimedBy);

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
    return fail('DATABASE_ERROR', 'Failed to claim restaurant profile.', 500);
  }
}
