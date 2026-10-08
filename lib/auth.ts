import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import {
  verifySessionToken,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SessionInput
} from './session';

export type AuthContext = {
  userId: string;
  organisationId: string;
  outletId: string;
  role: string;
  providerId?: string;
  sessionId?: string;
};

/**
 * Extract a specific cookie value from a raw Cookie header string
 */
function extractCookieFromHeader(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + cookieName + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Retrieve the authenticated session context for the current request.
 *
 * Security Model:
 * 1. Checks for cryptographically signed `fs_session` token via HTTP-only cookie or Authorization: Bearer header.
 * 2. Validates HMAC signature, expiration, and server-side revocation status.
 * 3. Identity (userId, role, outletId) is DERIVED STRICTLY from the verified session payload.
 * 4. Client-supplied `x-foodsafe-*` headers CANNOT override session values.
 * 5. In production, unauthenticated requests with raw spoofed headers are strictly rejected (returns null).
 */
export async function getAuthContext(req?: Request): Promise<AuthContext | null> {
  let sessionToken: string | null = null;
  let sessionTokenFound = false;

  // 1. Try reading signed fs_session cookie from Next.js cookies()
  try {
    const c = cookies();
    const cookieVal = c.get(SESSION_COOKIE_NAME)?.value;
    if (cookieVal) {
      sessionToken = cookieVal;
      sessionTokenFound = true;
    }
  } catch {
    // cookies() may throw when invoked outside Next.js request context (e.g. standalone test scripts)
  }

  // 2. Try reading from Request object if provided
  if (req) {
    if (!sessionToken) {
      const cookieHeader = req.headers.get('cookie');
      const fromCookie = extractCookieFromHeader(cookieHeader, SESSION_COOKIE_NAME);
      if (fromCookie) {
        sessionToken = fromCookie;
        sessionTokenFound = true;
      }
    }

    if (!sessionToken) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7).trim();
        sessionTokenFound = true;
      }
    }
  }

  // 3. If a session token was found, verify it cryptographically
  if (sessionTokenFound) {
    if (!sessionToken) {
      return null;
    }

    const verification = verifySessionToken(sessionToken);
    if (!verification.valid || !verification.data) {
      // Invalid signature, expired, or revoked token: NEVER fall back to untrusted headers
      return null;
    }

    const session = verification.data;
    return {
      userId: session.userId,
      organisationId: session.organisationId || 'default-org',
      outletId: session.outletId || 'none',
      role: session.role,
      providerId: session.providerId,
      sessionId: session.sessionId
    };
  }

  // 4. If NO signed session exists:
  // In production, reject unverified requests even if spoofed headers are present
  const isProduction = process.env.NODE_ENV === 'production';
  const rejectSpoofed = req?.headers.get('x-foodsafe-reject-spoofed') === 'true';

  if (isProduction || rejectSpoofed) {
    return null;
  }

  // 5. Non-production / test harness fallback for existing automated tests
  if (req) {
    const userId = req.headers.get('x-foodsafe-user-id');
    const organisationId = req.headers.get('x-foodsafe-org-id') || 'demo-org';
    const outletId = req.headers.get('x-foodsafe-outlet-id') || 'demo-outlet';
    const role = req.headers.get('x-foodsafe-role') || 'owner';
    const providerId = req.headers.get('x-foodsafe-provider-id') || (role === 'vendor' || role === 'provider' ? userId || undefined : undefined);
    if (userId) {
      return { userId, organisationId, outletId, role, providerId };
    }
  }

  return null;
}

/**
 * Mint a signed session token for a user
 */
export function createSessionForUser(input: SessionInput, ttlSeconds?: number): string {
  return createSessionToken(input, ttlSeconds);
}

/**
 * Generate authenticated headers for testing or internal services
 */
export function demoAuthHeaders(role: string = 'owner', outletId: string = 'demo-outlet') {
  const token = createSessionToken({
    userId: 'demo-user',
    organisationId: 'demo-org',
    outletId,
    role
  });
  return {
    'Authorization': `Bearer ${token}`,
    'x-foodsafe-user-id': 'demo-user'
  };
}
