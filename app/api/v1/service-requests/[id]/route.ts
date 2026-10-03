import { getAuthContext } from '@/lib/auth';
import { 
  getServiceRequestById, 
  updateServiceRequestStatus, 
  ServiceRequestStatus 
} from '@/lib/service-provider-store';
import { query } from '@/lib/db';
import { updateDemoAction } from '@/lib/demo-store';
import { ok, fail } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return fail('UNAUTHENTICATED', 'Authentication required', 401);
    }

    const request = await getServiceRequestById(params.id);
    if (!request) {
      return fail('NOT_FOUND', 'Service request not found', 404);
    }

    const isProvider = auth.role === 'vendor' || auth.role === 'provider' || !!auth.providerId;
    const activeProviderId = auth.providerId || auth.userId;

    if (isProvider) {
      if (request.providerId !== activeProviderId) {
        return fail('FORBIDDEN', 'Access denied to service requests of other providers', 403);
      }
    } else {
      if (request.outletId !== auth.outletId && auth.role !== 'admin' && auth.role !== 'superadmin') {
        return fail('FORBIDDEN', 'Access denied to service requests of other restaurant outlets', 403);
      }
    }

    // Customer privacy safeguard
    return ok({
      id: request.id,
      organisationId: request.organisationId,
      outletId: request.outletId,
      outletName: request.outletName,
      outletCity: request.outletCity,
      correctiveActionId: request.correctiveActionId,
      correctiveActionTitle: request.correctiveActionTitle,
      providerId: request.providerId,
      providerName: request.providerName,
      serviceCategory: request.serviceCategory,
      problemDescription: request.problemDescription,
      notes: request.notes,
      status: request.status,
      requestedAt: request.requestedAt,
      scheduledAt: request.scheduledAt,
      completedAt: request.completedAt,
      confirmedAt: request.confirmedAt
    });
  } catch (error: any) {
    console.error('[API /service-requests/[id]] Error retrieving request:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to retrieve service request', 500);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return fail('UNAUTHENTICATED', 'Authentication required', 401);
    }

    const request = await getServiceRequestById(params.id);
    if (!request) {
      return fail('NOT_FOUND', 'Service request not found', 404);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return fail('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    const { status: targetStatus, notes } = body || {};

    if (!targetStatus || typeof targetStatus !== 'string') {
      return fail('VALIDATION_ERROR', 'Target status is required', 400);
    }

    const validStatuses: ServiceRequestStatus[] = [
      'requested',
      'accepted',
      'in_progress',
      'completed',
      'restaurant_confirmed',
      'declined',
      'cancelled'
    ];

    if (!validStatuses.includes(targetStatus as ServiceRequestStatus)) {
      return fail('VALIDATION_ERROR', `Invalid target status: ${targetStatus}`, 400);
    }

    const isProvider = auth.role === 'vendor' || auth.role === 'provider' || !!auth.providerId;
    const activeProviderId = auth.providerId || auth.userId;

    if (isProvider) {
      if (request.providerId !== activeProviderId) {
        return fail('FORBIDDEN', 'Provider cannot modify requests assigned to another provider', 403);
      }

      // Provider permissions:
      // Can accept or decline a requested job
      // Can start (in_progress) or complete an accepted job
      const providerAllowedTransitions: Record<string, string[]> = {
        requested: ['accepted', 'declined'],
        accepted: ['in_progress', 'completed'],
        in_progress: ['completed']
      };

      const allowedNext = providerAllowedTransitions[request.status] || [];
      if (!allowedNext.includes(targetStatus)) {
        return fail(
          'INVALID_TRANSITION',
          `Cannot transition service request from "${request.status}" to "${targetStatus}" as provider. Allowed: ${allowedNext.join(', ')}`,
          400
        );
      }
    } else {
      // Restaurant manager permissions
      if (request.outletId !== auth.outletId && auth.role !== 'admin' && auth.role !== 'superadmin') {
        return fail('FORBIDDEN', 'Access denied to service requests of other restaurant outlets', 403);
      }

      const restaurantAllowedTransitions: Record<string, string[]> = {
        requested: ['cancelled'],
        completed: ['restaurant_confirmed']
      };

      const allowedNext = restaurantAllowedTransitions[request.status] || [];
      if (!allowedNext.includes(targetStatus)) {
        return fail(
          'INVALID_TRANSITION',
          `Cannot transition service request from "${request.status}" to "${targetStatus}" as restaurant. Allowed: ${allowedNext.join(', ')}`,
          400
        );
      }
    }

    const updated = await updateServiceRequestStatus(
      params.id,
      targetStatus as ServiceRequestStatus,
      typeof notes === 'string' ? notes : undefined
    );

    // CRITICAL: When restaurant confirms service completion:
    // Move the linked corrective action to awaiting_verification!
    if (targetStatus === 'restaurant_confirmed' && updated?.correctiveActionId) {
      if (process.env.DATABASE_URL) {
        try {
          await query(
            `UPDATE corrective_actions SET status = 'awaiting_verification' WHERE id = $1`,
            [updated.correctiveActionId]
          );
        } catch (dbErr) {
          console.warn('[service-requests/[id]] Failed to update corrective action status in DB:', dbErr);
        }
      } else {
        try {
          updateDemoAction(updated.correctiveActionId, { status: 'awaiting_verification' }, auth.userId);
        } catch (demoErr) {
          console.warn('[service-requests/[id]] Failed to update demo corrective action status:', demoErr);
        }
      }
    }

    return ok(updated);
  } catch (error: any) {
    console.error('[API /service-requests/[id]] Status update failed:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to update service request status', 500);
  }
}
