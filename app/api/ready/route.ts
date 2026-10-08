import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * Readiness Probe: /api/ready
 * Indicates whether the application is fully initialized and can connect to the required PostgreSQL database.
 * Returns HTTP 200 when ready to accept production workload.
 * Returns HTTP 503 Service Unavailable when the database is unreachable or unconfigured.
 * Does NOT expose database credentials, SQL error details, or internal architecture.
 */
export async function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  const hasDbUrl = Boolean(process.env.DATABASE_URL);

  // In production, database configuration is mandatory
  if (!hasDbUrl) {
    if (isProd) {
      return NextResponse.json(
        {
          status: 'not_ready',
          database: 'unconfigured',
          timestamp: new Date().toISOString()
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Development / demo standalone browsing mode
    return NextResponse.json(
      {
        status: 'ready',
        database: 'standalone_mode',
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let pool: any;
  try {
    pool = getPool();
  } catch {
    return NextResponse.json(
      {
        status: 'not_ready',
        database: 'configuration_error',
        timestamp: new Date().toISOString()
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!pool) {
    return NextResponse.json(
      {
        status: 'not_ready',
        database: 'initialization_failed',
        timestamp: new Date().toISOString()
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    // Perform minimal latency ping query with 3-second timeout guard
    await Promise.race([
      pool.query('SELECT 1 as ping'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3000))
    ]);

    return NextResponse.json(
      {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      }
    );
  } catch {
    // Return sanitized status 503 without leaking SQL errors or internal specifics
    return NextResponse.json(
      {
        status: 'not_ready',
        database: 'unreachable',
        timestamp: new Date().toISOString()
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      }
    );
  }
}
