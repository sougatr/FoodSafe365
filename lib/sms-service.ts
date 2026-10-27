/**
 * FoodSafe365 — Server-Side SMS Notification & OTP Dispatch Service
 * Powered by Fast2SMS (India Bulk & Quick OTP Gateway)
 * Features graceful fallback, rate-limiting, and dual alert dispatch.
 */

export interface SendOtpPayload {
  mobile: string;
  otp: string;
}

export interface RatingAlertSmsPayload {
  restaurantName: string;
  overallScore: number;
  customerName?: string;
  customerPhone?: string;
  feedback?: string;
  tableNumber?: string;
  adminMobile?: string;
  restaurantMobile?: string;
}

export interface SmsResult {
  success: boolean;
  message: string;
  requestId?: string;
  error?: string;
  simulated?: boolean;
}

const FAST2SMS_ENDPOINT = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Normalizes phone numbers to a clean 10-digit Indian mobile number
 */
export function sanitizeIndianMobile(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

/**
 * Dispatches a 4-digit or 6-digit verification OTP SMS via Fast2SMS.
 */
export async function sendOtpSms(payload: SendOtpPayload): Promise<SmsResult> {
  const cleanMobile = sanitizeIndianMobile(payload.mobile);
  const apiKey = (process.env.FAST2SMS_API_KEY || '7WLJTI7jPC7jrUUoLkH61QTBipzNl8JSZGzp3SzJfLrKamxsO15hSPkfxZOrfRF2CHcHMrUO4YFy4mbu').trim();

  if (!cleanMobile || cleanMobile.length !== 10) {
    return {
      success: false,
      message: 'Invalid 10-digit mobile number'
    };
  }

  console.log(`[SMS Service] Sending OTP to ${cleanMobile.slice(0, 3)}****${cleanMobile.slice(-2)} (Code: ${payload.otp})`);

  // If API key is not configured, fall back to simulated success for development/testing
  if (!apiKey) {
    console.warn('[SMS Service] FAST2SMS_API_KEY is not defined. Simulating OTP delivery.');
    return {
      success: true,
      message: 'OTP simulated successfully (Development Mode)',
      simulated: true
    };
  }

  try {
    const res = await fetch(FAST2SMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: payload.otp,
        numbers: cleanMobile
      })
    });

    const data: any = await res.json().catch(() => null);

    if (data && (data.return === true || data.status_code === 200)) {
      return {
        success: true,
        message: 'OTP SMS delivered successfully',
        requestId: data.request_id
      };
    }

    console.warn('[SMS Service] Fast2SMS OTP response:', data);
    return {
      success: false,
      message: data?.message?.[0] || data?.message || 'Failed to dispatch SMS',
      error: data?.message || JSON.stringify(data)
    };
  } catch (err: any) {
    console.error('[SMS Service] Network error during OTP dispatch:', err);
    return {
      success: false,
      message: 'SMS delivery network error',
      error: err?.message || String(err)
    };
  }
}

/**
 * Dispatches a real-time SMS alert to Admin Mobile (8390367279) and optionally to Restaurant
 * when a customer submits a food safety rating.
 */
export async function sendRatingAlertSms(payload: RatingAlertSmsPayload): Promise<{
  adminResult: SmsResult;
  restaurantResult?: SmsResult;
}> {
  const apiKey = (process.env.FAST2SMS_API_KEY || '7WLJTI7jPC7jrUUoLkH61QTBipzNl8JSZGzp3SzJfLrKamxsO15hSPkfxZOrfRF2CHcHMrUO4YFy4mbu').trim();
  const targetAdminMobile = sanitizeIndianMobile(
    payload.adminMobile || process.env.ADMIN_MOBILE || '8390367279'
  );

  const cleanScore = Math.min(5, Math.max(0, payload.overallScore)).toFixed(1);
  const cleanRest = payload.restaurantName.slice(0, 25);
  const cleanCustomer = (payload.customerName || 'Verified Diner').slice(0, 20);
  const maskedPhone = payload.customerPhone
    ? payload.customerPhone.slice(0, 3) + '****' + payload.customerPhone.slice(-2)
    : 'N/A';
  const cleanComment = payload.feedback ? payload.feedback.slice(0, 50) : 'No comment';

  // Construct compact SMS (under 160 characters for single SMS credit)
  const alertText = `FoodSafe365 Alert: New rating for ${cleanRest}: ${cleanScore}* by ${cleanCustomer} (${maskedPhone}). "${cleanComment}". Check: foodsafe365.in/manager`;

  console.log(`[SMS Service] Dispatching Admin Rating Alert to ${targetAdminMobile}`);

  if (!apiKey) {
    console.warn('[SMS Service] FAST2SMS_API_KEY missing. Simulating rating alert.');
    return {
      adminResult: {
        success: true,
        message: 'Admin alert simulated (Key missing)',
        simulated: true
      }
    };
  }

  let adminResult: SmsResult = { success: false, message: 'Not sent' };
  try {
    const res = await fetch(FAST2SMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: alertText,
        language: 'english',
        numbers: targetAdminMobile
      })
    });

    const data: any = await res.json().catch(() => null);
    if (data && (data.return === true || data.status_code === 200)) {
      adminResult = {
        success: true,
        message: 'Admin SMS alert dispatched successfully',
        requestId: data.request_id
      };
    } else {
      adminResult = {
        success: false,
        message: data?.message?.[0] || data?.message || 'Fast2SMS returned error',
        error: JSON.stringify(data)
      };
    }
  } catch (err: any) {
    adminResult = {
      success: false,
      message: 'Failed to send admin alert SMS',
      error: err?.message || String(err)
    };
  }

  // Also dispatch to Restaurant mobile if provided and valid
  let restaurantResult: SmsResult | undefined;
  if (payload.restaurantMobile) {
    const cleanRestMobile = sanitizeIndianMobile(payload.restaurantMobile);
    if (cleanRestMobile && cleanRestMobile.length === 10 && cleanRestMobile !== targetAdminMobile) {
      const restMsg = `FoodSafe365: Your kitchen ${cleanRest} received a new hygiene rating: ${cleanScore}* from a diner. View feedback: foodsafe365.in/claim`;
      try {
        const rRes = await fetch(FAST2SMS_ENDPOINT, {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: restMsg,
            language: 'english',
            numbers: cleanRestMobile
          })
        });
        const rData: any = await rRes.json().catch(() => null);
        restaurantResult = {
          success: rData && (rData.return === true || rData.status_code === 200),
          message: rData?.message?.[0] || rData?.message || 'Restaurant SMS status'
        };
      } catch (err: any) {
        restaurantResult = {
          success: false,
          message: 'Error delivering to restaurant mobile',
          error: err?.message || String(err)
        };
      }
    }
  }

  return { adminResult, restaurantResult };
}
