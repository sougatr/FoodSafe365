/**
 * FoodSafe365 — Server-Side Email & Contact Notification Service
 * Secure dispatch with Reply-To header injection protection, sanitization, and fallback outbox logging.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { resolveRestaurantName } from './restaurantsData';

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
      const apiKey = process.env.RESEND_API_KEY.trim();
      const isCustomSender = Boolean(process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('resend.dev'));
      const emailPayload: any = {
        from: process.env.EMAIL_FROM || 'FoodSafe365 <onboarding@resend.dev>',
        to: [adminEmail],
        subject: emailSubject,
        text: emailBodyText,
        html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #059669; padding: 20px 24px; color: #ffffff;">
      <h2 style="margin: 0; font-size: 18px;">FoodSafe365 Message Received</h2>
      <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Inquiry from Contact / Onboarding Portal</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 6px 0; color: #64748b; width: 120px;">From:</td><td style="font-weight: 600; color: #0f172a;">${cleanName}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="font-weight: 600; color: #0f172a;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
        ${cleanOrg ? `<tr><td style="padding: 6px 0; color: #64748b;">Organisation:</td><td style="font-weight: 600; color: #0f172a;">${cleanOrg}</td></tr>` : ''}
        <tr><td style="padding: 6px 0; color: #64748b;">Subject:</td><td style="font-weight: 600; color: #0f172a;">${cleanSubject}</td></tr>
      </table>
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 8px;">Message Content</div>
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1e293b;">${cleanMessage}</div>
    </div>
    <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      FoodSafe365 Platform Notification · Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>
</body>
</html>`
      };

      if (isCustomSender && cleanEmail) {
        emailPayload.reply_to = cleanEmail;
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
      let resendJson: any = null;
      try {
        resendJson = await resendRes.json();
      } catch {
        resendJson = { raw: await resendRes.text().catch(() => '') };
      }

      if (resendRes.ok) {
        providerUsed = 'RESEND';
        status = 'DELIVERED_EXTERNAL';
        console.log('[Contact Email] SUCCESS: Delivered to:', adminEmail, resendJson);
      } else {
        console.warn('[Contact Email] Resend API returned non-200:', resendRes.status, resendJson);
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
  const resolvedRestName = resolveRestaurantName(payload.restaurantId, payload.restaurantName);
  const cleanRestName = sanitizeHeader(resolvedRestName, 120);
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

  const emailHtmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; color: #ffffff; text-align: left; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #ffffff; }
    .header p { margin: 0; opacity: 0.9; font-size: 13px; color: #ffffff; }
    .body { padding: 24px; }
    .restaurant-badge { display: inline-block; background: #ecfdf5; color: #065f46; font-weight: 700; font-size: 16px; padding: 6px 14px; border-radius: 6px; border: 1px solid #a7f3d0; margin-bottom: 16px; }
    .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .stat-label { color: #64748b; font-weight: 500; }
    .stat-value { color: #0f172a; font-weight: 600; text-align: right; }
    .breakdown-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin: 20px 0 10px 0; }
    .score-bar { background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    .score-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
    .comment-box { background: #fefce8; border-left: 4px solid #eab308; padding: 14px; border-radius: 0 8px 8px 0; margin-top: 16px; font-size: 14px; font-style: italic; color: #713f12; }
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>FoodSafe365 Rating Alert</h1>
      <p>Automated Real-Time Food-Safety Diner Feedback</p>
    </div>
    <div class="body">
      <div class="restaurant-badge">🍽️ ${cleanRestName}</div>
      <div class="stat-row">
        <span class="stat-label">Overall Safety Score:</span>
        <span class="stat-value" style="color: #059669; font-size: 18px; font-weight: 800;">${cleanScore} / 5.0 ★</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Table / Seat:</span>
        <span class="stat-value">${payload.tableNumber || 'Dine-In QR'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Listing Status:</span>
        <span class="stat-value">${payload.isUnclaimed ? 'Unclaimed Directory Listing' : 'Registered Restaurant'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Diner Attribution:</span>
        <span class="stat-value">${payload.customerName || 'Verified Diner'}</span>
      </div>
      ${payload.customerEmail ? `
      <div class="stat-row">
        <span class="stat-label">Diner Email:</span>
        <span class="stat-value">${sanitizeHeader(payload.customerEmail, 120)}</span>
      </div>` : ''}
      ${payload.customerPhone ? `
      <div class="stat-row">
        <span class="stat-label">Diner Phone:</span>
        <span class="stat-value">${sanitizeHeader(payload.customerPhone, 50)}</span>
      </div>` : ''}
      <div class="stat-row">
        <span class="stat-label">Direct Response Requested:</span>
        <span class="stat-value" style="color: ${payload.responseRequested ? '#dc2626' : '#64748b'}; font-weight: 700;">${payload.responseRequested ? 'YES (Customer requested response/resolution)' : 'No'}</span>
      </div>

      <div class="breakdown-title">Food Safety Category Ratings</div>
      <div class="score-bar">
        <div class="score-row"><span>1. Table & Cutlery Hygiene:</span><strong>${payload.scores.cleanliness} ★</strong></div>
        <div class="score-row"><span>2. Staff Grooming & Uniform:</span><strong>${payload.scores.staffHygiene} ★</strong></div>
        <div class="score-row"><span>3. Food Freshness & Handling:</span><strong>${payload.scores.foodFreshness} ★</strong></div>
        <div class="score-row"><span>4. Safe Water & Washrooms:</span><strong>${payload.scores.safeWater} ★</strong></div>
        <div class="score-row"><span>5. Overall Food Safety Confidence:</span><strong>${payload.scores.washroom} ★</strong></div>
      </div>

      ${payload.feedback ? `
      <div class="breakdown-title">Diner Observations</div>
      <div class="comment-box">"${sanitizeBody(payload.feedback, 2000)}"</div>` : ''}

      ${payload.claimUrl ? `
      <div style="text-align: center; margin-top: 20px;">
        <a href="${payload.claimUrl}" class="btn" style="color: #ffffff;">Claim Restaurant Profile & Control Plan</a>
      </div>` : `
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://foodsafe365.in/manager" class="btn" style="color: #ffffff;">Open Manager Portal & Audit Logs</a>
      </div>`}
    </div>
    <div class="footer">
      FoodSafe365 — India's Standard for Food Safety Transparency & Verification.<br/>
      Generated automatically at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>
</body>
</html>`;

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
        text: emailBodyText,
        html: emailHtmlBody
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

export interface ServiceRequestAlertPayload {
  requestId: string;
  outletName: string;
  outletCity?: string;
  outletAddress?: string;
  serviceCategory: string;
  problemDescription: string;
  priority?: string;
  contactPerson?: string;
  contactPhone?: string;
  scheduledAt?: string;
  notes?: string;
  providerName?: string;
  providerEmail?: string;
}

/**
 * Dispatches an automated real-time notification alert when a restaurant requests a service provider.
 * Sends directly to foodsafe365@gmail.com (and provider if email present).
 */
