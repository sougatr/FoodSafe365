import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Liveness Probe: /api/health
 * Indicates whether the application process is running and able to handle HTTP traffic.
 * Does not depend on external services or database connections.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
}
