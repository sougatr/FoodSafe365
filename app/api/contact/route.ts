import { NextResponse } from 'next/server';
import { sendContactEmail, checkRateLimit } from '@/lib/email-service';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many submissions. Please wait a few moments before trying again.'
        },
        { status: 429 }
      );
    }

    const body = await req.json();

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
