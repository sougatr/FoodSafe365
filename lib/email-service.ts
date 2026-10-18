/**
 * FoodSafe365 — Server-Side Email & Contact Notification Service
 * Secure dispatch with Reply-To header injection protection, sanitization, and fallback outbox logging.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  organisation?: string;
  ipAddress?: string;
}

export interface ContactMessageRecord extends ContactMessagePayload {
  id: string;
  createdAt: string;
  adminRecipient: string;
  replyTo: string;
  status: 'DELIVERED_EXTERNAL' | 'QUEUED_OUTBOX';
  providerUsed: string;
}

// In-memory sliding window rate limiter (max 5 requests per 10 minutes per IP)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestTimestamps = new Map<string, number[]>();

// In-memory / Global cache for outbox
declare global {
  var __foodsafe_contact_outbox: ContactMessageRecord[] | undefined;
}

function getOutbox(): ContactMessageRecord[] {
  if (!globalThis.__foodsafe_contact_outbox) {
    globalThis.__foodsafe_contact_outbox = [];
  }
  return globalThis.__foodsafe_contact_outbox;
}

/**
 * Sanitize single-line header to prevent CRLF injection attacks
 */
export function sanitizeHeader(value: string, maxLength = 200): string {
  if (!value) return '';
  return value
    .replace(/[\r\n]+/g, ' ') // Strip newlines
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize multi-line body text
 */
export function sanitizeBody(value: string, maxLength = 3000): string {
  if (!value) return '';
  return value.trim().slice(0, maxLength);
}

/**
 * Basic rate limit check by IP
 */
export function checkRateLimit(ip = 'unknown'): boolean {
  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(ip) || [];
  const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (valid.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  valid.push(now);
  ipRequestTimestamps.set(ip, valid);
  return true;
}

/**
 * Dispatches contact message server-side to Administrator
 */
export async function sendContactEmail(payload: ContactMessagePayload): Promise<{ success: boolean; message: string; recordId?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL || 'foodsafe365@gmail.com';
  const cleanName = sanitizeHeader(payload.name, 100);
  const cleanEmail = sanitizeHeader(payload.email, 120);
  const cleanSubject = sanitizeHeader(payload.subject, 150);
  const cleanOrg = sanitizeHeader(payload.organisation || '', 100);
  const cleanMessage = sanitizeBody(payload.message, 3000);

  // Validation
  if (!cleanName) {
    throw new Error('Please enter your name.');
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!cleanSubject) {
    throw new Error('Please enter a subject.');
  }
  if (!cleanMessage) {
    throw new Error('Please enter your message.');
  }

  const recordId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let providerUsed = 'MOCK_OUTBOX';
  let status: 'DELIVERED_EXTERNAL' | 'QUEUED_OUTBOX' = 'QUEUED_OUTBOX';

  // Construct Email Content
  const emailSubject = `[FoodSafe365 Contact] ${cleanSubject}`;
  const emailBodyText = `You have received a new contact submission from FoodSafe365:

Name: ${cleanName}
Email: ${cleanEmail}
${cleanOrg ? `Organisation / Restaurant: ${cleanOrg}\n` : ''}Subject: ${cleanSubject}
Date: ${new Date().toISOString()}

--------------------------------------------------
Message:
${cleanMessage}
--------------------------------------------------

Reply-To is set to: ${cleanEmail}. You can reply directly to this email to respond to ${cleanName}.`;

  // 1. Check if Resend API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'FoodSafe365 <onboarding@resend.dev>',
          to: [adminEmail],
          reply_to: cleanEmail,
          subject: emailSubject,
          text: emailBodyText
        })
      });
      if (resendRes.ok) {
        providerUsed = 'RESEND';
        status = 'DELIVERED_EXTERNAL';
      }
    } catch (err) {
      console.warn('[Contact Email] Resend attempt failed, falling back to outbox:', err);
    }
  }

  // 2. Check if Sendgrid API key is available
  if (status === 'QUEUED_OUTBOX' && process.env.SENDGRID_API_KEY) {
    try {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: adminEmail }] }],
          from: { email: process.env.EMAIL_FROM || 'noreply@foodsafe365.org', name: 'FoodSafe365' },
          reply_to: { email: cleanEmail, name: cleanName },
          subject: emailSubject,
          content: [{ type: 'text/plain', value: emailBodyText }]
        })
      });
      if (sgRes.ok) {
        providerUsed = 'SENDGRID';
        status = 'DELIVERED_EXTERNAL';
      }
    } catch (err) {
      console.warn('[Contact Email] SendGrid attempt failed, falling back to outbox:', err);
    }
  }

  // Store record in memory outbox & persist to disk for verification/audit
  const record: ContactMessageRecord = {
    id: recordId,
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    organisation: cleanOrg,
    ipAddress: payload.ipAddress || '127.0.0.1',
    createdAt: new Date().toISOString(),
    adminRecipient: adminEmail,
    replyTo: cleanEmail,
    status,
    providerUsed
  };

  const outbox = getOutbox();
  outbox.push(record);

  // Try optional disk persistence for mock outbox
  try {
    const dataDir = path.join(process.cwd(), '.data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, 'contact_outbox.json'), JSON.stringify(outbox, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal if filesystem is readonly
  }

  return {
    success: true,
    message: 'Your message has been sent successfully.',
    recordId
  };
}

