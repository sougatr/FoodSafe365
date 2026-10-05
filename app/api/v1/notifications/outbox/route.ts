import { NextRequest, NextResponse } from 'next/server';
import { getMockOutboxNotifications, clearMockOutbox } from '@/lib/unclaimed-restaurant-store';
import { ok, fail } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get('restaurantId') || undefined;
    const shouldClear = url.searchParams.get('clear') === 'true';

    if (shouldClear) {
      clearMockOutbox();
      return ok({ message: 'Mock outbox cleared successfully', count: 0 });
    }

    const notifications = getMockOutboxNotifications(restaurantId);

    return NextResponse.json({
      data: {
        notifications,
        count: notifications.length,
        environment: 'TEST_MOCK_OUTBOX',
        note: 'Mock notifications are placed in the outbox for inspection without external email dispatch.'
      },
      error: null
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    return fail('INTERNAL_ERROR', err?.message || 'Failed to retrieve mock outbox notifications', 500);
  }
}
