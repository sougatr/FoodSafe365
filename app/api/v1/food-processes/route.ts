import { query } from '@/lib/db';
import { demo } from '@/lib/demo';
import { ok, fail } from '@/lib/response';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return ok(demo.processes);
  }
  try {
    return ok(await query('SELECT id,code,name,description FROM food_processes WHERE active=true ORDER BY name'));
  } catch (err: any) {
    return fail('DATABASE_ERROR', 'Unable to retrieve food processes.', 500);
  }
}