export async function sendServiceRequestAlert(payload: ServiceRequestAlertPayload): Promise<{
  success: boolean;
  message: string;
  recordId?: string;
  resendStatus?: number;
  resendData?: any;
}> {
  const adminEmail = process.env.ADMIN_EMAIL || 'foodsafe365@gmail.com';
  const cleanRestName = sanitizeHeader(payload.outletName, 120) || 'Restaurant Kitchen';
  const cleanCategory = sanitizeHeader(payload.serviceCategory, 80) || 'Food Safety Service';
  const cleanPriority = (payload.priority || 'HIGH').toUpperCase();
  const cleanProblem = sanitizeBody(payload.problemDescription, 2000);

  const emailSubject = `[FoodSafe365 Alert] New Service Provider Request: ${cleanRestName} (${cleanCategory} · ${cleanPriority})`;

  const emailBodyText = `FoodSafe365 Service Partner Action Alert
==================================================
Request ID: ${payload.requestId}
Restaurant: ${cleanRestName}
City: ${payload.outletCity || 'India'}
Address: ${payload.outletAddress || 'Not specified'}

Service Category: ${cleanCategory}
Assigned Provider: ${payload.providerName || 'Pending / Unassigned'}
Priority: ${cleanPriority}
Scheduled Date: ${payload.scheduledAt || 'Immediate'}

Problem Description / Corrective Action Required:
${cleanProblem}

${payload.notes ? `Additional Notes:\n${sanitizeBody(payload.notes, 1000)}\n` : ''}
Restaurant Contact:
  - Contact Person: ${payload.contactPerson || 'Duty Manager'}
  - Phone: ${payload.contactPhone || 'Not specified'}

Timestamp: ${new Date().toISOString()}

Manage service requests in the Provider Portal:
https://foodsafe365.in/providers/dashboard
==================================================`;

  const emailHtmlBody = `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; color: #ffffff;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Priority: ${cleanPriority}</div>
      <h2 style="margin: 0; font-size: 20px;">New Service Provider Request</h2>
      <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${cleanRestName} (${payload.outletCity || 'India'})</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 16px;">
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; width: 140px;">Request ID:</td><td style="font-weight: 700; color: #0f172a;">${payload.requestId}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Service Category:</td><td style="font-weight: 700; color: #059669;">${cleanCategory}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Assigned Agency:</td><td style="font-weight: 600; color: #0f172a;">${payload.providerName || 'Pending / Open'}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Contact Person:</td><td style="font-weight: 600; color: #0f172a;">${payload.contactPerson || 'Duty Manager'} (${payload.contactPhone || 'No phone'})</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Address:</td><td style="font-weight: 500; color: #0f172a;">${payload.outletAddress || 'On file'}</td></tr>
      </table>

      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin: 16px 0 8px;">Problem / Hazard Description</div>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 0 8px 8px 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
        ${cleanProblem}
      </div>

      ${payload.notes ? `
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin: 16px 0 8px;">Special Instructions</div>
      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13.5px; color: #334155; border: 1px solid #e2e8f0;">${sanitizeBody(payload.notes, 1000)}</div>` : ''}

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://foodsafe365.in/providers/dashboard" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">View in Service Partner Portal</a>
      </div>
    </div>
    <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      FoodSafe365 Service Partner Network · Generated at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>
</body>
</html>`;

  const recordId = `sreq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let providerUsed = 'MOCK_OUTBOX';
  let status: 'DELIVERED_EXTERNAL' | 'QUEUED_OUTBOX' = 'QUEUED_OUTBOX';

  const recipientList = new Set<string>();
  recipientList.add(adminEmail);
  if (payload.providerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.providerEmail.trim())) {
    recipientList.add(payload.providerEmail.trim());
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const apiKey = process.env.RESEND_API_KEY.trim();
      const isCustomSender = Boolean(process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('resend.dev'));
      const targetRecipients = isCustomSender ? Array.from(recipientList) : [adminEmail];

      const emailPayload: any = {
        from: process.env.EMAIL_FROM || 'FoodSafe365 <onboarding@resend.dev>',
        to: targetRecipients,
        subject: emailSubject,
        text: emailBodyText,
        html: emailHtmlBody
      };

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      if (resendRes.ok) {
        providerUsed = 'RESEND';
        status = 'DELIVERED_EXTERNAL';
        const resendJson = await resendRes.json().catch(() => ({}));
        console.log('[Service Request Email] SUCCESS: Delivered to:', targetRecipients);
        return { success: true, message: 'Service request alert sent.', recordId, resendStatus: 200, resendData: resendJson };
      } else {
        const errText = await resendRes.text().catch(() => '');
        console.warn('[Service Request Email] Resend API error:', resendRes.status, errText);
      }
    } catch (err) {
      console.warn('[Service Request Email] Resend failed:', err);
    }
  }

  // Fallback to outbox logging
  const record: ContactMessageRecord = {
    id: recordId,
    name: payload.contactPerson || 'Restaurant Manager',
    email: adminEmail,
    subject: emailSubject,
    message: emailBodyText,
    organisation: payload.outletName,
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
    adminRecipient: adminEmail,
    replyTo: adminEmail,
    status,
    providerUsed
  };
  getOutbox().push(record);

  return { success: true, message: 'Service request alert processed.', recordId };
}

