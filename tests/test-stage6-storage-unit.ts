/**
 * FoodSafe365 — Stage 6A: Storage Foundations Unit Test Suite
 * Tests:
 * 1. Standards-compliant AWS SigV4 signing & key derivation
 * 2. Tenant-isolated object key generation, sanitization, and path traversal defense
 * 3. Server-side magic-byte detection (JPEG, PNG, PDF)
 * 4. Disguised executable, shell script, HTML polyglot, and PDF exploit detection
 * 5. Storage provider abstraction & fail-closed production rules
 */

import assert from 'assert';
import crypto from 'crypto';
import {
  rfc3986Encode,
  sha256Hex,
  deriveSigningKey,
  buildCanonicalUri,
  buildCanonicalQueryString,
  buildCanonicalHeaders,
  buildCanonicalRequest,
  buildStringToSign,
  createPresignedUrl,
  formatSigV4Timestamps
} from '../lib/storage/sigv4';
import {
  buildEvidenceStorageKey,
  parseEvidenceStorageKey,
  sanitizeFileName,
  ALLOWED_ENTITY_TYPES
} from '../lib/storage/key-generator';
import {
  detectMagicBytes,
  containsExecutableHeader,
  inspectBinaryContent,
  MAX_FILE_SIZE_BYTES
} from '../lib/storage/sniffer';
import { MemoryStorageProvider } from '../lib/storage/memory';
import { S3StorageProvider } from '../lib/storage/s3';
import {
  getStorageProvider,
  setStorageProviderForTesting,
  resetStorageProvider,
  resolveStorageConfig
} from '../lib/storage/index';

