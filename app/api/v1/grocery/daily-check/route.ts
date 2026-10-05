import { ok, fail } from '@/lib/response';
import { recordDailyCheck, getDailyCheckHistory } from '@/lib/grocery-store';
import { GROCERY_OPERATIONAL_CHECKS } from '@/lib/grocery-checklist-data';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requestedOutlet = url.searchParams.get('outletId');

  const auth = await authorizeGroceryAccess(requestedOutlet, req);
  if (!auth.ok) {
    return fail(auth.code, auth.message, auth.status);
  }

  const history = getDailyCheckHistory(auth.outletId);

  return ok({
    checksDefinition: GROCERY_OPERATIONAL_CHECKS,
    history,
    todayCheck: history.find(h => h.date === new Date().toISOString().slice(0, 10)) || null,
    label: 'FoodSafe365 Grocery Store Operational Check',
    subtext: 'FSSAI-aligned food-safety practices adapted for routine operational monitoring.'
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestedOutlet = body.outletId;

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return fail(auth.code, auth.message, auth.status);
    }

    if (!body.responses || typeof body.responses !== 'object') {
      return fail('VALIDATION_ERROR', 'responses object is required', 400);
    }

    const result = recordDailyCheck({
      outletId: auth.outletId,
      supervisorName: body.supervisorName || 'Duty Supervisor',
      responses: body.responses
    });

    return ok(result, 201);
  } catch (err: any) {
    return fail('SERVER_ERROR', err.message || 'Failed to record daily check', 500);
  }
}
