import { ok, fail } from '@/lib/response';
import { getReceivingLogs, recordReceivingItem } from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requestedOutlet = url.searchParams.get('outletId');

  const auth = await authorizeGroceryAccess(requestedOutlet, req);
  if (!auth.ok) {
    return fail(auth.code, auth.message, auth.status);
  }

  const logs = getReceivingLogs(auth.outletId);
  return ok({ logs, count: logs.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestedOutlet = body.outletId;

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return fail(auth.code, auth.message, auth.status);
    }

    if (!body.product || !body.supplier) {
      return fail('VALIDATION_ERROR', 'Product name and supplier are required.', 400);
    }

    const result = recordReceivingItem({
      outletId: auth.outletId,
      dateTime: body.dateTime,
      supplier: String(body.supplier).trim(),
      product: String(body.product).trim(),
      productCategory: String(body.productCategory || 'other_packaged'),
      quantity: String(body.quantity || '1 unit'),
      batchNumber: body.batchNumber,
      useByDate: body.useByDate,
      packagingCondition: body.packagingCondition || 'intact',
      productCondition: body.productCondition || 'acceptable',
      temperature: typeof body.temperature === 'number' ? body.temperature : undefined,
      isTempSensitive: Boolean(body.isTempSensitive),
      receivingPerson: body.receivingPerson || 'Receiving Staff',
      decision: body.decision || 'ACCEPT',
      rejectionReason: body.rejectionReason,
      evidenceUrl: body.evidenceUrl,
      inspectionChecklist: body.inspectionChecklist || {
        approvedSupplier: true,
        acceptableCondition: true,
        packagingIntact: true,
        noLeakageOrDamage: true,
        dateMarkingAcceptable: true,
        temperatureAppropriate: true,
        suitableForStorage: true,
        withinCapacity: true
      }
    });

    return ok(result, 201);
  } catch (err: any) {
    return fail('SERVER_ERROR', err.message || 'Failed to record receiving entry', 500);
  }
}
