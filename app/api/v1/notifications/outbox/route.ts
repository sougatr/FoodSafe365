import { NextRequest, NextResponse } from 'next/server';
import { getOutboxNotificationsAsync, clearOutboxAsync, MockOutboxNotification } from '../../../../../lib/unclaimed-restaurant-store';
import { getAuthContext } from '../../../../../lib/auth';
import { ok, fail } from '../../../../../lib/response';

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce strict authentication
    const auth = await getAuthContext(req);
    if (!auth) {
      return fail('UNAUTHENTICATED', 'Authentication required. Please sign in as an administrator.', 401);
    }

    // 2. Enforce strict administrative authorization
    const isAdmin = auth.role === 'platform_admin' || auth.role === 'admin' || auth.role === 'superadmin';
    if (!isAdmin) {
      return fail('FORBIDDEN', 'Access denied. Administrative role required to access notification outbox.', 403);
    }

    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
    }

    const url = new URL(req.url);
    const restaurantId = url.searchParams.get('restaurantId') || undefined;
    const shouldClear = url.searchParams.get('clear') === 'true';

    // 3. Clear action strictly authorized for administrative callers
    if (shouldClear) {
      await clearOutboxAsync();
      return ok({ message: 'Notification outbox cleared successfully', count: 0 });
    }

    // 4. Retrieve notifications from PostgreSQL / async store and sanitize sensitive contents before exposing
    const notifications = await getOutboxNotificationsAsync(restaurantId);

    const sanitizedNotifications = notifications.map((n: MockOutboxNotification) => {
      const sanitized = { ...n };
      const rawToken = sanitized.claimToken;

      // Redact raw claimToken
      if (sanitized.claimToken) {
        sanitized.claimToken = '***REDACTED***';
      }

      // Redact token from claimUrl
      if (sanitized.claimUrl) {
        try {
          const u = new URL(sanitized.claimUrl, 'http://localhost');
          if (u.searchParams.has('token')) {
            u.searchParams.set('token', '***REDACTED***');
            sanitized.claimUrl = sanitized.claimUrl.startsWith('http')
              ? u.toString()
              : `${u.pathname}${u.search}`;
          }
        } catch {
          sanitized.claimUrl = sanitized.claimUrl.replace(/token=[^&]+/g, 'token=***REDACTED***');
        }
      }

      // Redact raw claim token from email body if present
      if (sanitized.body && rawToken) {
        sanitized.body = sanitized.body.split(rawToken).join('***REDACTED***');
      }

      // Mask customer contact if shared
      if (sanitized.customerContactShared) {
        const contact = sanitized.customerContactShared;
        if (contact.includes('@')) {
          const [local, domain] = contact.split('@');
          const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : `${local}***`;
          sanitized.customerContactShared = `${maskedLocal}@${domain}`;
        } else if (contact.length >= 7) {
          sanitized.customerContactShared = `${contact.slice(0, 3)}****${contact.slice(-2)}`;
        }
      }

      return sanitized;
    });

    return NextResponse.json({
      data: {
        notifications: sanitizedNotifications,
        count: sanitizedNotifications.length,
        environment: process.env.DATABASE_URL ? 'POSTGRESQL_OUTBOX' : 'TEST_MOCK_OUTBOX',
        note: 'Notifications are placed in the outbox for inspection without external email dispatch.'
      },
      error: null
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    return fail('INTERNAL_ERROR', 'Failed to retrieve outbox notifications.', 500);
  }
}
