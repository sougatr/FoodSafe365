/**
 * FoodSafe365 — In-Memory Mock Storage Provider
 * For isolated, deterministic unit and mocked integration testing.
 * Strictly forbidden in production environments.
 */

import crypto from 'crypto';
import {
  StorageProvider,
  StorageObjectMetadata,
  PresignedUploadRequest,
  PresignedUploadResult,
  PresignedDownloadRequest
} from './types';

interface StoredItem {
  buffer: Buffer;
  metadata: StorageObjectMetadata;
}

export class MemoryStorageProvider implements StorageProvider {
  public readonly name = 'memory' as const;
  private items = new Map<string, StoredItem>();

  async createPresignedUploadUrl(params: PresignedUploadRequest): Promise<PresignedUploadResult> {
    const expiresAt = new Date(Date.now() + (params.expiresInSeconds || 300) * 1000);
    const mockToken = crypto.randomUUID();
    const url = `memory://mock-s3/upload/${encodeURIComponent(params.key)}?mock_token=${mockToken}&expires=${expiresAt.getTime()}`;

    const headers: Record<string, string> = {
      'Content-Type': params.contentType
    };
    if (params.checksumSha256) {
      headers['x-amz-checksum-sha256'] = params.checksumSha256;
    }

    return { url, headers, expiresAt };
  }

  async createPresignedDownloadUrl(params: PresignedDownloadRequest): Promise<string> {
    const item = this.items.get(params.key);
    if (!item) {
      throw new Error(`OBJECT_NOT_FOUND: Key "${params.key}" not found in memory store.`);
    }
    const expiresAt = Date.now() + (params.expiresInSeconds || 60) * 1000;
    const mockToken = crypto.randomUUID();
    const disposition = params.disposition || 'inline';
    const filename = params.filename ? `&filename=${encodeURIComponent(params.filename)}` : '';

    return `memory://mock-s3/download/${encodeURIComponent(params.key)}?mock_token=${mockToken}&disposition=${disposition}&expires=${expiresAt}${filename}`;
  }

  async headObject(key: string): Promise<StorageObjectMetadata | null> {
    const item = this.items.get(key);
    return item ? { ...item.metadata } : null;
  }

  async readByteRange(key: string, start: number, end: number): Promise<Buffer | null> {
    const item = this.items.get(key);
    if (!item) return null;
    const actualEnd = Math.min(end + 1, item.buffer.length);
    return Buffer.from(item.buffer.subarray(start, actualEnd));
  }

  async putObject(
    key: string,
    data: Buffer,
    contentType: string,
    checksumSha256?: string
  ): Promise<void> {
    const hash = checksumSha256 || crypto.createHash('sha256').update(data).digest('hex');
    const etag = `"${crypto.createHash('md5').update(data).digest('hex')}"`;

    this.items.set(key, {
      buffer: Buffer.from(data),
      metadata: {
        contentLength: data.length,
        contentType,
        etag,
        checksumSha256: hash,
        lastModified: new Date()
      }
    });
  }

  async deleteObject(key: string): Promise<boolean> {
    return this.items.delete(key);
  }

  // Testing helpers
  public _clear(): void {
    this.items.clear();
  }

  public _has(key: string): boolean {
    return this.items.has(key);
  }

  public _get(key: string): StoredItem | undefined {
    return this.items.get(key);
  }
}
