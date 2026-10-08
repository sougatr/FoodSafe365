import { ok, fail } from '@/lib/response';
import {
  getStorageZonesAsync,
  saveStorageZoneAsync,
  checkStorageSegregationRules,
  getStockItemsAsync
} from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestedOutlet = url.searchParams.get('outletId');

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return fail(auth.code, auth.message, auth.status);
    }

    const zones = await getStorageZonesAsync(auth.outletId);
    const segregationWarnings = checkStorageSegregationRules(auth.outletId);
    const stock = await getStockItemsAsync(auth.outletId);

    return ok({
      zones,
      segregationWarnings,
      stockCountByZone: zones.map(z => ({
        zoneId: z.id,
        name: z.name,
        type: z.type,
        items: stock.filter(s => s.storageZoneId === z.id && s.status !== 'DISPOSED')
      }))
    });
  } catch (err: any) {
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return fail(code, err.message || 'Failed to retrieve storage zones', 500);
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

    if (!body.name || !body.type) {
      return fail('VALIDATION_ERROR', 'Zone name and zone type are required.', 400);
    }

    const saved = await saveStorageZoneAsync({
      id: body.id,
      outletId: auth.outletId,
      name: body.name,
      type: body.type,
      targetTemp: body.targetTemp,
      minTemp: body.minTemp,
      maxTemp: body.maxTemp,
      description: body.description || ''
    });

    return ok({ zone: saved }, 201);
  } catch (err: any) {
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return fail(code, err.message || 'Failed to save storage zone', 500);
  }
}
