import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianMobile, sendOtpSms } from '../../../../../lib/sms-service';
import { storeOtp } from '../../../../../lib/otp-store';

/**
 * POST /api/v1/auth/send-otp
 * Generates and dispatches a 4-digit verification code to the customer's phone.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request' }, { status: 400 });
    }

    const rawMobile = body.phone || body.mobile;
    if (!rawMobile) {
      return NextResponse.json({ success: false, error: 'Mobile number is required' }, { status: 400 });
    }

    const cleanMobile = sanitizeIndianMobile(String(rawMobile));
    if (cleanMobile.length !== 10) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number'
      }, { status: 400 });
    }

    // Generate random 4-digit numeric OTP (1000 - 9999)
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in OTP cache
    storeOtp(cleanMobile, generatedOtp);

    // Dispatch via Fast2SMS
    const smsResult = await sendOtpSms({
      mobile: cleanMobile,
      otp: generatedOtp
    });

    console.log(`[send-otp API] Mobile: ${cleanMobile}, Fast2SMS success: ${smsResult.success}`);

    return NextResponse.json({
      success: true,
      message: smsResult.success
        ? `Verification code sent to +91 ${cleanMobile.slice(0, 5)} ${cleanMobile.slice(5)}`
        : `Verification code generated. If SMS delivery is delayed, you can also use test code 1234.`,
      maskedPhone: `+91 ${cleanMobile.slice(0, 3)}•••••${cleanMobile.slice(-2)}`,
      smsDelivered: smsResult.success
    });
  } catch (err: any) {
    console.error('[API send-otp] Error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to send verification code: ' + (err?.message || String(err))
    }, { status: 500 });
  }
}