export function getContactOutboxMessages(): ContactMessageRecord[] {
  return [...getOutbox()];
}

export interface RatingNotificationPayload {
  restaurantId: string;
  restaurantName: string;
  tableNumber?: string;
  overallScore: number;
  scores: {
    cleanliness: number;
    staffHygiene: number;
    foodFreshness: number;
    safeWater: number;
    washroom: number;
  };
  feedback?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  responseRequested?: boolean;
  isUnclaimed?: boolean;
  claimUrl?: string;
  recipientEmail?: string;
}

/**
 * Dispatches an automated real-time notification alert when a customer rates a restaurant.
 * Sends directly to restaurant manager / business contact AND platform admin.
 */
export async function sendCustomerRatingAlert(payload: RatingNotificationPayload): Promise<{
  success: boolean;
  message: string;
  recordId?: string;
  resendStatus?: number;
  resendData?: any;
  recipient?: string;
  subject?: string;
}> {
  const adminEmail = process.env.ADMIN_EMAIL || 'foodsafe365@gmail.com';
  const cleanRestName = sanitizeHeader(payload.restaurantName, 120);
  const cleanScore = Math.min(5, Math.max(0, payload.overallScore)).toFixed(1);

  const recipientList = new Set<string>();
  recipientList.add(adminEmail);
  if (payload.recipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.recipientEmail)) {
    recipientList.add(payload.recipientEmail.trim());
  }

  const emailSubject = payload.isUnclaimed
    ? `[FoodSafe365] Customer Food-Safety Feedback for ${cleanRestName} (${cleanScore}★)`
    : `[FoodSafe365 Alert] New Customer Rating for ${cleanRestName} (${cleanScore}★)`;

  const emailBodyText = `FoodSafe365 Customer Food-Safety Rating Alert
==================================================

Restaurant: ${cleanRestName}
Table / Seat: ${payload.tableNumber || 'Dine-In QR'}
Overall Score: ${cleanScore} / 5.0 ★
Status: ${payload.isUnclaimed ? 'UNCLAIMED DIRECTORY LISTING' : 'REGISTERED RESTAURANT'}
Timestamp: ${new Date().toISOString()}

Category Breakdown:
  1. Table & Cutlery Hygiene: ${payload.scores.cleanliness} ★
  2. Staff Grooming & Uniform: ${payload.scores.staffHygiene} ★
  3. Food Freshness & Temp (Food Handling): ${payload.scores.foodFreshness} ★
  4. Safe Drinking Water & Washrooms: ${payload.scores.safeWater} ★
  5. Overall Food Safety Confidence: ${payload.scores.washroom} ★

Customer Observations / Comments:
${payload.feedback ? `"${sanitizeBody(payload.feedback, 2000)}"` : '(No written observations provided)'}

Customer Attribution & Response Request:
  - Diner: ${payload.customerName || 'Customer'}
  ${payload.customerEmail ? `- Customer Email: ${sanitizeHeader(payload.customerEmail, 120)}` : ''}
  ${payload.customerPhone ? `- Customer Phone: ${sanitizeHeader(payload.customerPhone, 50)}` : ''}
  - Direct Response Requested: ${payload.responseRequested ? 'YES (Customer requested response/resolution)' : 'No'}

${payload.claimUrl ? `--------------------------------------------------
Claim Profile Link for Restaurant:
${payload.claimUrl}
--------------------------------------------------` : ''}

Log in to the FoodSafe365 Manager Portal to view full records:
https://foodsafe365.in/manager
==================================================`;

  const recordId = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let providerUsed = 'MOCK_OUTBOX';
  let status: 'DELIVERED_EXTERNAL' | 'QUEUED_OUTBOX' = 'QUEUED_OUTBOX';

  const recipientsArray = Array.from(recipientList);

  console.log('[Rating Alert Email] Dispatching alert for:', cleanRestName);
  console.log('[Rating Alert Email] RESEND_API_KEY configured?', Boolean(process.env.RESEND_API_KEY));

  // 1. Check if Resend API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      // In Resend free test mode (onboarding@resend.dev), Resend strictly requires
      // the recipient to be the registered account email (adminEmail).
      // Once EMAIL_FROM is verified with a custom domain, all recipients can receive it.
      const isCustomSender = Boolean(process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('resend.dev'));
      const targetRecipients = isCustomSender ? recipientsArray : [adminEmail];

      // Resend Sandbox Safety: In onboarding@resend.dev mode, do NOT set reply_to to an external
      // address because Resend sandbox strictly flags unverified external reply-to domains.
      const emailPayload: any = {
        from: process.env.EMAIL_FROM || 'FoodSafe365 <onboarding@resend.dev>',
        to: targetRecipients,
        subject: emailSubject,
        text: emailBodyText
      };

      if (isCustomSender && payload.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail.trim())) {
        emailPayload.reply_to = payload.customerEmail.trim();
      }

      let resendJson: any = null;
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      try {
        resendJson = await resendRes.json();
      } catch {
        resendJson = { raw: await resendRes.text().catch(() => '') };
      }

      if (resendRes.ok) {
        providerUsed = 'RESEND';
        status = 'DELIVERED_EXTERNAL';
        console.log('[Rating Alert Email] SUCCESS: Delivered via Resend to:', targetRecipients, resendJson);
        return {
          success: true,
          message: 'Customer rating alert delivered successfully via Resend.',
          recordId,
          resendStatus: resendRes.status,
          resendData: resendJson,
          recipient: targetRecipients[0],
          subject: emailSubject
        };
      } else {
        console.error('[Rating Alert Email] Resend API error:', resendRes.status, resendJson);
        return {
          success: false,
          message: 'Resend API error: ' + JSON.stringify(resendJson),
          recordId,
          resendStatus: resendRes.status,
          resendData: resendJson,
          recipient: targetRecipients[0],
          subject: emailSubject
        };
      }
    } catch (err: any) {
      console.warn('[Rating Alert Email] Resend attempt failed, falling back to outbox:', err);
      return {
        success: false,
        message: 'Resend exception: ' + (err?.message || String(err)),
        recordId
      };
    }
  } else {
    console.warn('[Rating Alert Email] RESEND_API_KEY is not defined in process.env, queued in outbox');
  }

  // 2. Check if SendGrid API key is available
  if (status === 'QUEUED_OUTBOX' && process.env.SENDGRID_API_KEY) {
    try {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: recipientsArray.map(email => ({ email })) }],
          from: { email: process.env.EMAIL_FROM || 'noreply@foodsafe365.org', name: 'FoodSafe365' },
          reply_to: { email: payload.customerEmail || adminEmail, name: payload.customerName || 'Customer' },
          subject: emailSubject,
          content: [{ type: 'text/plain', value: emailBodyText }]
        })
      });
      if (sgRes.ok) {
        providerUsed = 'SENDGRID';
        status = 'DELIVERED_EXTERNAL';
      }
    } catch (err) {
      console.warn('[Rating Alert Email] SendGrid attempt failed, falling back to outbox:', err);
    }
  }

  // Record in contact outbox
  const record: ContactMessageRecord = {
    id: recordId,
    name: payload.customerName || 'Customer Feedback',
    email: payload.customerEmail || adminEmail,
    subject: emailSubject,
    message: emailBodyText,
    organisation: payload.restaurantName,
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
    adminRecipient: adminEmail,
    replyTo: payload.customerEmail || adminEmail,
    status,
    providerUsed
  };

  const outbox = getOutbox();
  outbox.push(record);

  return {
    success: true,
    message: 'Customer rating alert recorded successfully.',
    recordId
  };
}
