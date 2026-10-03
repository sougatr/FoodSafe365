import type { PoolClient, QueryResultRow } from 'pg';
import pg from 'pg';

let pool: any = null;
export type { PoolClient, QueryResultRow };

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    const isLocal = process.env.DATABASE_URL.includes('localhost') || 
                    process.env.DATABASE_URL.includes('127.0.0.1') || 
                    process.env.DATABASE_URL.includes('sslmode=disable');
    const ssl = (process.env.NODE_ENV === 'production' && !isLocal) ? { rejectUnauthorized: false } : undefined;
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, ssl });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  if (!p) throw new Error('DATABASE_NOT_CONFIGURED');
  const r = await (p as any).query(text, params);
  return r.rows;
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const p = getPool();
  if (!p) throw new Error('DATABASE_NOT_CONFIGURED');
  const client = await (p as any).connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
