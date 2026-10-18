import { NextResponse } from 'next/server';
import { sendCustomerRatingAlert } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminEmail = process.env.ADMIN_EMAIL || 'foodsafe365@gmail.com';

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY is missing or empty in Vercel environment variables.',
      details: {
        adminEmail,
        hasApiKey: false,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL)
      },
      advice: 'Please add RESEND_API_KEY in Vercel Project Settings -> Environment Variables, then click Redeploy.'
    }, { status: 400 });
  }

  try {
    // Dispatch a REAL Customer Food-Safety Report Alert directly through the email service
    const alertResult = await sendCustomerRatingAlert({
      restaurantId: 'pal-dhaba',
      restaurantName: 'Pal Dhaba (Chandigarh)',
      tableNumber: 'Table QR #04',
      overallScore: 4.8,
      scores: {
        cleanliness: 5,
        staffHygiene: 5,
        foodFreshness: 5,
        safeWater: 4,
        washroom: 5
      },
      feedback: 'Verification Test: Clean cutlery, prompt food hygiene service, spotless dining area. All 5 food-safety checks passed!',
      customerName: 'Verified Diner (FoodSafe365 Quality Check)',
      customerEmail: adminEmail,
      customerPhone: '+91 98765 43210',
      responseRequested: true,
      isUnclaimed: false,
      claimUrl: 'https://foodsafe365.in/claim/pal-dhaba'
    });

    if (alertResult.success && alertResult.resendStatus === 200) {
      return NextResponse.json({
        success: true,
        message: `Success! Full Food-Safety Rating Report Alert has been dispatched to ${alertResult.recipient || adminEmail}. Check your Gmail inbox now!`,
        emailSubject: alertResult.subject,
        recipient: alertResult.recipient || adminEmail,
        resendStatus: alertResult.resendStatus,
        resendData: alertResult.resendData,
        keyPrefix: `${apiKey.slice(0, 7)}...`,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL)
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Resend API returned a non-200 status when attempting to dispatch rating alert.',
        resendStatus: alertResult.resendStatus,
        resendData: alertResult.resendData,
        keyPrefix: `${apiKey.slice(0, 7)}...`,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL)
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to contact Resend API: ' + (err?.message || String(err)),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL)
    }, { status: 500 });
  }
}
