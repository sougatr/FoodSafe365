import { ok, fail } from '@/lib/response';
import { getGroceryDashboardSummary } from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requestedOutlet = url.searchParams.get('outletId');

  const auth = await authorizeGroceryAccess(requestedOutlet, req);
  if (!auth.ok) {
    return fail(auth.code, auth.message, auth.status);
  }

  const summary = getGroceryDashboardSummary(auth.outletId);
  return ok(summary);
}
