import { listServiceProviders } from '@/lib/service-provider-store';
import { ok, fail } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;

    const providers = await listServiceProviders({ category, city });
    return ok(providers);
  } catch (error: any) {
    console.error('[API /providers] Error listing service providers:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to retrieve service providers', 500);
  }
}
