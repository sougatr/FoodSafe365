import { ok, fail } from '@/lib/response';
import {
  getStockItemsAsync,
  updateStockStatusAsync,
  quarantineBatchAsync,
  releaseBatchAsync
} from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestedOutlet = url.searchParams.get('outletId');
    const statusFilter = url.searchParams.get('status');
    const searchQuery = url.searchParams.get('search')?.toLowerCase().trim();
    const availableOnly = url.searchParams.get('availableOnly') === 'true';

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return fail(auth.code, auth.message, auth.status);
    }

    const allStock = await getStockItemsAsync(auth.outletId);

    let filtered = allStock;

    if (availableOnly) {
      // Server-side strict safety lock: exclude quarantined, expired, and disposed items
      filtered = filtered.filter(s => s.status === 'ACTIVE' || s.status === 'NEAR_EXPIRY');
    } else if (statusFilter && statusFilter.toUpperCase() !== 'ALL') {
      filtered = filtered.filter(s => s.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.batch.toLowerCase().includes(searchQuery) ||
        s.product.toLowerCase().includes(searchQuery) ||
        s.category.toLowerCase().includes(searchQuery)
      );
    }

    // FEFO sorting: nearest expiry date first
    filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    return ok({
      stock: filtered,
      totalCount: allStock.length,
      filteredCount: filtered.length,
      counts: {
        active: allStock.filter(s => s.status === 'ACTIVE').length,
        nearExpiry: allStock.filter(s => s.status === 'NEAR_EXPIRY').length,
        expired: allStock.filter(s => s.status === 'EXPIRED').length,
        quarantined: allStock.filter(s => s.status === 'QUARANTINED').length,
        disposed: allStock.filter(s => s.status === 'DISPOSED').length
      }
    });
  } catch (err: any) {
    const isDb = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR');
    return fail(isDb ? 'DATABASE_ERROR' : 'SERVER_ERROR', isDb ? 'Database error occurred while retrieving stock items.' : 'Failed to retrieve stock items.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestedOutlet = body.outletId;

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return fail(auth.code, auth.message, auth.status);
    }

    const action = body.action;

    // 1. BATCH RECALL QUARANTINE ACTION
    if (action === 'QUARANTINE_BATCH' || (body.batchNumber && body.reasonCategory)) {
      const role = auth.auth?.role;
      const isAuthorizedRole = !role || ['store_manager', 'manager', 'admin', 'superadmin', 'supervisor', 'platform_admin'].includes(role);
      if (!isAuthorizedRole) {
        return fail('FORBIDDEN', 'Only authorized grocery managers and supervisors can initiate recall batch quarantine.', 403);
      }

      const { batchNumber, reasonCategory, reasonDetails, reason, user } = body;
      if (!batchNumber) {
        return fail('VALIDATION_ERROR', 'batchNumber is required for batch quarantine.', 400);
      }
      if (!reasonCategory) {
        return fail('VALIDATION_ERROR', 'Mandatory reasonCategory is required for batch quarantine.', 400);
      }

      const validCategories = [
        'MANUFACTURER_RECALL',
        'SUPPLIER_ALERT',
        'CONTAMINATION_SUSPECTED',
        'PACKAGING_DEFECT',
        'OTHER_SAFETY_CONCERN'
      ];
      if (!validCategories.includes(reasonCategory)) {
        return fail('VALIDATION_ERROR', `Invalid reasonCategory: ${reasonCategory}`, 400);
      }

      const result = await quarantineBatchAsync(
        auth.outletId,
        String(batchNumber).trim(),
        reasonCategory,
        reasonDetails || reason || 'Product recall hold',
        user || auth.auth?.userId || 'Store Stock Manager'
      );

      return ok(result);
    }

    // 2. BATCH CONTROLLED RELEASE ACTION
    if (action === 'RELEASE_BATCH') {
      const role = auth.auth?.role;
      const isAuthorizedRole = !role || ['store_manager', 'manager', 'admin', 'superadmin', 'supervisor', 'platform_admin'].includes(role);
      if (!isAuthorizedRole) {
        return fail('FORBIDDEN', 'Only authorized grocery managers can release stock from quarantine.', 403);
      }

      const { batchNumber, reasonCategory, releaseReasonCategory, releaseReason, releaseNotes, user, destinationZoneId } = body;
      const category = releaseReasonCategory || reasonCategory || 'AUTHORISED_SAFETY_CLEARANCE';
      const notes = releaseNotes || releaseReason;

      if (!batchNumber) {
        return fail('VALIDATION_ERROR', 'batchNumber is required for batch release.', 400);
      }
      if (!notes || !String(notes).trim()) {
        return fail('VALIDATION_ERROR', 'Mandatory release justification reason is required.', 400);
      }

      const result = await releaseBatchAsync(
        auth.outletId,
        String(batchNumber).trim(),
        category,
        String(notes).trim(),
        user || auth.auth?.userId || 'Store Stock Manager',
        destinationZoneId
      );

      return ok(result);
    }

    // 3. SINGLE ITEM STATUS UPDATE
    const { itemId, newStatus, user, reason } = body;
    if (!itemId || !newStatus) {
      return fail('VALIDATION_ERROR', 'itemId and newStatus are required.', 400);
    }

    if (!['ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DISPOSED'].includes(newStatus)) {
      return fail('VALIDATION_ERROR', `Invalid stock status: ${newStatus}`, 400);
    }

    const updated = await updateStockStatusAsync(
      itemId,
      auth.outletId,
      newStatus,
      user || 'Stock Controller',
      reason || `Status updated to ${newStatus}`
    );

    return ok({ item: updated });
  } catch (err: any) {
    const isDb = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR');
    const isNotFound = err.message?.includes('not found');
    const isClientError = err.message?.includes('no quarantined items');
    const status = isNotFound ? 404 : isClientError ? 400 : 500;
    const msg = isNotFound ? 'Stock item or batch not found.' : isClientError ? 'No quarantined items found.' : isDb ? 'Database error occurred while updating stock status.' : 'Failed to update stock status.';
    return fail(isDb ? 'DATABASE_ERROR' : status === 404 ? 'NOT_FOUND' : status === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR', msg, status);
  }
}

