import { ok, fail } from '@/lib/response';
import { getActiveGroceryAlerts } from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requestedOutlet = url.searchParams.get('outletId');

  const auth = await authorizeGroceryAccess(requestedOutlet, req);
  if (!auth.ok) {
    return fail(auth.code, auth.message, auth.status);
  }

  const alerts = getActiveGroceryAlerts(auth.outletId);

  return ok({
    alerts,
    counts: {
      total: alerts.length,
      red: alerts.filter(a => a.severity === 'RED').length,
      amber: alerts.filter(a => a.severity === 'AMBER').length,
      green: alerts.filter(a => a.severity === 'GREEN').length
    }
  });
}
