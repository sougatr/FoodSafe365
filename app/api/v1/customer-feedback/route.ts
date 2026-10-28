import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ok, fail } from '../../../../lib/response';
import { getCustomerFeedback, saveCustomerFeedback } from '../../../../lib/customer-feedback-store';
import { authorizeFeedbackAccess } from '../../../../lib/tenant';
import { DinerSafetyRating } from '../../../../lib/foodsafety28';
import { sendCustomerRatingAlert } from '../../../../lib/email-service';
import { resolveRestaurantName } from '../../../../lib/restaurantsData';
import {
  ensureRestaurantDirectoryEntryAsync,
  generateClaimTokenAsync
} from '../../../../lib/unclaimed-restaurant-store';
import { sendRatingAlertSms } from '../../../../lib/sms-service';

function maskDinerPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const p = phone.trim();
  if (p.length <= 4) return '***';
  return p.slice(0, p.length - 5) + '****' + p.slice(-1);
}

/**
 * GET /api/v1/customer-feedback
 * Retrieves Customer Food-Safety Ratings from authoritative persistent storage.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const requestedOutletId = url.searchParams.get('outletId');
    const isExplicitDemo = url.searchParams.get('demo') === 'true';

    // 1. Enforce Server-Side Tenant Authorization
    const authResult = await authorizeFeedbackAccess(requestedOutletId, req, isExplicitDemo);
    if (!authResult.ok) {
      return fail(authResult.code, authResult.message, authResult.status);
    }

    // 2. Fetch from Authoritative Storage
    const { ratings, storage, count } = await getCustomerFeedback(authResult.targetOutletId);

    // 3. Privacy Safeguard: Mask sensitive customer contact data
    const sanitizedRatings = ratings.map(r => ({
      ...r,
      dinerMobile: maskDinerPhone(r.dinerMobile),
    }));

    return NextResponse.json({
      data: {
        ratings: sanitizedRatings,
        outletId: authResult.targetOutletId || 'all',
        storage,
        count: sanitizedRatings.length,
        authenticatedUser: {
          userId: authResult.auth.userId,
          role: authResult.auth.role,
          authorizedOutletId: authResult.auth.outletId
        }
      },
      error: null
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-FoodSafe-Storage': storage
      }
    });
  } catch (err: any) {
    console.error('[API /customer-feedback GET] Error:', err);
    return fail('INTERNAL_ERROR', 'Failed to retrieve customer feedback.', 500);
  }
}

/**
 * POST /api/v1/customer-feedback
 * Direct, robust submission of Diner Food-Safety Ratings.
 * Guaranteed to dispatch real-time email alerts via Resend to foodsafe365@gmail.com.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const rawOutletId = body.outletId || body.restaurantId;
    const rawOutletName = body.outletName || body.restaurantName;
    const outletId = String(rawOutletId || 'the-table').trim();
    const outletName = resolveRestaurantName(outletId, rawOutletName);
    const tableNumber = body.tableNumber || body.tableCode ? String(body.tableNumber || body.tableCode).trim() : 'Table QR';
    const dinerName = body.dinerName || body.customerName ? String(body.dinerName || body.customerName).trim() : 'Verified Diner';
    const dinerMobile = body.dinerMobile || body.customerPhone ? String(body.dinerMobile || body.customerPhone).trim() : undefined;
    const customerEmail = body.customerEmail || body.dinerEmail ? String(body.customerEmail || body.dinerEmail).trim() : undefined;
    const customerPhone = body.customerPhone || body.dinerMobile ? String(body.customerPhone || body.dinerMobile).trim() : undefined;
    const feedback = body.feedback ? String(body.feedback).trim() : '';
    const responseRequested = Boolean(body.responseRequested);

    // Auto-ensure restaurant is registered in FoodSafe365 directory
    let directoryEntry: any = null;
    try {
      directoryEntry = await ensureRestaurantDirectoryEntryAsync(outletId, outletName);
    } catch (dirErr) {
      console.warn('[customer-feedback] Directory ensure warning:', dirErr);
    }

    const isUnclaimed = directoryEntry
      ? (directoryEntry.status !== 'CLAIMED' && directoryEntry.status !== 'ACTIVE' && directoryEntry.status !== 'ONBOARDED')
      : (typeof body.isUnclaimed === 'boolean' ? body.isUnclaimed : true);

    let claimUrl: string | undefined = body.claimUrl;
    if (isUnclaimed && !claimUrl) {
      try {
        const tokenRec = await generateClaimTokenAsync(outletId);
        claimUrl = `https://foodsafe365.in/claim/${encodeURIComponent(outletId)}?token=${encodeURIComponent(tokenRec.token)}`;
      } catch (tokenErr) {
        console.warn('[customer-feedback] Claim token generation warning:', tokenErr);
        claimUrl = `https://foodsafe365.in/claim/${encodeURIComponent(outletId)}`;
      }
    }

    const scores = {
      cleanliness: Number(body.scores?.cleanliness) || 5,
      staffHygiene: Number(body.scores?.staffHygiene) || 5,
      foodFreshness: Number(body.scores?.foodFreshness) || 5,
      safeWater: Number(body.scores?.safeWater) || 5,
      washroom: Number(body.scores?.washroom) || 5,
    };

    const overallScore = Number(body.overallScore) || 5.0;

    const ratingRecord: DinerSafetyRating = {
      id: body.id || `cfr-${Date.now()}-${randomUUID().slice(0, 8)}`,
      outletId,
      outletName,
      createdAt: new Date().toISOString(),
      dinerName,
      dinerMobile,
      tableNumber,
      scores,
      overallScore,
      feedback,
      verifiedDineIn: true,
      responseRequested,
      consentToShareContact: responseRequested,
      customerEmail,
      customerPhone,
    };

    // 1. P0 Real-Time Alert Dispatch directly via Resend
    let alertResult: any = null;
    try {
      alertResult = await sendCustomerRatingAlert({
        restaurantId: outletId,
        restaurantName: outletName,
        tableNumber,
        overallScore,
        scores,
        feedback,
        customerName: dinerName,
        customerEmail,
        customerPhone,
        responseRequested,
        isUnclaimed,
        claimUrl
      });
      console.log('[customer-feedback] sendCustomerRatingAlert completed:', alertResult);
    } catch (alertErr: any) {
      console.error('[customer-feedback] Alert dispatch error:', alertErr?.message || alertErr);
      alertResult = { success: false, error: alertErr?.message || String(alertErr) };
    }

    // 1b. Real-Time SMS Alert Dispatch to Admin (8356055834) via Fast2SMS
    let smsAlertResult: any = null;
    try {
      smsAlertResult = await sendRatingAlertSms({
        restaurantName: outletName,
        overallScore,
        customerName: dinerName,
        customerPhone: customerPhone || dinerMobile,
        feedback,
        tableNumber
      });
      console.log('[customer-feedback] sendRatingAlertSms completed:', smsAlertResult);
    } catch (smsErr: any) {
      console.warn('[customer-feedback] SMS alert warning:', smsErr?.message || smsErr);
    }

    // 2. Storage Persistence (Non-blocking)
    let storage: 'postgresql' | 'server_file' = 'server_file';
    try {
      const saveRes = await saveCustomerFeedback(ratingRecord);
      storage = saveRes.storage;
    } catch (saveErr) {
      console.warn('[customer-feedback] Save fallback warning:', saveErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        rating: ratingRecord,
        storage,
        alertResult,
        message: 'Your Customer Food-Safety Rating has been recorded and an automated alert has been dispatched to kitchen management and FoodSafe365.'
      },
      error: null
    }, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
        'X-FoodSafe-Storage': storage
      }
    });
  } catch (err: any) {
    console.error('[API /customer-feedback POST] Fatal error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to process feedback: ' + (err?.message || String(err))
    }, { status: 500 });
  }
}
