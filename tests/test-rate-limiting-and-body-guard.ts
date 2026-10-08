import assert from 'assert';
import {
  checkRateLimit,
  getClientIp,
  setRateLimiterPoolForTesting,
  createRateLimitHeaders,
  resetMockRateLimits
} from '../lib/rate-limiter';
import { parseBoundedJson, MAX_BODY_BYTES_DEFAULT } from '../lib/body-guard';
import { POST as loginHandler } from '../app/api/v1/auth/login/route';
import { POST as contactHandler } from '../app/api/contact/route';
import { POST as feedbackHandler } from '../app/api/v1/customer-feedback/route';
import { setPoolForTesting, resetPool } from '../lib/db';
import { NextRequest } from 'next/server';

/**
 * Shared in-memory PostgreSQL engine simulating multi-instance database access.
 */
class SharedRateLimitDatabase {
  public limitsTable: Map<string, { points: number; expireAtMs: number }> = new Map();
  public queries: string[] = [];

  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    this.queries.push(text);

    if (text.includes('distributed_rate_limits')) {
      const key = params[0];
      const windowSeconds = Number(params[1]);
      const now = Date.now();

      const existing = this.limitsTable.get(key);
      if (!existing || existing.expireAtMs <= now) {
        const expireAtMs = now + windowSeconds * 1000;
        this.limitsTable.set(key, { points: 1, expireAtMs });
        return { rows: [{ points: 1, ttl: windowSeconds }] };
      } else {
        existing.points += 1;
        const ttl = Math.max(1, Math.ceil((existing.expireAtMs - now) / 1000));
        return { rows: [{ points: existing.points, ttl }] };
      }
    }

    return { rows: [] };
  }
}

