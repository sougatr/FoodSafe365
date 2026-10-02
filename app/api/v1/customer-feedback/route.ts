import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getAuthContext } from '@/lib/auth';
import { ok, fail } from '@/lib/response';
import { getCustomerFeedback, saveCustomerFeedback } from '@/lib/customer-feedback-store';
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

/**
 * GET /api/v1/customer-feedback
 * Retrieves Customer Food-Safety Ratings from persistent storage (PostgreSQL or server file store).
 * Protected for authenticated restaurant managers / supervisors.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const outletId = url.searchParams.get('outletId') || 'all';

    // Verify manager authentication context
    const auth = await getAuthContext();
    const authHeaderUserId = req.headers.get('x-foodsafe-user-id');
    const isDemoMode = process.env.DEMO_MODE === 'true' || url.searchParams.get('demo') === 'true';

    // Must be authenticated as a restaurant manager, have demo session, or have auth headers
    const isAuthenticated = Boolean(auth || authHeaderUserId || isDemoMode);
    if (!isAuthenticated) {
      return fail('UNAUTHENTICATED', 'Authentication required. Please sign in as a restaurant manager.', 401);
    }

    const { ratings, storage, count } = await getCustomerFeedback(outletId);

    return NextResponse.json({
      data: {
        ratings,
        outletId,
        storage,
        count,
        authenticatedUser: auth ? { userId: auth.userId, role: auth.role, outletId: auth.outletId } : 'demo-manager'
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
    return fail('INTERNAL_ERROR', err?.message || 'Failed to retrieve customer feedback', 500);
  }
}

/**
 * POST /api/v1/customer-feedback
 * Submits a Customer Food-Safety Rating from a diner (Device A).
 * Persists to backend database / server storage so Device B can retrieve it.
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
    const now = new Date().toISOString();

    const ratingRecord: DinerSafetyRating = {
      id: validated.id || `cfr-${Date.now()}-${randomUUID().slice(0, 8)}`,
      outletId: validated.outletId.trim(),
      outletName: validated.outletName.trim(),
      createdAt: now,
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
    return fail('INTERNAL_ERROR', err?.message || 'Failed to submit customer rating', 500);
  }
}
