import { ok, fail } from '@/lib/response';
import { getStockItems, updateStockStatus } from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requestedOutlet = url.searchParams.get('outletId');
  const statusFilter = url.searchParams.get('status');

  const auth = await authorizeGroceryAccess(requestedOutlet, req);
  if (!auth.ok) {
    return fail(auth.code, auth.message, auth.status);
  }

  const allStock = getStockItems(auth.outletId);
  const filtered = statusFilter
    ? allStock.filter(s => s.status.toLowerCase() === statusFilter.toLowerCase())
    : allStock;

  // FEFO sorting: nearest expiry date first
  filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  return ok({
    stock: filtered,
    totalCount: allStock.length,
    counts: {
      active: allStock.filter(s => s.status === 'ACTIVE').length,
      nearExpiry: allStock.filter(s => s.status === 'NEAR_EXPIRY').length,
      expired: allStock.filter(s => s.status === 'EXPIRED').length,
      quarantined: allStock.filter(s => s.status === 'QUARANTINED').length,
      disposed: allStock.filter(s => s.status === 'DISPOSED').length
    }
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

    const { itemId, newStatus, user, reason } = body;
    if (!itemId || !newStatus) {
      return fail('VALIDATION_ERROR', 'itemId and newStatus are required.', 400);
    }

    if (!['ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DISPOSED'].includes(newStatus)) {
      return fail('VALIDATION_ERROR', `Invalid stock status: ${newStatus}`, 400);
    }

    const updated = updateStockStatus(
      itemId,
      auth.outletId,
      newStatus,
      user || 'Stock Controller',
      reason || `Status updated to ${newStatus}`
    );

    return ok({ item: updated });
  } catch (err: any) {
    return fail('SERVER_ERROR', err.message || 'Failed to update stock status', 500);
  }
}