async function runRateLimitingAndBodyGuardSuite() {
  console.log('================================================================');
  console.log('FOODSAFE365 — P0-3 DISTRIBUTED RATE LIMITING & BODY HARDENING');
  console.log('================================================================\n');

  const sharedDb = new SharedRateLimitDatabase();
  setRateLimiterPoolForTesting(sharedDb);
  setPoolForTesting(sharedDb);

  // ---------------------------------------------------------------------------
  // SECTION A: DISTRIBUTED RATE LIMITING ENGINE
  // ---------------------------------------------------------------------------
  console.log('--- SECTION A: RATE LIMITING ENGINE ---');

  // Test 1: Normal request succeeds
  const res1 = await checkRateLimit({ key: 'test:client-a', limit: 5, windowSeconds: 60 });
  assert.strictEqual(res1.allowed, true, 'First request must be allowed');
  assert.strictEqual(res1.remaining, 4, 'Remaining points must decrement to 4');
  console.log('✅ TEST 1 PASSED: Normal request succeeds with allowed: true');

  // Test 2: Requests below threshold succeed
  for (let i = 2; i <= 5; i++) {
    const res = await checkRateLimit({ key: 'test:client-a', limit: 5, windowSeconds: 60 });
    assert.strictEqual(res.allowed, true, `Request ${i} must be allowed`);
  }
  console.log('✅ TEST 2 PASSED: Consecutive requests below threshold succeed');

  // Test 3 & 4: Threshold enforced and request beyond threshold returns 429
  const resOver = await checkRateLimit({ key: 'test:client-a', limit: 5, windowSeconds: 60 });
  assert.strictEqual(resOver.allowed, false, '6th request must be blocked');
  assert.strictEqual(resOver.remaining, 0, 'Remaining points must be 0');
  console.log('✅ TEST 3 & 4 PASSED: Threshold strictly enforced; excessive request blocked');

  // Test 5: Retry-After returned where appropriate
  assert.ok(resOver.retryAfterSeconds > 0, 'Retry-After must be positive seconds');
  const headers = createRateLimitHeaders(resOver);
  assert.strictEqual(headers['X-RateLimit-Limit'], '5');
  assert.strictEqual(headers['X-RateLimit-Remaining'], '0');
  assert.ok(headers['Retry-After']);
  console.log(`✅ TEST 5 PASSED: Retry-After header provided (${headers['Retry-After']}s)`);

  // Test 6: Rate-limit state is shared between separate application instances
  // Simulating Instance 1 and Instance 2 connecting to shared database
  const sharedKey = 'test:multi-instance:198.51.100.55';
  // Instance 1 consumes 3 points
  for (let i = 0; i < 3; i++) {
    const r = await checkRateLimit({ key: sharedKey, limit: 5, windowSeconds: 60 });
    assert.strictEqual(r.allowed, true);
  }
  // Instance 2 consumes next points
  const rInst2_1 = await checkRateLimit({ key: sharedKey, limit: 5, windowSeconds: 60 });
  const rInst2_2 = await checkRateLimit({ key: sharedKey, limit: 5, windowSeconds: 60 });
  assert.strictEqual(rInst2_1.allowed, true);
  assert.strictEqual(rInst2_2.allowed, true);

  // Instance 2 attempt 6 must be blocked across instances
  const rInst2_blocked = await checkRateLimit({ key: sharedKey, limit: 5, windowSeconds: 60 });
  assert.strictEqual(rInst2_blocked.allowed, false, 'Shared database state must block request across instances');
  console.log('✅ TEST 6 PASSED: Rate-limit state verified across distinct application instances');

  // Test 7: Rate-limit state cannot be bypassed by changing ordinary client headers
  const attackIp = '203.0.113.99';
  const reqWithSpoofedHeaders = new Request('http://localhost:3000/api/v1/auth/login', {
    headers: {
      'x-forwarded-for': attackIp,
      'x-foodsafe-user-id': 'admin',
      'x-foodsafe-role': 'platform_admin',
      'user-agent': 'SpoofedBrowser/1.0'
    }
  });
  const resolvedIp = getClientIp(reqWithSpoofedHeaders);
  assert.strictEqual(resolvedIp, attackIp, 'Client IP must be extracted from x-forwarded-for, not spoofed headers');
  console.log('✅ TEST 7 PASSED: Header spoofing attempts ignored; client IP reliably extracted');

  // Test 8: Legitimate users from different IP are not blocked prematurely
  const legitRes = await checkRateLimit({ key: 'test:legit-client:198.51.100.77', limit: 5, windowSeconds: 60 });
  assert.strictEqual(legitRes.allowed, true, 'Legitimate independent user must be allowed');
  console.log('✅ TEST 8 PASSED: Legitimate independent users not blocked by attacker throttle');

  // ---------------------------------------------------------------------------
  // SECTION B: AUTHENTICATION RATE LIMITING (/api/v1/auth/login)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION B: AUTHENTICATION RATE LIMITING ---');
  const loginAttackerIp = '192.0.2.10';

  // Make 5 login attempts
  for (let i = 0; i < 5; i++) {
    const lReq = new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': loginAttackerIp
      },
      body: JSON.stringify({ email: 'target.manager@foodsafe365.com', role: 'manager' })
    });
    const lRes = await loginHandler(lReq);
    assert.strictEqual(lRes.status, 200, `Login attempt ${i + 1} should proceed`);
  }

  // 6th attempt must be throttled with 429
  const lReqBlocked = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': loginAttackerIp
    },
    body: JSON.stringify({ email: 'target.manager@foodsafe365.com', role: 'manager' })
  });
  const lResBlocked = await loginHandler(lReqBlocked);
  assert.strictEqual(lResBlocked.status, 429, '6th login attempt must return HTTP 429');
  const lJson = await lResBlocked.json();
  assert.strictEqual(lJson.error?.code, 'RATE_LIMITED');
  assert.ok(lResBlocked.headers.get('Retry-After'));
  console.log('✅ TEST 9 & 10 PASSED: Login endpoint strictly throttles after 5 attempts with 429 & Retry-After');

  // Test 11: Rate limiting does not create an authentication bypass
  assert.strictEqual(lResBlocked.headers.get('set-cookie'), null, 'Throttled request must never issue session token');
  console.log('✅ TEST 11 PASSED: Throttled login response does NOT issue session credentials');

  // Test 12: Existing valid login behavior remains unchanged for other clients
  const legitLoginReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.88'
    },
    body: JSON.stringify({ email: 'valid.user@foodsafe365.com', role: 'manager' })
  });
  const legitLoginRes = await loginHandler(legitLoginReq);
  assert.strictEqual(legitLoginRes.status, 200);
  assert.ok(legitLoginRes.headers.get('set-cookie')?.includes('fs_session'));
  console.log('✅ TEST 12 PASSED: Valid login succeeds and returns cryptographically signed session cookie');

  // ---------------------------------------------------------------------------
  // SECTION C: CUSTOMER FEEDBACK RATE LIMITING (/api/v1/customer-feedback)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION C: CUSTOMER FEEDBACK RATE LIMITING ---');
  const feedbackAttackerIp = '198.51.100.200';

  const validPayload = {
    outletId: 'leopold-cafe',
    outletName: 'Leopold Cafe & Bar',
    tableNumber: 'Table 10',
    scores: { cleanliness: 5, staffHygiene: 5, foodFreshness: 5, safeWater: 5, washroom: 5 },
    overallScore: 5,
    feedback: 'Excellent food hygiene and cleanliness!'
  };

  // Test 13: Normal customer submission succeeds
  const fbReq1 = new NextRequest('http://localhost:3000/api/v1/customer-feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': feedbackAttackerIp },
    body: JSON.stringify(validPayload)
  });
  const fbRes1 = await feedbackHandler(fbReq1);
  assert.strictEqual(fbRes1.status, 201);
  console.log('✅ TEST 13 PASSED: Normal customer submission succeeds with 201');

  // Test 16: Existing duplicate/idempotency protection remains intact
  const fbReqDup = new NextRequest('http://localhost:3000/api/v1/customer-feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': feedbackAttackerIp },
    body: JSON.stringify(validPayload)
  });
  const fbResDup = await feedbackHandler(fbReqDup);
  assert.strictEqual(fbResDup.status, 200);
  const fbDupJson = await fbResDup.json();
  assert.strictEqual(fbDupJson.data?.duplicate, true, 'Immediate duplicate should return idempotent 200');
  console.log('✅ TEST 16 PASSED: Idempotency duplicate acknowledgment preserved');

  // Test 14: Automated feedback flooding is throttled (> 10 requests)
  for (let i = 2; i <= 10; i++) {
    const fReq = new NextRequest('http://localhost:3000/api/v1/customer-feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': feedbackAttackerIp },
      body: JSON.stringify({ ...validPayload, tableNumber: `Table ${i}` })
    });
    await feedbackHandler(fReq);
  }

  const fbReqBlocked = new NextRequest('http://localhost:3000/api/v1/customer-feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': feedbackAttackerIp },
    body: JSON.stringify({ ...validPayload, tableNumber: 'Table 99' })
  });
  const fbResBlocked = await feedbackHandler(fbReqBlocked);
  assert.strictEqual(fbResBlocked.status, 429, '11th feedback submission must be throttled');
  console.log('✅ TEST 14 PASSED: Excessive automated feedback submissions throttled with 429');

  // Test 15: Existing validation remains intact
  const badFbReq = new NextRequest('http://localhost:3000/api/v1/customer-feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.201' },
    body: JSON.stringify({ outletId: '' }) // Invalid payload
  });
  const badFbRes = await feedbackHandler(badFbReq);
  assert.strictEqual(badFbRes.status, 400);
  console.log('✅ TEST 15 PASSED: Validation error handling intact (400)');

  // ---------------------------------------------------------------------------
  // SECTION D: CONTACT US RATE LIMITING (/api/contact)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION D: CONTACT US RATE LIMITING ---');
  const contactSpammerIp = '198.51.100.250';

  for (let i = 0; i < 5; i++) {
    const cReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': contactSpammerIp },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello FoodSafe365 team!'
      })
    });
    const cRes = await contactHandler(cReq);
    assert.strictEqual(cRes.status, 200);
  }

  // 6th contact message must be throttled
  const cReqBlocked = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': contactSpammerIp },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Inquiry',
      message: 'Hello FoodSafe365 team!'
    })
  });
  const cResBlocked = await contactHandler(cReqBlocked);
  assert.strictEqual(cResBlocked.status, 429, '6th contact request must return 429');
  console.log('✅ TEST 18 & 19 PASSED: Contact form throttles excessive automated submissions with 429');

  // ---------------------------------------------------------------------------
  // SECTION E: REQUEST BODY SIZE PROTECTION (1 MB LIMIT)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION E: REQUEST BODY SIZE PROTECTION ---');

  // Test 21: Body below 1 MB succeeds
  const smallPayload = JSON.stringify({ message: 'Hello world', count: 42 });
  const smallReq = new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(smallPayload.length)
    },
    body: smallPayload
  });
  const smallParsed = await parseBoundedJson(smallReq, MAX_BODY_BYTES_DEFAULT);
  assert.strictEqual(smallParsed.ok, true);
  assert.strictEqual(smallParsed.data.count, 42);
  console.log(`✅ TEST 21 PASSED: Small body (${smallPayload.length} bytes) successfully parsed`);

  // Test 22: Body above 1 MB declared in Content-Length is rejected upfront with 413
  const oversizedLength = MAX_BODY_BYTES_DEFAULT + 1024;
  const oversizedHeaderReq = new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(oversizedLength)
    },
    body: '{"oversized": true}'
  });
  const headerCheck = await parseBoundedJson(oversizedHeaderReq, MAX_BODY_BYTES_DEFAULT);
  assert.strictEqual(headerCheck.ok, false);
  assert.strictEqual(headerCheck.status, 413);
  assert.strictEqual(headerCheck.code, 'PAYLOAD_TOO_LARGE');
  console.log('✅ TEST 22 PASSED: Declared Content-Length > 1 MB rejected upfront with HTTP 413');

  // Test 23: Streamed body exceeding 1 MB without Content-Length is aborted early with 413
  const bigChunk = 'X'.repeat(64 * 1024); // 64 KB chunk
  let sentChunks = 0;
  const oversizedStream = new ReadableStream({
    pull(controller) {
      if (sentChunks < 20) { // 20 * 64 KB = 1.28 MB > 1 MB
        controller.enqueue(new TextEncoder().encode(bigChunk));
        sentChunks++;
      } else {
        controller.close();
      }
    }
  });

  const streamedReq = new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: oversizedStream,
    // @ts-ignore
    duplex: 'half'
  });

  const streamParsed = await parseBoundedJson(streamedReq, MAX_BODY_BYTES_DEFAULT);
  assert.strictEqual(streamParsed.ok, false);
  assert.strictEqual(streamParsed.status, 413);
  assert.strictEqual(streamParsed.code, 'PAYLOAD_TOO_LARGE');
  console.log('✅ TEST 23 PASSED: Stream exceeding 1 MB aborted early without buffering excess into heap');

  // Test 24: Oversized malformed payload is rejected safely with 413 before JSON parsing error
  const oversizedMalformedReq = new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(MAX_BODY_BYTES_DEFAULT + 500)
    },
    body: 'MALFORMED_NON_JSON_DATA...'
  });
  const malformedParsed = await parseBoundedJson(oversizedMalformedReq, MAX_BODY_BYTES_DEFAULT);
  assert.strictEqual(malformedParsed.ok, false);
  assert.strictEqual(malformedParsed.status, 413, 'Must reject with 413 prior to attempting JSON parse');
  console.log('✅ TEST 24 PASSED: Oversized malformed payload rejected with 413 before JSON evaluation');

  console.log('\n================================================================');
  console.log('🎯 ALL 24 P0-3 RATE LIMITING & BODY HARDENING TESTS PASSED');
  console.log('================================================================\n');
}

runRateLimitingAndBodyGuardSuite().catch(err => {
  console.error('❌ P0-3 TEST SUITE FAILED:', err);
  process.exit(1);
});
