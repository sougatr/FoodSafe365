import { NextRequest } from 'next/server';
import { getAuthContext } from '../../../../../lib/auth';
import { can } from '../../../../../lib/permissions';
import { ok, fail } from '../../../../../lib/response';
import { getDemoPlan } from '../../../../../lib/demo-haccp';
import { loadPlanWithDetails, checkPlanTenantAccess } from '../../../../../lib/haccp-service';
import { PATCH as patchRootHandler } from '../route';

export async function GET(
  req: Request,
  { params }: { params: { plan_id: string } }
) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'haccp:read')) return fail('FORBIDDEN', 'You do not have permission to view HACCP plans', 403);
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant HACCP operations', 403);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  const planId = params.plan_id?.trim();
  if (!planId) {
    return fail('VALIDATION_ERROR', 'Plan ID is required', 400);
  }

  if (!process.env.DATABASE_URL) {
    if (planId === 'demo-haccp') {
      return ok({ demo: true, plan: getDemoPlan() });
    }
    return fail('NOT_FOUND', 'HACCP plan not found', 404);
  }

  try {
    const plan = await loadPlanWithDetails(planId);
    if (!plan) {
      return fail('NOT_FOUND', 'HACCP plan not found', 404);
    }

    if (!checkPlanTenantAccess(auth, plan)) {
      return fail('FORBIDDEN', 'Access denied to HACCP plan for this tenant', 403);
    }

    return ok({ demo: false, plan });
  } catch (err: any) {
    console.error('[HACCP plan_id GET error]', err);
    return fail('DATABASE_ERROR', 'Failed to retrieve HACCP plan.', 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { plan_id: string } }
) {
  const planId = params.plan_id?.trim();
  if (!planId) {
    return fail('VALIDATION_ERROR', 'Plan ID is required', 400);
  }

  // Parse original body and attach plan_id
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  body.planId = planId;

  // Re-encode request for root patch handler
  const syntheticReq = new Request(req.url, {
    method: 'PATCH',
    headers: req.headers,
    body: JSON.stringify(body)
  });

  return patchRootHandler(syntheticReq);
}
