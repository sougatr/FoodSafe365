import { requireOutletAccess } from '@/lib/tenant';
import { query } from '@/lib/db';
import { ok, fail } from '@/lib/response';

export async function GET(req: Request, { params }: { params: { outlet_id: string } }) {
  const access = await requireOutletAccess(params.outlet_id, req);
  if (!access.ok) return fail((access as any).code || (access.status === 401 ? 'UNAUTHENTICATED' : access.status === 403 ? 'FORBIDDEN' : 'NOT_FOUND'), access.message, access.status);

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  if (!process.env.DATABASE_URL) return ok({ id: params.outlet_id, name: 'ABC Restaurant', city: 'Mumbai' });

  try {
    const r = await query('SELECT id,name,city,state,status FROM outlets WHERE id=$1', [params.outlet_id]);
    if (!r.length) return fail('NOT_FOUND', 'Outlet not found', 404);
    return ok(r[0]);
  } catch (err: any) {
    console.error('[API GET /outlets/[outlet_id]] Error:', err);
    return fail('INTERNAL_ERROR', 'Unable to retrieve outlet details.', 500);
  }
}
