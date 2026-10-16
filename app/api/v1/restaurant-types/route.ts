import { query } from '@/lib/db';
import { demo } from '@/lib/demo';
import { ok, fail } from '@/lib/response';

export async function GET() {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }
  if (!process.env.DATABASE_URL) {
    return ok(demo.restaurantTypes);
  }
  try {
    return ok(await query('SELECT id,code,name FROM restaurant_types WHERE active=true ORDER BY name'));
  } catch (err: any) {
    return fail('DATABASE_ERROR', 'Unable to retrieve restaurant types.', 500);
  }
}

