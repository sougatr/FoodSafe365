/**
 * FoodSafe365 — S3-Compatible Storage Provider
 * Zero external dependencies: Uses native Node.js crypto and standard fetch for S3 REST interactions.
 */

import crypto from 'crypto';
import {
  StorageProvider,
  StorageConfig,
  StorageObjectMetadata,
  PresignedUploadRequest,
  PresignedUploadResult,
  PresignedDownloadRequest
} from './types';
import { createPresignedUrl, sha256Hex, deriveSigningKey, buildCanonicalHeaders, buildCanonicalRequest, buildStringToSign, formatSigV4Timestamps } from './sigv4';

function toBase64Sha256(val?: string): string | undefined {
  if (!val) return undefined;
  if (val.length === 64 && /^[0-9a-fA-F]+$/.test(val)) {
    return Buffer.from(val, 'hex').toString('base64');
  }
  return val;
}

function toHexSha256(val?: string | null): string | undefined {
  if (!val) return undefined;
  // If already 64 hex chars, preserve it
  if (val.length === 64 && /^[0-9a-fA-F]+$/.test(val)) {
    return val.toLowerCase();
  }
  // If standard AWS base64 (44 chars, ends with =), convert to hex
  try {
    const buf = Buffer.from(val, 'base64');
    if (buf.length === 32) {
      return buf.toString('hex').toLowerCase();
    }
  } catch {
    // fallback
  }
  return val;
}

export class S3StorageProvider implements StorageProvider {
  public readonly name = 's3' as const;
  private config: Required<Omit<StorageConfig, 'driver'>> & { driver: 's3' };

  constructor(cfg: StorageConfig) {
    if (!cfg.endpoint || !cfg.bucket || !cfg.region || !cfg.accessKeyId || !cfg.secretAccessKey) {
      throw new Error(
        'S3_CONFIGURATION_ERROR: endpoint, bucket, region, accessKeyId, and secretAccessKey are required.'
      );
    }

    this.config = {
      driver: 's3',
      endpoint: cfg.endpoint.replace(/\/+$/, ''),
      bucket: cfg.bucket.trim(),
      region: cfg.region.trim(),
      accessKeyId: cfg.accessKeyId.trim(),
      secretAccessKey: cfg.secretAccessKey.trim(),
      forcePathStyle: cfg.forcePathStyle ?? false,
      uploadTtlSeconds: cfg.uploadTtlSeconds || 300,
      downloadTtlSeconds: cfg.downloadTtlSeconds || 60
    };
  }

  /**
   * Resolves the target base URL and S3 path for an object key.
   */
  private resolveUrlAndPath(key: string): { baseUrl: string; path: string } {
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;
    if (this.config.forcePathStyle) {
      // Path style: https://endpoint/bucket/key
      return {
        baseUrl: this.config.endpoint,
        path: `/${this.config.bucket}/${cleanKey}`
      };
    } else {
      // Virtual-hosted style: https://bucket.endpoint/key
      const parsed = new URL(this.config.endpoint);
      const virtualHost = `${this.config.bucket}.${parsed.host}`;
      const baseUrl = `${parsed.protocol}//${virtualHost}`;
      return {
        baseUrl,
        path: `/${cleanKey}`
      };
    }
  }

  /**
   * Signs an HTTP request with AWS SigV4 Authorization header.
   */
  private signRequestHeaders(
    method: string,
    url: URL,
    headers: Record<string, string>,
    payloadHash: string
  ): Record<string, string> {
    const { amzDateTime, dateStamp } = formatSigV4Timestamps();
    const service = 's3';
    const credentialScope = `${dateStamp}/${this.config.region}/${service}/aws4_request`;

    const headersToSign: Record<string, string> = {
      host: url.host,
      'x-amz-date': amzDateTime,
      'x-amz-content-sha256': payloadHash,
      ...headers
    };

    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const { canonicalRequest, signedHeaders } = buildCanonicalRequest({
      method,
      uri: url.pathname,
      queryParams,
      headers: headersToSign,
      payloadHash
    });

    const stringToSign = buildStringToSign(amzDateTime, credentialScope, canonicalRequest);
    const signingKey = deriveSigningKey(this.config.secretAccessKey, dateStamp, this.config.region, service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      ...headersToSign,
      Authorization: authHeader
    };
  }

  async createPresignedUploadUrl(params: PresignedUploadRequest): Promise<PresignedUploadResult> {
    const { baseUrl, path } = this.resolveUrlAndPath(params.key);
    const ttl = params.expiresInSeconds || this.config.uploadTtlSeconds;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const headersToSign: Record<string, string> = {
      'content-type': params.contentType
    };
    if (params.checksumSha256) {
      headersToSign['x-amz-checksum-sha256'] = toBase64Sha256(params.checksumSha256)!;
    }

    const url = createPresignedUrl({
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      },
      region: this.config.region,
      service: 's3',
      method: 'PUT',
      endpoint: baseUrl,
      path,
      headers: headersToSign,
      expiresInSeconds: ttl
    });

