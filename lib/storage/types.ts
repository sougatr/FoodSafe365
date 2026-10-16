/**
 * FoodSafe365 — Storage Foundations & Abstraction Types
 * P0-6 Hardening: Type contracts for S3-compatible and in-memory object storage.
 */

export type StorageDriver = 's3' | 'memory';

export interface StorageConfig {
  driver: StorageDriver;
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
  uploadTtlSeconds?: number;
  downloadTtlSeconds?: number;
}

export interface StorageObjectMetadata {
  contentLength: number;
  contentType: string;
  etag: string;
  checksumSha256?: string;
  lastModified: Date;
}

export interface PresignedUploadRequest {
  key: string;
  contentType: string;
  contentLength: number;
  checksumSha256?: string;
  expiresInSeconds?: number;
}

export interface PresignedUploadResult {
  url: string;
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface PresignedDownloadRequest {
  key: string;
  filename?: string;
  expiresInSeconds?: number;
  disposition?: 'inline' | 'attachment';
}

export interface StorageProvider {
  readonly name: StorageDriver;
  createPresignedUploadUrl(params: PresignedUploadRequest): Promise<PresignedUploadResult>;
  createPresignedDownloadUrl(params: PresignedDownloadRequest): Promise<string>;
  headObject(key: string): Promise<StorageObjectMetadata | null>;
  readByteRange(key: string, start: number, end: number): Promise<Buffer | null>;
  putObject(key: string, data: Buffer, contentType: string, checksumSha256?: string): Promise<void>;
  deleteObject(key: string): Promise<boolean>;
}