export interface ProviderOnboardingAlertPayload {
  providerId: string;
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  city: string;
  categories: string[];
  description: string;
}

/**
 * Dispatches an automated real-time notification alert when a new service provider onboards.
 */
export async function sendProviderOnboardingAlert(payload: ProviderOnboardingAlertPayload): Promise<{
  success: boolean;
  message: string;
  recordId?: string;
  resendStatus?: number;
  resendData?: any;
}> {
  const adminEmail = process.env.ADMIN_EMAIL || 'foodsafe365@gmail.com';
  const cleanBusiness = sanitizeHeader(payload.businessName, 120);
  const cleanContact = sanitizeHeader(payload.contactName, 100);
  const cleanMobile = sanitizeHeader(payload.mobile, 40);
  const cleanEmail = sanitizeHeader(payload.email, 120);
  const cleanCity = sanitizeHeader(payload.city, 80);
  const categoriesStr = payload.categories.join(', ');

  const emailSubject = `[FoodSafe365 Alert] New Service Provider Onboarded: ${cleanBusiness} (${cleanCity})`;

  const emailBodyText = `New Service Provider Registration
==================================================
Provider ID: ${payload.providerId}
Company / Business: ${cleanBusiness}
Operating City: ${cleanCity}
Service Categories: ${categoriesStr}

Contact Information:
  - Contact Person: ${cleanContact}
  - Mobile: ${cleanMobile}
  - Email: ${cleanEmail}

Services Description:
${sanitizeBody(payload.description, 2000)}

Timestamp: ${new Date().toISOString()}

View registered service partners:
https://foodsafe365.in/providers
==================================================`;

  const emailHtmlBody = `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #0f172a; padding: 24px; color: #ffffff;">
      <h2 style="margin: 0; font-size: 20px; color: #34d399;">🤝 New Service Provider Registered</h2>
      <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${cleanBusiness} · ${cleanCity}</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 16px;">
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; width: 140px;">Company Name:</td><td style="font-weight: 700; color: #0f172a;">${cleanBusiness}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Categories:</td><td style="font-weight: 600; color: #059669;">${categoriesStr}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Contact Person:</td><td style="font-weight: 600; color: #0f172a;">${cleanContact}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Mobile:</td><td style="font-weight: 600; color: #0f172a;">${cleanMobile}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Email:</td><td style="font-weight: 600; color: #0f172a;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">City / Area:</td><td style="font-weight: 600; color: #0f172a;">${cleanCity}</td></tr>
      </table>

      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; margin: 16px 0 8px;">Description of Services</div>
      <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; font-size: 14px; color: #1e293b; line-height: 1.5;">${sanitizeBody(payload.description, 2000)}</div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://foodsafe365.in/providers" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">Open Service Partners Directory</a>
      </div>
    </div>
    <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      FoodSafe365 Partner Onboarding · Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>
</body>
</html>`;

  const recordId = `prov-reg-${Date.now()}`;
  if (process.env.RESEND_API_KEY) {
    try {
      const apiKey = process.env.RESEND_API_KEY.trim();
      const isCustomSender = Boolean(process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('resend.dev'));
      const targetRecipients = [adminEmail];

      const emailPayload: any = {
        from: process.env.EMAIL_FROM || 'FoodSafe365 <onboarding@resend.dev>',
        to: targetRecipients,
        subject: emailSubject,
        text: emailBodyText,
        html: emailHtmlBody
      };

      if (isCustomSender && cleanEmail) {
        emailPayload.reply_to = cleanEmail;
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
      let resendJson: any = null;
      try {
        resendJson = await resendRes.json();
      } catch {
        resendJson = { raw: await resendRes.text().catch(() => '') };
      }

      if (resendRes.ok) {
        console.log('[Provider Registration Email] SUCCESS: Delivered to:', adminEmail, resendJson);
        return { success: true, message: 'Provider registration alert sent.', recordId, resendStatus: 200, resendData: resendJson };
      } else {
        console.error('[Provider Registration Email] Resend API error:', resendRes.status, resendJson);
        return { success: false, message: 'Resend API error: ' + JSON.stringify(resendJson), recordId, resendStatus: resendRes.status, resendData: resendJson };
      }
    } catch (err) {
      console.warn('[Provider Registration Email] Resend failed:', err);
    }
  }

  return { success: true, message: 'Provider registration logged.', recordId };
}