    return {
      url,
      headers: headersToSign,
      expiresAt
    };
  }

  async createPresignedDownloadUrl(params: PresignedDownloadRequest): Promise<string> {
    const { baseUrl, path } = this.resolveUrlAndPath(params.key);
    const ttl = params.expiresInSeconds || this.config.downloadTtlSeconds;

    const queryParams: Record<string, string> = {};
    if (params.filename || params.disposition) {
      const disp = params.disposition || 'inline';
      const filenamePart = params.filename ? `; filename="${encodeURIComponent(params.filename)}"` : '';
      queryParams['response-content-disposition'] = `${disp}${filenamePart}`;
    }

    return createPresignedUrl({
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      },
      region: this.config.region,
      service: 's3',
      method: 'GET',
      endpoint: baseUrl,
      path,
      queryParams,
      expiresInSeconds: ttl
    });
  }

  async headObject(key: string): Promise<StorageObjectMetadata | null> {
    const { baseUrl, path } = this.resolveUrlAndPath(key);
    const targetUrl = new URL(path, baseUrl);

    const payloadHash = sha256Hex('');
    const signedHeaders = this.signRequestHeaders('HEAD', targetUrl, {}, payloadHash);

    try {
      const resp = await fetch(targetUrl.toString(), {
        method: 'HEAD',
        headers: signedHeaders
      });

      if (resp.status === 404) return null;
      if (!resp.ok) {
        throw new Error(`S3_HEAD_OBJECT_ERROR: S3 returned status ${resp.status} ${resp.statusText}`);
      }

      const contentLength = Number(resp.headers.get('content-length') || 0);
      const contentType = resp.headers.get('content-type') || 'application/octet-stream';
      const etag = resp.headers.get('etag') || '';
      const rawChecksum = resp.headers.get('x-amz-checksum-sha256');
      const checksumSha256 = toHexSha256(rawChecksum);
      const lastModifiedHeader = resp.headers.get('last-modified');
      const lastModified = lastModifiedHeader ? new Date(lastModifiedHeader) : new Date();

      return {
        contentLength,
        contentType,
        etag,
        checksumSha256,
        lastModified
      };
    } catch (err: any) {
      if (err.message && err.message.includes('S3_HEAD_OBJECT_ERROR')) throw err;
      throw new Error(`S3_COMMUNICATION_ERROR: Failed to connect to S3 endpoint: ${err.message}`);
    }
  }

  async readByteRange(key: string, start: number, end: number): Promise<Buffer | null> {
    const { baseUrl, path } = this.resolveUrlAndPath(key);
    const targetUrl = new URL(path, baseUrl);

    const payloadHash = sha256Hex('');
    const extraHeaders = {
      range: `bytes=${start}-${end}`
    };
    const signedHeaders = this.signRequestHeaders('GET', targetUrl, extraHeaders, payloadHash);

    try {
      const resp = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: signedHeaders
      });

      if (resp.status === 404) return null;
      if (!resp.ok && resp.status !== 206) {
        throw new Error(`S3_READ_RANGE_ERROR: S3 returned status ${resp.status}`);
      }

      const arrayBuf = await resp.arrayBuffer();
      return Buffer.from(arrayBuf);
    } catch (err: any) {
      if (err.message && err.message.includes('S3_READ_RANGE_ERROR')) throw err;
      throw new Error(`S3_COMMUNICATION_ERROR: Failed to read from S3 endpoint: ${err.message}`);
    }
  }

  async putObject(
    key: string,
    data: Buffer,
    contentType: string,
    checksumSha256?: string
  ): Promise<void> {
    const { baseUrl, path } = this.resolveUrlAndPath(key);
    const targetUrl = new URL(path, baseUrl);

    const payloadHash = checksumSha256 || sha256Hex(data);
    const extraHeaders: Record<string, string> = {
      'content-type': contentType,
      'content-length': String(data.length)
    };
    if (checksumSha256) {
      extraHeaders['x-amz-checksum-sha256'] = toBase64Sha256(checksumSha256)!;
    }

    const signedHeaders = this.signRequestHeaders('PUT', targetUrl, extraHeaders, payloadHash);

    const resp = await fetch(targetUrl.toString(), {
      method: 'PUT',
      headers: signedHeaders,
      body: new Uint8Array(data)
    });

    if (!resp.ok) {
      throw new Error(`S3_PUT_OBJECT_ERROR: S3 returned status ${resp.status}`);
    }
  }

  async deleteObject(key: string): Promise<boolean> {
    const { baseUrl, path } = this.resolveUrlAndPath(key);
    const targetUrl = new URL(path, baseUrl);

    const payloadHash = sha256Hex('');
    const signedHeaders = this.signRequestHeaders('DELETE', targetUrl, {}, payloadHash);

    try {
      const resp = await fetch(targetUrl.toString(), {
        method: 'DELETE',
        headers: signedHeaders
      });

      // S3 returns 204 No Content for successful delete or if key does not exist
      return resp.ok || resp.status === 204 || resp.status === 404;
    } catch {
      return false;
    }
  }
}
