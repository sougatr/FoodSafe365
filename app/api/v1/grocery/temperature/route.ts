import { ok, fail } from '@/lib/response';
import {
  getGroceryEquipmentListAsync,
  getTemperatureLogsAsync,
  recordTemperatureLogAsync,
  saveGroceryEquipmentAsync
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

    const equipment = await getGroceryEquipmentListAsync(auth.outletId);
    const logs = await getTemperatureLogsAsync(auth.outletId);

    return ok({
      equipment,
      logs,
      disclaimer: 'Follow product-specific storage instructions / manufacturer label where applicable.'
    });
  } catch (err: any) {
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return fail(code, err.message || 'Failed to retrieve temperature data', 500);
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

    // Action 1: Add or configure equipment
    if (body.type === 'configure_equipment' || body.equipmentConfig) {
      const config = body.equipmentConfig || body;
      const savedEq = await saveGroceryEquipmentAsync({
        id: config.id,
        outletId: auth.outletId,
        name: config.name,
        type: config.type || 'chiller',
        location: config.location || 'Store Floor',
        targetTemp: typeof config.targetTemp === 'number' ? config.targetTemp : 4,
        minTemp: typeof config.minTemp === 'number' ? config.minTemp : 1,
        maxTemp: typeof config.maxTemp === 'number' ? config.maxTemp : 5,
        responsiblePerson: config.responsiblePerson || 'Duty Supervisor',
        active: config.active !== false
      });
      return ok({ equipment: savedEq }, 201);
    }

    // Action 2: Record temperature reading
    if (typeof body.reading !== 'number' || !body.equipmentId) {
      return fail('VALIDATION_ERROR', 'equipmentId and numerical reading are required.', 400);
    }

    const result = await recordTemperatureLogAsync({
      outletId: auth.outletId,
      equipmentId: body.equipmentId,
      reading: body.reading,
      recordedBy: body.recordedBy || 'Duty Supervisor',
      method: body.method || 'probe',
      notes: body.notes
    });

    return ok(result, 201);
  } catch (err: any) {
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return fail(code, err.message || 'Failed to record temperature log', 500);
  }
}
