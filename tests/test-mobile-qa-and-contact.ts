import assert from 'assert';
import { sendContactEmail, sanitizeHeader, sanitizeBody, checkRateLimit, getContactOutboxMessages } from '../lib/email-service';
import fs from 'fs';
import path from 'path';

async function runMobileAndContactTests() {
  console.log('================================================================');
  console.log('FOODSAFE365 — MOBILE UX HARDENING & CONTACT FORM VERIFICATION');
  console.log('================================================================\n');

  // ----------------------------------------------------------------
  // TEST A: Contact Us Form Submission (Direct Server-Side)
  // ----------------------------------------------------------------
  console.log('--- TEST A: CONTACT US SERVER-SIDE DISPATCH ---');
  const result = await sendContactEmail({
    name: 'Amitabh Sharma',
    email: 'amitabh.sharma@example.com',
    subject: 'Kitchen Food-Safety Audit Inquiry',
    organisation: 'The Bombay Bistro',
    message: 'We are expanding to 3 cloud kitchens in Pune and need FoodSafe365 FSSAI audit onboarding support.'
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.message, 'Your message has been sent successfully.');
  assert(result.recordId, 'Record ID must be returned');

  const outbox = getContactOutboxMessages();
  const createdRecord = outbox.find(r => r.id === result.recordId);
  assert(createdRecord, 'Record must exist in contact outbox');
  assert.strictEqual(createdRecord?.adminRecipient, 'ray.health.ai@gmail.com');
  assert.strictEqual(createdRecord?.replyTo, 'amitabh.sharma@example.com');
  assert.strictEqual(createdRecord?.name, 'Amitabh Sharma');
  assert.strictEqual(createdRecord?.organisation, 'The Bombay Bistro');
  console.log('✅ TEST A PASSED: Contact form submitted directly server-side with Reply-To set to user email');

  // ----------------------------------------------------------------
  // TEST B: Contact Us Field Validation
  // ----------------------------------------------------------------
  console.log('\n--- TEST B: CONTACT US FIELD VALIDATION ---');
  // 1. Missing name
  await assert.rejects(
    async () => {
      await sendContactEmail({
        name: '',
        email: 'test@example.com',
        subject: 'Inquiry',
        message: 'Hello'
      });
    },
    /Please enter your name/
  );

  // 2. Invalid email format
  await assert.rejects(
    async () => {
      await sendContactEmail({
        name: 'John',
        email: 'invalid-email-address',
        subject: 'Inquiry',
        message: 'Hello'
      });
    },
    /Please enter a valid email address/
  );

  // 3. Missing subject
  await assert.rejects(
    async () => {
      await sendContactEmail({
        name: 'John',
        email: 'john@example.com',
        subject: '',
        message: 'Hello'
      });
    },
    /Please enter a subject/
  );

  // 4. Missing message
  await assert.rejects(
    async () => {
      await sendContactEmail({
        name: 'John',
        email: 'john@example.com',
        subject: 'Help',
        message: ''
      });
    },
    /Please enter your message/
  );
  console.log('✅ TEST B PASSED: Strict validation enforced for Name, valid Email, Subject, and Message');

  // ----------------------------------------------------------------
  // TEST C: Email Header Injection (CRLF) Protection & Sanitization
  // ----------------------------------------------------------------
  console.log('\n--- TEST C: CRLF HEADER INJECTION PROTECTION ---');
  const maliciousInput = 'Attacker\r\nBcc: spam@victim.com\r\nSubject: Injected';
  const sanitized = sanitizeHeader(maliciousInput);
  assert(!sanitized.includes('\r'), 'Must strip carriage return');
  assert(!sanitized.includes('\n'), 'Must strip newline');
  assert.strictEqual(sanitized, 'Attacker Bcc: spam@victim.com Subject: Injected');
  console.log('✅ TEST C PASSED: CRLF injection patterns cleanly stripped from email headers');

  // ----------------------------------------------------------------
  // TEST D: Rate Limiting Abuse Protection
  // ----------------------------------------------------------------
  console.log('\n--- TEST D: RATE LIMITING PROTECTION ---');
  const testIp = '192.168.10.45';
  let allowedCount = 0;
  for (let i = 0; i < 7; i++) {
    if (checkRateLimit(testIp)) {
      allowedCount++;
    }
  }
  assert.strictEqual(allowedCount, 5, 'Must permit max 5 submissions per IP before rate limiting');
  assert.strictEqual(checkRateLimit(testIp), false, '6th attempt must be rejected by rate limiter');
  console.log('✅ TEST D PASSED: Rate limiter successfully throttles excessive automated contact form submissions');

  // ----------------------------------------------------------------
  // TEST E: Zero mailto: in Contact Page Source
  // ----------------------------------------------------------------
  console.log('\n--- TEST E: ZERO MAILTO: IN CONTACT US PAGE ---');
  const contactPageContent = fs.readFileSync(path.join(process.cwd(), 'app/contact/page.tsx'), 'utf-8');
  assert(!contactPageContent.includes('href="mailto:'), 'Contact page must NOT contain mailto: link');
  assert(!contactPageContent.includes("href='mailto:"), 'Contact page must NOT contain mailto: link');
  assert(contactPageContent.includes('/api/contact'), 'Contact page must submit to /api/contact endpoint');
  assert(contactPageContent.includes('Send Me Message'), 'Contact page must have Send Me Message button');
  console.log('✅ TEST E PASSED: Verified zero mailto: links in Contact Us page; forms submit directly via API');

  // ----------------------------------------------------------------
  // TEST F: Safe Area & Status Bar Treatment Verification
  // ----------------------------------------------------------------
  console.log('\n--- TEST F: MOBILE SAFE AREA CSS AUDIT ---');
  const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf-8');
  assert(globalsCss.includes('env(safe-area-inset-top'), 'globals.css must support env(safe-area-inset-top)');
  assert(globalsCss.includes('env(safe-area-inset-bottom'), 'globals.css must support env(safe-area-inset-bottom)');
  assert(globalsCss.includes('overflow-x: hidden'), 'html/body must lock horizontal scroll with overflow-x: hidden');
  console.log('✅ TEST F PASSED: Mobile safe-area insets and horizontal overflow locks verified in global styles');

  // ----------------------------------------------------------------
  // TEST G: Floating Chatbot Button Safe Area Positioning
  // ----------------------------------------------------------------
  console.log('\n--- TEST G: FLOATING CHATBOT BUTTON POSITIONING ---');
  const chatbotContent = fs.readFileSync(path.join(process.cwd(), 'components/FoodSafetyChatbot.tsx'), 'utf-8');
  assert(chatbotContent.includes('env(safe-area-inset-bottom'), 'Chatbot button must use env(safe-area-inset-bottom)');
  assert(chatbotContent.includes('+ 32px'), 'Chatbot button must sit elevated above mobile safe-area');
  console.log('✅ TEST G PASSED: Floating Chatbot button elevated safely above mobile navigation and bottom safe-area');

  // ----------------------------------------------------------------
  // TEST H: Header Mobile Navigation & Account Popover
  // ----------------------------------------------------------------
  console.log('\n--- TEST H: GLOBAL HEADER RESPONSIVE & ACCOUNT AUDIT ---');
  const headerContent = fs.readFileSync(path.join(process.cwd(), 'components/GlobalHeader.tsx'), 'utf-8');
  assert(headerContent.includes('mobileMenuOpen'), 'Header must implement mobileMenuOpen responsive state');
  assert(headerContent.includes('accountMenuOpen'), 'Header must implement accountMenuOpen state');
  assert(headerContent.includes('Log Out'), 'Header must provide Log Out action inside account menu');
  console.log('✅ TEST H PASSED: Header provides responsive mobile hamburger drawer and compact account popover');

  console.log('\n================================================================');
  console.log('🎯 ALL MOBILE UX & CONTACT FORM TESTS (TEST A - H) PASSED (8/8)');
  console.log('================================================================\n');
}

runMobileAndContactTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
