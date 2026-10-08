import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, revokeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(req: Request) {
  try {
    // 1. Invalidate session in server revocation registry
    let sessionToken: string | undefined;
    try {
      sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
    } catch {}

    if (!sessionToken && req) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + SESSION_COOKIE_NAME + '=([^;]*)'));
      if (match) {
        sessionToken = decodeURIComponent(match[1]);
      }
    }

    if (sessionToken) {
      const verified = verifySessionToken(sessionToken);
      if (verified.valid && verified.data?.sessionId) {
        revokeSession(verified.data.sessionId);
      }
    }

    // 2. Clear cookies
    const res = NextResponse.json({ data: { success: true }, error: null });

    // Clear signed session cookie
    res.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    // Clear legacy plaintext cookies
    for (const k of ['fs_user_id', 'fs_org_id', 'fs_outlet_id', 'fs_role', 'fs_provider_id']) {
      res.cookies.set(k, '', { httpOnly: true, maxAge: 0, path: '/' });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ data: { success: true }, error: null });
  }
}
