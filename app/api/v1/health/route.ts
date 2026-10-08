import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let pool: any = null;
  try {
    pool = getPool();
  } catch {
    return Response.json({ data: { status: 'degraded', database: false } });
  }

  if (!pool) {
    return Response.json({ data: { status: 'demo', database: false } });
  }

  try {
    await pool.query('select 1');
    return Response.json({ data: { status: 'ok', database: true } });
  } catch {
    return Response.json({ data: { status: 'degraded', database: false } });
  }
}

