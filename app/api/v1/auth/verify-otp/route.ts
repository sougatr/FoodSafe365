import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianMobile } from '../../../../../lib/sms-service';
import { verifyOtp } from '../../../../../lib/otp-store';

/**
 * POST /api/v1/auth/verify-otp
 * Validates the verification code entered by the user.
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
    const enteredOtp = body.otp ? String(body.otp).trim() : '';

    if (!rawMobile || !enteredOtp) {
      return NextResponse.json({
        success: false,
        error: 'Both mobile number and OTP code are required'
      }, { status: 400 });
    }

    const cleanMobile = sanitizeIndianMobile(String(rawMobile));
    const result = verifyOtp(cleanMobile, enteredOtp);

    if (!result.valid) {
      return NextResponse.json({
        success: false,
        error: result.reason || 'Invalid OTP code'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Mobile number verified successfully'
    });
  } catch (err: any) {
    console.error('[API verify-otp] Error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify code: ' + (err?.message || String(err))
    }, { status: 500 });
  }
}
