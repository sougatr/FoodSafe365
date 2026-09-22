import { Pool, PoolClient, QueryResultRow } from 'pg';

let pool: Pool | null = null;
export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });
  return pool;
}
export async function query<T extends QueryResultRow = QueryResultRow>(text:string, params:any[]=[]):Promise<T[]> {
  const p=getPool(); if(!p) throw new Error('DATABASE_NOT_CONFIGURED');
  const r=await p.query<T>(text,params); return r.rows;
}
export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>{
  const p=getPool(); if(!p) throw new Error('DATABASE_NOT_CONFIGURED');
  const c=await p.connect(); try{await c.query('BEGIN'); const v=await fn(c); await c.query('COMMIT'); return v;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
