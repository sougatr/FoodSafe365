/**
 * FoodSafe365 — AWS Signature Version 4 (SigV4) Reference Implementation
 * Zero external dependencies — built with Node.js crypto.
 * Implements standard AWS SigV4 query-parameter and header signing for S3 REST API.
 */

import crypto from 'crypto';

export interface SigV4Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface CanonicalRequestOptions {
  method: string;
  uri: string;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  signedHeaders?: string[];
  payloadHash?: string;
}

export interface PresignedUrlSignerOptions {
  credentials: SigV4Credentials;
  region: string;
  service?: string; // default 's3'
  method: 'GET' | 'PUT' | 'HEAD' | 'DELETE' | 'POST';
  endpoint: string;
  path: string;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  expiresInSeconds?: number;
  date?: Date;
}

/**
 * RFC 3986 compliant URI encoder.
 * AWS SigV4 strictly requires encoding characters: ! * ' ( )
 */
export function rfc3986Encode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * SHA-256 hash of a string or Buffer, returned as lowercase hex.
 */
export function sha256Hex(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * HMAC-SHA256 digest returning raw Buffer.
 */
export function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

/**
 * Derives the AWS SigV4 signing key.
 * kDate    = HMAC-SHA256("AWS4" + kSecret, Date)
 * kRegion  = HMAC-SHA256(kDate, Region)
 * kService = HMAC-SHA256(kRegion, Service)
 * kSigning = HMAC-SHA256(kService, "aws4_request")
 */
export function deriveSigningKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string = 's3'
): Buffer {
  const kDate = hmacSha256('AWS4' + secretAccessKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
}

/**
 * Builds the canonical URI by encoding each path segment.
 */
export function buildCanonicalUri(pathStr: string): string {
  if (!pathStr || pathStr === '/') return '/';
  const cleanPath = pathStr.startsWith('/') ? pathStr : '/' + pathStr;
  const segments = cleanPath.split('/').map(seg => rfc3986Encode(seg));
  return segments.join('/');
}

/**
 * Builds the canonical query string sorted by key then value.
 */
export function buildCanonicalQueryString(queryParams: Record<string, string>): string {
  const keys = Object.keys(queryParams).sort();
  return keys
    .map(key => {
      const encodedKey = rfc3986Encode(key);
      const encodedVal = rfc3986Encode(queryParams[key] || '');
      return `${encodedKey}=${encodedVal}`;
    })
    .join('&');
}

/**
 * Builds canonical headers and signed headers list.
 */
export function buildCanonicalHeaders(headers: Record<string, string>): {
  canonicalHeaders: string;
  signedHeaders: string;
} {
  const sortedNames = Object.keys(headers)
    .map(k => k.toLowerCase().trim())
    .sort();

  let canonicalHeaders = '';
  for (const name of sortedNames) {
    // Find original value
    const originalKey = Object.keys(headers).find(k => k.toLowerCase().trim() === name);
    const rawVal = originalKey ? headers[originalKey] : '';
    const cleanVal = rawVal.replace(/\s+/g, ' ').trim();
    canonicalHeaders += `${name}:${cleanVal}\n`;
  }

  const signedHeaders = sortedNames.join(';');
  return { canonicalHeaders, signedHeaders };
}

/**
 * Builds the complete Canonical Request.
 */
export function buildCanonicalRequest(options: CanonicalRequestOptions): {
  canonicalRequest: string;
  signedHeaders: string;
} {
  const canonicalUri = buildCanonicalUri(options.uri);
  const canonicalQuery = options.queryParams ? buildCanonicalQueryString(options.queryParams) : '';
  const { canonicalHeaders, signedHeaders } = buildCanonicalHeaders(options.headers || {});
  const payloadHash = options.payloadHash || 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    options.method.toUpperCase(),
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  return { canonicalRequest, signedHeaders };
}

/**
 * Builds the String to Sign for SigV4.
 */
export function buildStringToSign(
  amzDateTime: string,
  credentialScope: string,
  canonicalRequest: string
): string {
  return [
    'AWS4-HMAC-SHA256',
    amzDateTime,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join('\n');
}

/**
 * Formats a Date to SigV4 timestamps:
 * amzDateTime: YYYYMMDDTHHMMSSZ
 * dateStamp:   YYYYMMDD
 */
export function formatSigV4Timestamps(d: Date = new Date()): { amzDateTime: string; dateStamp: string } {
  const iso = d.toISOString(); // e.g. 2026-10-14T11:30:00.000Z
  const amzDateTime = iso.replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDateTime.substring(0, 8);
  return { amzDateTime, dateStamp };
}

/**
 * Generates an AWS SigV4 Presigned URL.
 */
export function createPresignedUrl(options: PresignedUrlSignerOptions): string {
  const service = options.service || 's3';
  const { amzDateTime, dateStamp } = formatSigV4Timestamps(options.date || new Date());
  const credentialScope = `${dateStamp}/${options.region}/${service}/aws4_request`;

  const parsedUrl = new URL(options.endpoint);
  const host = parsedUrl.host;

  // Prepare headers for signing (at minimum host)
  const headersToSign: Record<string, string> = {
    host,
    ...(options.headers || {})
  };

  const { signedHeaders } = buildCanonicalHeaders(headersToSign);

  // Build query params including AWS auth params
  const query: Record<string, string> = {
    ...(options.queryParams || {}),
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${options.credentials.accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDateTime,
    'X-Amz-Expires': String(options.expiresInSeconds || 300),
    'X-Amz-SignedHeaders': signedHeaders
  };

  const { canonicalRequest } = buildCanonicalRequest({
    method: options.method,
    uri: options.path,
    queryParams: query,
    headers: headersToSign,
    payloadHash: 'UNSIGNED-PAYLOAD'
  });

  const stringToSign = buildStringToSign(amzDateTime, credentialScope, canonicalRequest);
  const signingKey = deriveSigningKey(options.credentials.secretAccessKey, dateStamp, options.region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  // Build final URL
  query['X-Amz-Signature'] = signature;
  const finalQueryString = buildCanonicalQueryString(query);

  const cleanBase = options.endpoint.replace(/\/+$/, '');
  const cleanPath = options.path.startsWith('/') ? options.path : '/' + options.path;

  return `${cleanBase}${cleanPath}?${finalQueryString}`;
}
