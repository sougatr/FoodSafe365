import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ok, fail } from '@/lib/response';
import { getCustomerFeedback, saveCustomerFeedback } from '@/lib/customer-feedback-store';
import { authorizeFeedbackAccess } from '@/lib/tenant';
import { DinerSafetyRating } from '@/lib/foodsafety28';

// Validation schema for incoming Customer Food-Safety Ratings
const FeedbackSchema = z.object({
  id: z.string().optional(),
  outletId: z.string().min(1, 'outletId is required'),
  outletName: z.string().min(1, 'outletName is required'),
  dinerName: z.string().max(100).optional(),
  dinerMobile: z.string().max(50).optional(),
  tableNumber: z.string().max(50).optional(),
  scores: z.object({
    cleanliness: z.number().min(1).max(5),
    staffHygiene: z.number().min(1).max(5),
    foodFreshness: z.number().min(1).max(5),
    safeWater: z.number().min(1).max(5),
    washroom: z.number().min(1).max(5),
  }),
  overallScore: z.number().min(1).max(5),
  feedback: z.string().max(1500).optional(),
  verifiedDineIn: z.boolean().default(true),
});

// Server-side sliding cache for duplicate detection & flood protection
interface SubmissionEntry {
  outletId: string;
  contextKey: string;
  contentSignature: string;
  timestamp: number;
  rating: DinerSafetyRating;
  storage: 'postgresql' | 'server_file';
}

const recentSubmissions = new Map<string, SubmissionEntry>();
const SUBMISSION_COOLDOWN_MS = 60 * 1000; // 60 seconds idempotency window
const FLOOD_LIMIT_MS = 4 * 1000;          // 4 seconds rapid-fire limit

function cleanupRecentSubmissions() {
  const now = Date.now();
  recentSubmissions.forEach((entry, key) => {
    if (now - entry.timestamp > 120 * 1000) {
      recentSubmissions.delete(key);
    }
  });
}

function maskDinerPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const p = phone.trim();
  if (p.length <= 4) return '***';
  return p.slice(0, p.length - 5) + '****' + p.slice(-1);
}

/**
 * GET /api/v1/customer-feedback
 * Retrieves Customer Food-Safety Ratings from authoritative persistent storage.
 * Enforces tenant authorization:
 * - Outlet Manager: strictly scoped to their assigned outletId (403 if attempting another outlet).
 * - Org Admin / Owner: scoped to outlets in their organisation.
 * - Platform Admin: unrestricted platform access.
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

    // 2. Fetch from Authoritative Storage (targetOutletId is enforced by the authorization layer)
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
    if (err?.message?.startsWith('DATABASE_ERROR')) {
      return fail('DATABASE_ERROR', 'Production database read operation failed.', 500);
    }
    return fail('INTERNAL_ERROR', err?.message || 'Failed to retrieve customer feedback', 500);
  }
}

/**
 * POST /api/v1/customer-feedback
 * Submits a Customer Food-Safety Rating from a diner (Device A).
 * Protected by server-side idempotency / anti-duplication cooldown.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return fail('VALIDATION_ERROR', 'Invalid JSON payload in request body', 400);
    }

    // Validate payload against schema
    const parseResult = FeedbackSchema.safeParse(body);
    if (!parseResult.success) {
      const issueMessage = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return fail('VALIDATION_ERROR', `Invalid rating data: ${issueMessage}`, 400);
    }

    const validated = parseResult.data;
    cleanupRecentSubmissions();

    // Derive client identifier for idempotency & rate-limiting
    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor || realIp || 'client';
    const contextKey = `${clientIp}::${validated.outletId}::${validated.tableNumber || 'notable'}::${validated.dinerMobile || 'nomobile'}`;
    const contentSignature = `${validated.scores.cleanliness}_${validated.scores.staffHygiene}_${validated.scores.foodFreshness}_${validated.scores.safeWater}_${validated.scores.washroom}_${validated.overallScore}::${(validated.feedback || '').toLowerCase().trim()}`;

    const now = Date.now();
    const existing = recentSubmissions.get(contextKey);

    if (existing) {
      const elapsed = now - existing.timestamp;

      // 1. Identical duplicate within 60-second window -> Idempotent acknowledgment
      if (existing.contentSignature === contentSignature && elapsed < SUBMISSION_COOLDOWN_MS) {
        return NextResponse.json({
          data: {
            rating: existing.rating,
            storage: existing.storage,
            duplicate: true,
            message: 'Your customer food-safety rating for this visit has already been received and logged. Thank you!'
          },
          error: null
        }, {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
            'X-FoodSafe-Idempotent': 'true'
          }
        });
      }

      // 2. Rapid-fire flooding limit (submitting different contents under 4s from same context)
      if (elapsed < FLOOD_LIMIT_MS) {
        return fail('RATE_LIMITED', 'Please wait a moment before submitting another rating for this restaurant.', 429);
      }
    }

    const ratingRecord: DinerSafetyRating = {
      id: validated.id || `cfr-${Date.now()}-${randomUUID().slice(0, 8)}`,
      outletId: validated.outletId.trim(),
      outletName: validated.outletName.trim(),
      createdAt: new Date().toISOString(),
      dinerName: validated.dinerName?.trim() || undefined,
      dinerMobile: validated.dinerMobile?.trim() || undefined,
      tableNumber: validated.tableNumber?.trim() || undefined,
      scores: {
        cleanliness: Math.round(validated.scores.cleanliness * 10) / 10,
        staffHygiene: Math.round(validated.scores.staffHygiene * 10) / 10,
        foodFreshness: Math.round(validated.scores.foodFreshness * 10) / 10,
        safeWater: Math.round(validated.scores.safeWater * 10) / 10,
        washroom: Math.round(validated.scores.washroom * 10) / 10,
      },
      overallScore: Math.round(validated.overallScore * 10) / 10,
      feedback: validated.feedback?.trim() || '',
      verifiedDineIn: validated.verifiedDineIn ?? true,
    };

    const { rating, storage } = await saveCustomerFeedback(ratingRecord);

    // Record submission in sliding window cache
    recentSubmissions.set(contextKey, {
      outletId: validated.outletId,
      contextKey,
      contentSignature,
      timestamp: now,
      rating,
      storage
    });

    return NextResponse.json({
      data: {
        rating,
        storage,
        message: 'Customer food-safety feedback submitted successfully and persisted to server storage.'
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
    console.error('[API /customer-feedback POST] Error:', err);
    if (err?.message?.startsWith('DATABASE_ERROR')) {
      return fail('DATABASE_ERROR', 'Production database write operation failed.', 500);
    }
    return fail('INTERNAL_ERROR', err?.message || 'Failed to submit customer rating', 500);
  }
}
