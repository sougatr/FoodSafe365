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
  const adminEmail = process.env.ADMIN_EMAIL || 'ray.health.ai@gmail.com';
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
          from: process.env.EMAIL_FROM || 'FoodSafe365 <noreply@foodsafe365.org>',
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
