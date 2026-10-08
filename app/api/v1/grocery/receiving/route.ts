import { NextResponse } from 'next/server';
import { getReceivingLogsAsync, recordReceivingItemAsync } from '@/lib/grocery-store';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';
import { GROCERY_PRODUCT_CATEGORIES } from '@/lib/grocery-types';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestedOutlet = url.searchParams.get('outletId');

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return NextResponse.json({
        success: false,
        error: { code: auth.code, message: auth.message },
        message: auth.message
      }, { status: auth.status });
    }

    const logs = await getReceivingLogsAsync(auth.outletId);
    return NextResponse.json({
      success: true,
      data: { logs, count: logs.length }
    }, { status: 200 });
  } catch (err: any) {
    console.error('[API GET /api/v1/grocery/receiving] Error:', err);
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return NextResponse.json({
      success: false,
      error: { code, message: err.message || 'Unable to retrieve receiving records.' },
      message: err.message || 'Unable to retrieve receiving records.'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestedOutlet = body.outletId;

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      console.warn('[API POST /api/v1/grocery/receiving] Auth failure:', auth.code, auth.message);
      return NextResponse.json({
        success: false,
        error: { code: auth.code, message: auth.message },
        message: auth.message
      }, { status: auth.status });
    }

    if (!body.product || !body.supplier) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Product name and supplier are required.' },
        message: 'Product name and supplier are required.'
      }, { status: 400 });
    }

    // Resolve productCategory to valid code whether sent as code or human-readable name
    let resolvedCategory = 'other_packaged';
    if (body.productCategory) {
      const catInput = String(body.productCategory).trim().toLowerCase();
      const matched = GROCERY_PRODUCT_CATEGORIES.find(
        c => c.code.toLowerCase() === catInput || c.name.toLowerCase() === catInput
      );
      resolvedCategory = matched ? matched.code : String(body.productCategory).trim();
    }

    const result = await recordReceivingItemAsync({
      outletId: auth.outletId,
      dateTime: body.dateTime,
      supplier: String(body.supplier).trim(),
      product: String(body.product).trim(),
      productCategory: resolvedCategory,
      quantity: String(body.quantity || '1 unit'),
      batchNumber: body.batchNumber,
      useByDate: body.useByDate,
      packagingCondition: body.packagingCondition || 'intact',
      productCondition: body.productCondition || 'acceptable',
      temperature: typeof body.temperature === 'number' ? body.temperature : undefined,
      isTempSensitive: Boolean(body.isTempSensitive),
      receivingPerson: body.receivingPerson || 'Duty Supervisor',
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

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Receiving entry recorded successfully.'
    }, { status: 201 });
  } catch (err: any) {
    console.error('[API POST /api/v1/grocery/receiving] Server Error:', err);
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return NextResponse.json({
      success: false,
      error: { code, message: err.message || 'Unable to record receiving entry. Please try again.' },
      message: err.message || 'Unable to record receiving entry. Please try again.'
    }, { status: 500 });
  }
}
