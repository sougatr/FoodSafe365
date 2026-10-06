import { getAuthContext } from '@/lib/auth';
import { 
  listServiceRequests, 
  createServiceRequest, 
  getServiceProviderById 
} from '@/lib/service-provider-store';
import { ok, fail } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return fail('UNAUTHENTICATED', 'Authentication required to view service requests', 401);
    }

    const { searchParams } = new URL(req.url);
    const correctiveActionId = searchParams.get('correctiveActionId') || undefined;
    const requestedOutletId = searchParams.get('outletId') || undefined;
    const requestedProviderId = searchParams.get('providerId') || undefined;

    const isProvider = auth.role === 'vendor' || auth.role === 'provider' || !!auth.providerId;

    let filter: { outletId?: string; providerId?: string; correctiveActionId?: string } = {};

    if (isProvider) {
      const activeProviderId = auth.providerId || auth.userId;
      // Providers can ONLY view service requests assigned to their provider ID
      filter = {
        providerId: activeProviderId,
        correctiveActionId
      };
    } else {
      // Restaurant users can ONLY view service requests for their assigned outlet
      const outletId = auth.outletId || requestedOutletId;
      if (!outletId || outletId === 'none') {
        return fail('FORBIDDEN', 'Restaurant user must have an active outlet context', 403);
      }
      // If user specifies outletId, ensure it matches their auth outlet unless admin
      if (requestedOutletId && requestedOutletId !== auth.outletId && auth.role !== 'admin' && auth.role !== 'superadmin') {
        return fail('FORBIDDEN', 'Access denied to requests of other restaurant outlets', 403);
      }

      filter = {
        outletId: auth.outletId,
        providerId: requestedProviderId,
        correctiveActionId
      };
    }

    const requests = await listServiceRequests(filter);

    // Customer privacy safeguard: ensure no customer personal details leaked
    const sanitized = requests.map(r => ({
      id: r.id,
      organisationId: r.organisationId,
      outletId: r.outletId,
      outletName: r.outletName,
      outletCity: r.outletCity,
      outletAddress: r.outletAddress,
      correctiveActionId: r.correctiveActionId,
      correctiveActionTitle: r.correctiveActionTitle,
      providerId: r.providerId,
      providerName: r.providerName,
      serviceCategory: r.serviceCategory,
      problemDescription: r.problemDescription,
      priority: r.priority,
      contactPerson: r.contactPerson,
      contactPhone: r.contactPhone,
      notes: r.notes,
      completionNotes: r.completionNotes,
      rejectionNotes: r.rejectionNotes,
      status: r.status,
      requestedAt: r.requestedAt,
      scheduledAt: r.scheduledAt,
      completedAt: r.completedAt,
      confirmedAt: r.confirmedAt,
      auditTrail: r.auditTrail || []
    }));

    return ok(sanitized);
  } catch (error: any) {
    console.error('[API /service-requests] Error fetching requests:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to retrieve service requests', 500);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return fail('UNAUTHENTICATED', 'Authentication required to create a service request', 401);
    }

    if (auth.role === 'vendor' || auth.role === 'provider') {
      return fail('FORBIDDEN', 'Service providers cannot initiate restaurant service requests', 403);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return fail('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    const {
      correctiveActionId,
      correctiveActionTitle,
      providerId,
      providerName,
      serviceCategory,
      problemDescription,
      priority,
      contactPerson,
      contactPhone,
      notes,
      scheduledAt,
      outletName,
      outletCity,
      outletAddress
    } = body || {};

    if (!correctiveActionId || typeof correctiveActionId !== 'string') {
      return fail('VALIDATION_ERROR', 'Corrective action ID reference is required', 400);
    }

    if (!providerId || typeof providerId !== 'string') {
      return fail('VALIDATION_ERROR', 'Service provider ID is required', 400);
    }

    if (!serviceCategory || typeof serviceCategory !== 'string') {
      return fail('VALIDATION_ERROR', 'Service category is required', 400);
    }

    if (!problemDescription || typeof problemDescription !== 'string' || problemDescription.trim().length < 5) {
      return fail('VALIDATION_ERROR', 'A clear food-safety issue/problem description is required', 400);
    }

    // Verify provider exists if possible
    let resolvedProviderName = providerName;
    const provider = await getServiceProviderById(providerId);
    if (provider) {
      resolvedProviderName = provider.businessName;
    }

    const request = await createServiceRequest({
      organisationId: auth.organisationId || 'demo-org',
      outletId: auth.outletId || 'demo-outlet',
      outletName: (outletName || 'Restaurant Kitchen').trim(),
      outletCity: (outletCity || 'Mumbai').trim(),
      outletAddress: (outletAddress || '').trim(),
      correctiveActionId: correctiveActionId.trim(),
      correctiveActionTitle: (correctiveActionTitle || 'Food-Safety Corrective Action').trim(),
      providerId: providerId.trim(),
      providerName: (resolvedProviderName || 'FoodSafe Service Partner').trim(),
      serviceCategory: serviceCategory.trim(),
      problemDescription: problemDescription.trim(),
      priority: priority || 'high',
      contactPerson: (contactPerson || 'Duty Manager').trim(),
      contactPhone: (contactPhone || '').trim(),
      notes: typeof notes === 'string' ? notes.trim() : '',
      scheduledAt: typeof scheduledAt === 'string' ? scheduledAt.trim() : undefined
    });

    return ok(request, 201);
  } catch (error: any) {
    console.error('[API /service-requests] Creation failed:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to create service request', 500);
  }
}
