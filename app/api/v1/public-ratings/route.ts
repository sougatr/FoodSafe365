import { NextResponse } from 'next/server';
import { getCustomerFeedback } from '../../../../lib/customer-feedback-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function maskPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const p = phone.trim();
  if (p.length <= 4) return '***';
  return p.slice(0, 3) + '****' + p.slice(-2);
}

/**
 * GET /api/v1/public-ratings
 * Public read-only endpoint that serves live, authentic customer ratings
 * to the landing page and audit metrics dashboard across all devices.
 */
export async function GET() {
  try {
    const { ratings, storage, count } = await getCustomerFeedback();

    const sanitizedRatings = ratings.map(r => ({
      ...r,
      dinerMobile: maskPhone(r.dinerMobile),
      customerPhone: maskPhone(r.customerPhone)
    }));

    return NextResponse.json({
      success: true,
      data: {
        ratings: sanitizedRatings,
        count,
        storage
      },
      error: null
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    });
  } catch (err: any) {
    console.error('[API /public-ratings GET] Error:', err);
    return NextResponse.json({
      success: false,
      error: err?.message || 'Failed to retrieve public ratings'
    }, { status: 500 });
  }
}
