import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export interface SessionData {
  userId: string;
  organisationId: string;
  outletId: string;
  role: string;
  providerId?: string;
  sessionId: string; // Unique session JTI
  issuedAt: number;  // Timestamp ms
  expiresAt: number; // Timestamp ms
}

export type SessionInput = Omit<SessionData, 'sessionId' | 'issuedAt' | 'expiresAt'>;

import { validateSessionSecret, DEV_DEFAULT_SESSION_SECRET } from './env-validator';

// Server-side revocation store for invalidated sessions (e.g. on logout)
const revokedSessions = new Set<string>();

// Get or initialize session secret
export function getSessionSecret(customEnv?: NodeJS.ProcessEnv): string {
  const env = customEnv || process.env;
  const isProd = env.NODE_ENV === 'production';
  const secret = env.SESSION_SECRET || env.JWT_SECRET;

  if (isProd) {
    const issue = validateSessionSecret(secret, true);
    if (issue) {
      throw new Error(issue.message);
    }
    return secret!.trim();
  }

  // In development/test mode, use provided secret if valid, otherwise explicit dev fallback
  if (secret && secret.trim().length >= 16) {
    return secret.trim();
  }

  return DEV_DEFAULT_SESSION_SECRET;
}

/**
 * Base64URL encode a string or Buffer
 */
function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64url');
}

/**
 * Base64URL decode to string
 */
function fromBase64Url(b64url: string): string {
  return Buffer.from(b64url, 'base64url').toString('utf8');
}

/**
 * Compute HMAC-SHA256 signature for data string
 */
function computeSignature(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

/**
 * Constant-time comparison of two signature strings to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Create a cryptographically signed session token.
 * Token format: `<base64url_payload>.<base64url_hmac_signature>`
 *
 * @param input Session attributes (userId, role, outletId, etc.)
 * @param ttlSeconds Session time to live in seconds (default 7 days)
 */
export function createSessionToken(input: SessionInput, ttlSeconds: number = 7 * 86400): string {
  const now = Date.now();
  const sessionData: SessionData = {
    ...input,
    sessionId: randomUUID(),
    issuedAt: now,
    expiresAt: now + ttlSeconds * 1000
  };

  const secret = getSessionSecret();
  const payloadStr = JSON.stringify(sessionData);
  const encodedPayload = toBase64Url(payloadStr);
  const signature = computeSignature(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export interface SessionVerificationResult {
  valid: boolean;
  data?: SessionData;
  error?: 'MALFORMED' | 'INVALID_SIGNATURE' | 'EXPIRED' | 'REVOKED';
}

/**
 * Verify a cryptographically signed session token.
 * Validates HMAC signature with constant-time equality, expiration, and revocation status.
 */
export function verifySessionToken(token: string): SessionVerificationResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'MALFORMED' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'MALFORMED' };
  }

  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) {
    return { valid: false, error: 'MALFORMED' };
  }

  const secret = getSessionSecret();
  const expectedSignature = computeSignature(encodedPayload, secret);

  // Constant-time check to prevent timing attacks
  if (!constantTimeCompare(signature, expectedSignature)) {
    return { valid: false, error: 'INVALID_SIGNATURE' };
  }

  try {
    const payloadStr = fromBase64Url(encodedPayload);
    const data: SessionData = JSON.parse(payloadStr);

    // Basic structure validation
    if (!data.userId || !data.role || !data.sessionId || typeof data.expiresAt !== 'number') {
      return { valid: false, error: 'MALFORMED' };
    }

    // Expiry check
    if (Date.now() > data.expiresAt) {
      return { valid: false, error: 'EXPIRED' };
    }

    // Revocation check
    if (revokedSessions.has(data.sessionId)) {
      return { valid: false, error: 'REVOKED' };
    }

    return { valid: true, data };
  } catch {
    return { valid: false, error: 'MALFORMED' };
  }
}

/**
 * Invalidate/revoke a session (e.g. on logout)
 */
export function revokeSession(sessionId: string): void {
  if (sessionId) {
    revokedSessions.add(sessionId);
  }
}

/**
 * Check if a session has been revoked
 */
export function isSessionRevoked(sessionId: string): boolean {
  return revokedSessions.has(sessionId);
}

/**
 * Reset revoked sessions (for testing purposes only)
 */
export function _clearRevokedSessionsForTesting(): void {
  revokedSessions.clear();
}

export const SESSION_COOKIE_NAME = 'fs_session';

export function getSessionCookieOptions(maxAgeSeconds: number = 7 * 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds
  };
}