async function runStorageUnitTests() {
  console.log('================================================================');
  console.log('FOODSAFE365 — STAGE 6A: STORAGE FOUNDATIONS UNIT TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`✅ [PASS] ${name}`);
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${err.message}`);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: AWS SigV4 REFERENCE IMPLEMENTATION & VECTORS
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: AWS SigV4 REFERENCE SIGNING & ENCODING ---');

  test('SigV4 1.1: RFC 3986 encoding encodes reserved characters and preserves unreserved', () => {
    // RFC 3986 unreserved: A-Z, a-z, 0-9, '-', '_', '.', '~'
    assert.strictEqual(rfc3986Encode('abcXYZ123-_.~'), 'abcXYZ123-_.~');
    // Must encode ! * ' ( )
    assert.strictEqual(rfc3986Encode("hello!*'(world)"), 'hello%21%2A%27%28world%29');
    // Spaces encoded as %20 (not +)
    assert.strictEqual(rfc3986Encode('food safe 365'), 'food%20safe%20365');
  });

  test('SigV4 1.2: SHA-256 hex calculation matches standard digest', () => {
    // Empty string SHA-256
    const emptySha = sha256Hex('');
    assert.strictEqual(emptySha, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    // Standard test string
    const testSha = sha256Hex('FoodSafe365');
    assert.strictEqual(testSha, crypto.createHash('sha256').update('FoodSafe365').digest('hex'));
  });

  test('SigV4 1.3: Key derivation matches standard AWS 4-step HMAC hierarchy', () => {
    const secret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    const date = '20261014';
    const region = 'ap-south-1';
    const service = 's3';

    const signingKey = deriveSigningKey(secret, date, region, service);
    assert.strictEqual(Buffer.isBuffer(signingKey), true);
    assert.strictEqual(signingKey.length, 32); // 256 bits

    // Manual step-by-step verification
    const kDate = crypto.createHmac('sha256', 'AWS4' + secret).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigningExpected = crypto.createHmac('sha256', kService).update('aws4_request').digest();

    assert.strictEqual(signingKey.equals(kSigningExpected), true);
  });

  test('SigV4 1.4: Canonical URI formats paths and preserves hierarchy', () => {
    assert.strictEqual(buildCanonicalUri('/'), '/');
    assert.strictEqual(buildCanonicalUri('/tenants/org_1/outlets/out_2'), '/tenants/org_1/outlets/out_2');
    assert.strictEqual(buildCanonicalUri('tenants/file with space.jpg'), '/tenants/file%20with%20space.jpg');
  });

  test('SigV4 1.5: Canonical Query String sorts parameters strictly by key then value', () => {
    const rawQuery = {
      'X-Amz-SignedHeaders': 'host',
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Date': '20261014T120000Z',
      'X-Amz-Credential': 'AKIAIOSFODNN7EXAMPLE/20261014/ap-south-1/s3/aws4_request'
    };
    const canonicalQuery = buildCanonicalQueryString(rawQuery);
    const expectedOrder = [
      'X-Amz-Algorithm=AWS4-HMAC-SHA256',
      'X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20261014%2Fap-south-1%2Fs3%2Faws4_request',
      'X-Amz-Date=20261014T120000Z',
      'X-Amz-SignedHeaders=host'
    ].join('&');
    assert.strictEqual(canonicalQuery, expectedOrder);
  });

  test('SigV4 1.6: Canonical Headers lowercases, trims and collapses whitespaces', () => {
    const headers = {
      'Host': 's3.ap-south-1.amazonaws.com',
      'Content-Type': 'image/jpeg   ',
      'X-Amz-Checksum-SHA256': '   hash123   '
    };
    const { canonicalHeaders, signedHeaders } = buildCanonicalHeaders(headers);
    assert.strictEqual(signedHeaders, 'content-type;host;x-amz-checksum-sha256');
    assert.strictEqual(
      canonicalHeaders,
      'content-type:image/jpeg\nhost:s3.ap-south-1.amazonaws.com\nx-amz-checksum-sha256:hash123\n'
    );
  });

  test('SigV4 1.7: createPresignedUrl generates valid signed URL with all mandatory parameters', () => {
    const fixedDate = new Date('2026-10-14T12:00:00.000Z');
    const presignedUrl = createPresignedUrl({
      credentials: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      },
      region: 'ap-south-1',
      service: 's3',
      method: 'PUT',
      endpoint: 'https://s3.ap-south-1.amazonaws.com',
      path: '/foodsafe365-evidence/tenants/org1/test.jpg',
      headers: {
        'content-type': 'image/jpeg'
      },
      expiresInSeconds: 300,
      date: fixedDate
    });

    const parsed = new URL(presignedUrl);
    assert.strictEqual(parsed.searchParams.get('X-Amz-Algorithm'), 'AWS4-HMAC-SHA256');
    assert.strictEqual(
      parsed.searchParams.get('X-Amz-Credential'),
      'AKIAIOSFODNN7EXAMPLE/20261014/ap-south-1/s3/aws4_request'
    );
    assert.strictEqual(parsed.searchParams.get('X-Amz-Date'), '20261014T120000Z');
    assert.strictEqual(parsed.searchParams.get('X-Amz-Expires'), '300');
    assert.strictEqual(parsed.searchParams.get('X-Amz-SignedHeaders'), 'content-type;host');
    const sig = parsed.searchParams.get('X-Amz-Signature');
    assert.ok(sig, 'X-Amz-Signature must be present');
    assert.strictEqual(sig.length, 64, 'Signature must be a 64-char hex string');
  });

  // ---------------------------------------------------------------------------
  // SECTION 2: TENANT-ISOLATED OBJECT KEY GENERATION & SANITIZATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: TENANT-ISOLATED OBJECT KEY GENERATION ---');

  test('KeyGen 2.1: Constructs valid tenant-isolated path hierarchy', () => {
    const key = buildEvidenceStorageKey({
      organisationId: 'org_taj_hotels',
      outletId: 'outlet_mumbai_01',
      entityType: 'haccp_monitoring',
      entityId: 'ccp_cooking_record_99',
      fileName: 'probe_temp_reading.jpg',
      evidenceId: 'ev_12345678'
    });

    assert.strictEqual(
      key,
      'tenants/org_taj_hotels/outlets/outlet_mumbai_01/haccp_monitoring/ccp_cooking_record_99/ev_12345678-probe_temp_reading.jpg'
    );
  });

  test('KeyGen 2.2: Rejects path traversal attempts in tenant identifiers', () => {
    const maliciousCases = [
      '../escape_tenant',
      'org/sub_org',
      'org\\windows',
      'org\0nullbyte',
      'org;DROP TABLE'
    ];
    for (const badId of maliciousCases) {
      assert.throws(
        () =>
          buildEvidenceStorageKey({
            organisationId: badId,
            outletId: 'out_1',
            entityType: 'check_response',
            entityId: 'ent_1',
            fileName: 'pic.jpg'
          }),
        (err: any) => err.message.includes('INVALID_STORAGE_KEY_PARAM')
      );
    }
  });

  test('KeyGen 2.3: Rejects disallowed entity types', () => {
    const disallowed = ['user_profile', 'credit_card', 'salary', 'logs', 'system'];
    for (const badType of disallowed) {
      assert.throws(
        () =>
          buildEvidenceStorageKey({
            organisationId: 'org_1',
            outletId: 'out_1',
            entityType: badType,
            entityId: 'ent_1',
            fileName: 'pic.jpg'
          }),
        (err: any) => err.message.includes('INVALID_ENTITY_TYPE')
      );
    }
  });

  test('KeyGen 2.4: sanitizeFileName strips path traversal and invalid characters', () => {
    assert.strictEqual(sanitizeFileName('../../../etc/passwd'), 'passwd');
    assert.strictEqual(sanitizeFileName('C:\\Windows\\System32\\cmd.exe'), 'cmd.exe');
    assert.strictEqual(sanitizeFileName('My Photo (Food Safety) #1.JPEG'), 'My_Photo_Food_Safety_1.jpeg');
    assert.strictEqual(sanitizeFileName('   '), 'file');
  });

  test('KeyGen 2.5: parseEvidenceStorageKey roundtrips valid keys and rejects foreign keys', () => {
    const validKey = 'tenants/org_10/outlets/out_20/corrective_action/act_30/ev_40-proof.png';
    const parsed = parseEvidenceStorageKey(validKey);
    assert.deepStrictEqual(parsed, {
      organisationId: 'org_10',
      outletId: 'out_20',
      entityType: 'corrective_action',
      entityId: 'act_30',
      evidenceId: 'ev_40',
      fileName: 'proof.png'
    });

    // Foreign / arbitrary paths must return null
    assert.strictEqual(parseEvidenceStorageKey('public/uploads/file.png'), null);
    assert.strictEqual(parseEvidenceStorageKey('tenants/org_10/outlets/out_20/invalid_type/act_30/ev_40-proof.png'), null);
    assert.strictEqual(parseEvidenceStorageKey(''), null);
  });

  // ---------------------------------------------------------------------------
  // SECTION 3: SERVER-SIDE MAGIC-BYTE DETECTION & FORMAT VALIDATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: MAGIC-BYTE DETECTION & FILE FORMAT VALIDATION ---');

  test('Sniffer 3.1: Detects valid JPEG magic bytes (FF D8 FF)', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const detected = detectMagicBytes(jpegBuffer);
    assert.ok(detected);
    assert.strictEqual(detected.mime, 'image/jpeg');
    assert.strictEqual(detected.extension, 'jpg');

    const inspection = inspectBinaryContent(jpegBuffer, 'image/jpeg');
    assert.strictEqual(inspection.safe, true);
  });

  test('Sniffer 3.2: Detects valid PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const detected = detectMagicBytes(pngBuffer);
    assert.ok(detected);
    assert.strictEqual(detected.mime, 'image/png');
    assert.strictEqual(detected.extension, 'png');

    const inspection = inspectBinaryContent(pngBuffer, 'image/png');
    assert.strictEqual(inspection.safe, true);
  });

  test('Sniffer 3.3: Detects valid PDF magic bytes (%PDF)', () => {
    const pdfBuffer = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
    const detected = detectMagicBytes(pdfBuffer);
    assert.ok(detected);
    assert.strictEqual(detected.mime, 'application/pdf');
    assert.strictEqual(detected.extension, 'pdf');

    const inspection = inspectBinaryContent(pdfBuffer, 'application/pdf');
    assert.strictEqual(inspection.safe, true);
  });

  test('Sniffer 3.4: Rejects empty files and files exceeding maximum 10 MB size', () => {
    // Empty
    const emptyInspection = inspectBinaryContent(Buffer.alloc(0));
    assert.strictEqual(emptyInspection.safe, false);
    assert.strictEqual(emptyInspection.reason, 'EMPTY_FILE');

    // Oversized buffer
    const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1);
    oversizedBuffer[0] = 0xff;
    oversizedBuffer[1] = 0xd8;
    oversizedBuffer[2] = 0xff; // Pretend JPEG
    const overInspection = inspectBinaryContent(oversizedBuffer);
    assert.strictEqual(overInspection.safe, false);
    assert.ok(overInspection.violations.some(v => v.includes('exceeds maximum allowed size')));
  });

  test('Sniffer 3.5: Detects MIME mismatch between client declaration and magic bytes', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    // Client claims it's a JPEG
    const inspection = inspectBinaryContent(pngBuffer, 'image/jpeg');
    assert.strictEqual(inspection.safe, false);
    assert.ok(inspection.violations.some(v => v.includes('MIME mismatch')));
  });

  // ---------------------------------------------------------------------------
  // SECTION 4: DISGUISED EXECUTABLE & MALICIOUS SCRIPT DEFENSE
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: DISGUISED EXECUTABLES & SCRIPT INJECTION DEFENSE ---');

  test('Defense 4.1: Rejects Windows Portable Executables (MZ / PE / DLL)', () => {
    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
    assert.strictEqual(containsExecutableHeader(exeBuffer).hasExecutableHeader, true);

    const inspection = inspectBinaryContent(exeBuffer, 'image/jpeg');
    assert.strictEqual(inspection.safe, false);
    assert.ok(inspection.violations.some(v => v.includes('Windows Portable Executable')));
  });

  test('Defense 4.2: Rejects Linux ELF Executables', () => {
    const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]); // \x7fELF header
    assert.strictEqual(containsExecutableHeader(elfBuffer).hasExecutableHeader, true);

    const inspection = inspectBinaryContent(elfBuffer, 'application/pdf');
    assert.strictEqual(inspection.safe, false);
    assert.ok(inspection.violations.some(v => v.includes('Linux Executable')));
  });

  test('Defense 4.3: Rejects macOS Mach-O Binaries', () => {
    const machoBuffer = Buffer.from([0xfe, 0xed, 0xfa, 0xce, 0x00, 0x00, 0x00, 0x01]);
    assert.strictEqual(containsExecutableHeader(machoBuffer).hasExecutableHeader, true);

    const inspection = inspectBinaryContent(machoBuffer, 'image/png');
    assert.strictEqual(inspection.safe, false);
    assert.ok(inspection.violations.some(v => v.includes('Mach-O Binary')));
  });

  test('Defense 4.4: Rejects Shell Scripts (#!)', () => {
    const scriptBuffer = Buffer.from('#!/bin/bash\nrm -rf /\n');
    assert.strictEqual(containsExecutableHeader(scriptBuffer).hasExecutableHeader, true);

    const inspection = inspectBinaryContent(scriptBuffer, 'image/jpeg');
    assert.strictEqual(inspection.safe, false);
    assert.ok(inspection.violations.some(v => v.includes('Shell Script')));
  });

  test('Defense 4.5: Rejects disguised HTML and script injection in binary sample', () => {
    const polyglotCases = [
      Buffer.from('<script>alert("hacked")</script>'),
      Buffer.from('<html><body><script src="evil.js"></script></body></html>'),
      Buffer.from('<svg onload="fetch(\'/steal\')" />'),
      Buffer.from('<?php echo system($_GET["cmd"]); ?>')
    ];

    for (const poly of polyglotCases) {
      const inspection = inspectBinaryContent(poly, 'image/jpeg');
      assert.strictEqual(inspection.safe, false);
      assert.ok(
        inspection.violations.some(v => v.includes('script or HTML') || v.includes('Unsupported')),
        'Must detect script or unsupported format'
      );
    }
  });

  test('Defense 4.6: Rejects PDFs containing dangerous active script tokens (/JavaScript, /Launch)', () => {
    const maliciousPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R /OpenAction 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Action /S /JavaScript /JS (app.alert("Pwned");) >>\nendobj\n%%EOF'
    );
    const inspection = inspectBinaryContent(maliciousPdf, 'application/pdf');
    assert.strictEqual(inspection.safe, false);
    assert.ok(
      inspection.violations.some(v => v.includes('dangerous active executable token')),
      'Must detect /JavaScript stream in PDF'
    );
  });

  // ---------------------------------------------------------------------------
  // SECTION 5: STORAGE PROVIDER ABSTRACTION & PRODUCTION SAFETY
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: STORAGE ABSTRACTION & FAIL-CLOSED GUARDS ---');

  test('Storage 5.1: MemoryStorageProvider performs CRUD and simulated presigned URLs', async () => {
    const memory = new MemoryStorageProvider();
    const testKey = 'tenants/org_1/outlets/out_1/document/doc_1/ev_1-license.pdf';
    const testData = Buffer.from('%PDF-1.5 valid sample pdf content for testing');

    // 1. Put object
    await memory.putObject(testKey, testData, 'application/pdf');

    // 2. Head object
    const meta = await memory.headObject(testKey);
    assert.ok(meta);
    assert.strictEqual(meta.contentLength, testData.length);
    assert.strictEqual(meta.contentType, 'application/pdf');

    // 3. Read range
    const range = await memory.readByteRange(testKey, 0, 4);
    assert.ok(range);
    assert.strictEqual(range.toString('utf8'), '%PDF-');

    // 4. Presigned URLs
    const presignedUp = await memory.createPresignedUploadUrl({
      key: 'new_key.jpg',
      contentType: 'image/jpeg',
      contentLength: 100
    });
    assert.ok(presignedUp.url.startsWith('memory://'));

    const presignedDown = await memory.createPresignedDownloadUrl({
      key: testKey,
      filename: 'safe_license.pdf'
    });
    assert.ok(presignedDown.startsWith('memory://'));

    // 5. Delete object
    const deleted = await memory.deleteObject(testKey);
    assert.strictEqual(deleted, true);
    assert.strictEqual(await memory.headObject(testKey), null);
  });

  test('Storage 5.2: S3StorageProvider validates required configuration parameters', () => {
    assert.throws(
      () => new S3StorageProvider({ driver: 's3' }),
      (err: any) => err.message.includes('S3_CONFIGURATION_ERROR')
    );
    assert.throws(
      () =>
        new S3StorageProvider({
          driver: 's3',
          endpoint: 'https://s3.ap-south-1.amazonaws.com',
          bucket: 'my-bucket'
          // Missing accessKeyId, secretAccessKey, region
        }),
      (err: any) => err.message.includes('S3_CONFIGURATION_ERROR')
    );
  });

  test('Storage 5.3: Production fail-closed rule prevents Memory storage driver in production', () => {
    resetStorageProvider();
    const prodEnvWithMemory: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      STORAGE_DRIVER: 'memory'
    };
    assert.throws(
      () => getStorageProvider(prodEnvWithMemory),
      (err: any) => err.message.includes('Memory storage driver is strictly forbidden in production')
    );
    resetStorageProvider();
  });

  test('Storage 5.4: Production fail-closed rule prevents unconfigured S3 storage in production', () => {
    resetStorageProvider();
    const prodEnvIncompleteS3: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      STORAGE_DRIVER: 's3'
      // Missing all S3 connection parameters
    };
    assert.throws(
      () => getStorageProvider(prodEnvIncompleteS3),
      (err: any) => err.message.includes('Production S3 storage configuration is missing or incomplete')
    );
    resetStorageProvider();
  });

  test('Storage 5.5: Non-production environment defaults cleanly to MemoryStorageProvider', () => {
    resetStorageProvider();
    const devEnv: NodeJS.ProcessEnv = {
      NODE_ENV: 'development'
    };
    const provider = getStorageProvider(devEnv);
    assert.strictEqual(provider.name, 'memory');
    resetStorageProvider();
  });

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${totalTests} STAGE 6A UNIT TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================');
}

runStorageUnitTests().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
