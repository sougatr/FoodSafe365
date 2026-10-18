import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminEmail = process.env.ADMIN_EMAIL || 'foodsafe365@gmail.com';
  const fromAddress = process.env.EMAIL_FROM || 'FoodSafe365 <onboarding@resend.dev>';

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY is missing or empty in Vercel environment variables.',
      details: {
        adminEmail,
        hasApiKey: false
      },
      advice: 'Please add RESEND_API_KEY in Vercel Project Settings -> Environment Variables, then click Redeploy.'
    }, { status: 400 });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [adminEmail],
        subject: '[FoodSafe365] Live Email Connection Test',
        text: `Hello,\n\nThis is a verification test confirming that FoodSafe365 is successfully connected to Resend.\n\nStatus: ACTIVE & DELIVERING\nTimestamp: ${new Date().toISOString()}\nRecipient: ${adminEmail}\nSender: ${fromAddress}\n\nAll customer food-safety rating alerts will now be dispatched live to this address.\n\n— FoodSafe365 System`
      })
    });

    const resJson = await resendRes.json().catch(async () => ({ raw: await resendRes.text() }));

    if (resendRes.ok) {
      return NextResponse.json({
        success: true,
        message: `Success! Test email dispatched to ${adminEmail}. Check your Gmail inbox now.`,
        resendStatus: resendRes.status,
        resendData: resJson,
        keyPrefix: `${apiKey.slice(0, 7)}...`
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Resend API returned an error.',
        resendStatus: resendRes.status,
        resendResponse: resJson,
        keyPrefix: `${apiKey.slice(0, 7)}...`
      }, { status: resendRes.status });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to contact Resend API: ' + (err?.message || String(err))
    }, { status: 500 });
  }
}
