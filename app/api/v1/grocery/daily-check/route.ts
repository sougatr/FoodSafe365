import { NextResponse } from 'next/server';
import { recordDailyCheckAsync, getDailyCheckHistoryAsync } from '@/lib/grocery-store';
import { GROCERY_OPERATIONAL_CHECKS } from '@/lib/grocery-checklist-data';
import { authorizeGroceryAccess } from '@/lib/grocery-tenant';

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

    const history = await getDailyCheckHistoryAsync(auth.outletId);

    return NextResponse.json({
      success: true,
      data: {
        checksDefinition: GROCERY_OPERATIONAL_CHECKS,
        history,
        todayCheck: history.find(h => h.date === new Date().toISOString().slice(0, 10)) || null,
        label: 'FoodSafe365 Grocery Store Operational Check',
        subtext: 'FSSAI-aligned food-safety practices adapted for routine operational monitoring.'
      }
    }, { status: 200 });
  } catch (err: any) {
    console.error('[API GET /api/v1/grocery/daily-check] Error:', err);
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return NextResponse.json({
      success: false,
      error: { code, message: err.message || 'Unable to retrieve daily check history.' },
      message: err.message || 'Unable to retrieve daily check history.'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestedOutlet = body.outletId;

    const auth = await authorizeGroceryAccess(requestedOutlet, req);
    if (!auth.ok) {
      return NextResponse.json({
        success: false,
        error: { code: auth.code, message: auth.message },
        message: auth.message
      }, { status: auth.status });
    }

    if (!body.responses || typeof body.responses !== 'object') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'responses object is required' },
        message: 'responses object is required'
      }, { status: 400 });
    }

    const result = await recordDailyCheckAsync({
      outletId: auth.outletId,
      supervisorName: body.supervisorName || 'Duty Supervisor',
      responses: body.responses
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Daily check completed successfully.'
    }, { status: 201 });
  } catch (err: any) {
    console.error('[API POST /api/v1/grocery/daily-check] Error:', err);
    const code = err.code === 'DATABASE_ERROR' || err.message?.includes('DATABASE_ERROR') ? 'DATABASE_ERROR' : 'SERVER_ERROR';
    return NextResponse.json({
      success: false,
      error: { code, message: err.message || 'Failed to record daily check' },
      message: err.message || 'Unable to record daily check. Please try again.'
    }, { status: 500 });
  }
}
