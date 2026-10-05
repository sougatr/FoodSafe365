import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyClaimToken, markClaimTokenUsed, updateRestaurantStatus, getRestaurantEntry } from '@/lib/unclaimed-restaurant-store';
import { fail, ok } from '@/lib/response';

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
    const restaurantId = params.restaurant_id?.trim();
    if (!restaurantId) {
      return fail('VALIDATION_ERROR', 'Restaurant ID is required', 400);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return fail('VALIDATION_ERROR', 'Invalid JSON payload', 400);
    }

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

    // Set auth cookies for this restaurant tenant
    const cookiesToSet: Record<string, string> = {
      'fs_user_id': `usr-${Date.now()}`,
      'fs_org_id': `org-${restaurantId}`,
      'fs_outlet_id': restaurantId,
      'fs_role': 'outlet_manager'
    };

    for (const [k, v] of Object.entries(cookiesToSet)) {
      res.cookies.set(k, v, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
    }

    return res;
  } catch (err: any) {
    console.error('[API restaurant claim POST] Error:', err);
    return fail('INTERNAL_ERROR', err?.message || 'Failed to claim restaurant profile', 500);
  }
}
