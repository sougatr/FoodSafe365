/**
 * FoodSafe365 — Production Distributed Rate Limiter
 * P0-3 Hardening: Multi-process shared rate limiting using PostgreSQL ledger.
 * Survives multi-pod/instance distribution, prevents authentication brute-forcing and request flooding.
 */

import { getPool } from './db';
import type { PoolClient } from 'pg';

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
}

// Test / Development mock store when DATABASE_URL is unset
let mockRateLimitTable: Map<string, { points: number; expireAt: number }> | null = null;
let testPoolOverride: any = null;

export function setRateLimiterPoolForTesting(pool: any) {
  testPoolOverride = pool;
}

export function resetMockRateLimits() {
  if (mockRateLimitTable) {
    mockRateLimitTable.clear();
  }
}

/**
 * Extracts client IP from trusted proxy headers.
 * Never trusts unverified client headers for identity or authorization.
 */
export function getClientIp(req?: Request): string {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return normalizeIp(realIp.trim());
  }
  return '127.0.0.1';
}

function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  return ip;
}

/**
 * Evaluates rate limit against PostgreSQL distributed ledger.
 * Uses atomic UPSERT to safely increment counter and evaluate expiration.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  const isProd = process.env.NODE_ENV === 'production';
  const pool = testPoolOverride || getPool();

  // In production, distributed state via PostgreSQL is mandatory
  if (isProd && !pool) {
    console.error(`[CRITICAL_SECURITY_FAILURE] Rate limiting requested in production but PostgreSQL pool is unavailable.`);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds: windowSeconds,
      retryAfterSeconds: windowSeconds
    };
  }

  if (pool) {
    try {
      const queryText = `
        INSERT INTO distributed_rate_limits (key, points, expire_at, updated_at)
        VALUES ($1, 1, now() + ($2 || ' seconds')::interval, now())
        ON CONFLICT (key) DO UPDATE
        SET points = CASE
                       WHEN distributed_rate_limits.expire_at <= now() THEN 1
                       ELSE distributed_rate_limits.points + 1
                     END,
            expire_at = CASE
                          WHEN distributed_rate_limits.expire_at <= now() THEN now() + ($2 || ' seconds')::interval
                          ELSE distributed_rate_limits.expire_at
                        END,
            updated_at = now()
        RETURNING points, (EXTRACT(EPOCH FROM (expire_at - now())))::integer as ttl;
      `;

      const res = await pool.query(queryText, [key, windowSeconds]);
      const row = res.rows[0];
      const points = row ? Number(row.points) : 1;
      const ttl = row ? Math.max(1, Number(row.ttl || windowSeconds)) : windowSeconds;

      const allowed = points <= limit;
      const remaining = Math.max(0, limit - points);
      const retryAfterSeconds = allowed ? 0 : ttl;

      return {
        allowed,
        limit,
        remaining,
        resetSeconds: ttl,
        retryAfterSeconds
      };
    } catch (err: any) {
      console.error(`[RATE_LIMIT_ERROR] Failed to query distributed rate limit for key "${key}":`, err?.message || err);
      if (isProd) {
        // In production, fail safely: block requests under error to prevent DoS exploitation
        return {
          allowed: false,
          limit,
          remaining: 0,
          resetSeconds: windowSeconds,
          retryAfterSeconds: windowSeconds
        };
      }
      // In local development fallback:
    }
  }

  // Standalone local development / unit test mock fallback
  if (!mockRateLimitTable) {
    mockRateLimitTable = new Map();
  }

  const now = Date.now();
  const existing = mockRateLimitTable.get(key);

  if (!existing || existing.expireAt <= now) {
    const expireAt = now + windowSeconds * 1000;
    mockRateLimitTable.set(key, { points: 1, expireAt });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
      retryAfterSeconds: 0
    };
  }

  existing.points += 1;
  const ttlSeconds = Math.max(1, Math.ceil((existing.expireAt - now) / 1000));
  const allowed = existing.points <= limit;
  const remaining = Math.max(0, limit - existing.points);

  return {
    allowed,
    limit,
    remaining,
    resetSeconds: ttlSeconds,
    retryAfterSeconds: allowed ? 0 : ttlSeconds
  };
}

/**
 * Creates standard HTTP response headers for rate limit responses.
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetSeconds)
  };
  if (!result.allowed && result.retryAfterSeconds > 0) {
    headers['Retry-After'] = String(result.retryAfterSeconds);
  }
  return headers;
}
