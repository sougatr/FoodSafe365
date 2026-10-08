import { NextResponse } from 'next/server';
import { sendContactEmail } from '../../../lib/email-service';
import { checkRateLimit as checkDistributedRateLimit, getClientIp, createRateLimitHeaders } from '../../../lib/rate-limiter';
import { parseBoundedJson } from '../../../lib/body-guard';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Distributed Rate Limiter check (5 attempts per 10 minutes)
    const rlResult = await checkDistributedRateLimit({
      key: `rl:contact:${ip}`,
      limit: 5,
      windowSeconds: 10 * 60
    });

    if (!rlResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'RATE_LIMITED',
          message: 'Too many submissions. Please wait a few moments before trying again.'
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rlResult)
        }
      );
    }

    // 2. Strict 1 MB request body size limit and safe JSON parsing
    const parseRes = await parseBoundedJson<any>(req);
    if (!parseRes.ok) {
      return NextResponse.json(
        {
          success: false,
          code: parseRes.code,
          message: parseRes.message
        },
        { status: parseRes.status }
      );
    }

    const body = parseRes.data;

    const result = await sendContactEmail({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      organisation: body.organisation,
      ipAddress: ip
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const isValidationError = err.message && (
      err.message.includes('valid email') ||
      err.message.includes('name') ||
      err.message.includes('subject') ||
      err.message.includes('message')
    );

    return NextResponse.json(
      {
        success: false,
        message: isValidationError
          ? err.message
          : "We couldn't send your message right now. Please try again."
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
