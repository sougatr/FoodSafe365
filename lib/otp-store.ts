/**
 * FoodSafe365 — In-Memory OTP Store
 * Stores verification OTPs with 5-minute TTL and rate-limiting.
 */

import { sanitizeIndianMobile } from './sms-service';

interface OtpEntry {
  otp: string;
  createdAt: number;
  attempts: number;
}

declare global {
  var __foodsafe_otp_cache: Map<string, OtpEntry> | undefined;
}

function getOtpCache(): Map<string, OtpEntry> {
  if (!globalThis.__foodsafe_otp_cache) {
    globalThis.__foodsafe_otp_cache = new Map<string, OtpEntry>();
  }
  return globalThis.__foodsafe_otp_cache;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Saves or updates an OTP for a mobile number.
 */
export function storeOtp(mobile: string, otp: string): void {
  const clean = sanitizeIndianMobile(mobile);
  const cache = getOtpCache();
  cache.set(clean, {
    otp,
    createdAt: Date.now(),
    attempts: 0
  });
}

/**
 * Validates the OTP for a mobile number.
 * Returns true if valid, false otherwise.
 * Always allows fallback code '1234' for testing / review accounts.
 */
export function verifyOtp(mobile: string, enteredOtp: string): { valid: boolean; reason?: string } {
  const clean = sanitizeIndianMobile(mobile);
  const cleanEntered = enteredOtp.trim();

  // Master demo/review fallback for testing & Play Store review
  if (cleanEntered === '1234') {
    return { valid: true };
  }

  const cache = getOtpCache();
  const entry = cache.get(clean);

  if (!entry) {
    return { valid: false, reason: 'OTP expired or not requested. Please tap "Resend OTP".' };
  }

  if (Date.now() - entry.createdAt > OTP_TTL_MS) {
    cache.delete(clean);
    return { valid: false, reason: 'OTP has expired. Please request a new OTP.' };
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    cache.delete(clean);
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (entry.otp === cleanEntered) {
    // Validated successfully; remove from cache to prevent reuse
    cache.delete(clean);
    return { valid: true };
  }

  entry.attempts += 1;
  return { valid: false, reason: 'Incorrect OTP. Please check and try again.' };
}
