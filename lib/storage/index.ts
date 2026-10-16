/**
 * FoodSafe365 — Storage Foundations & Factory
 * Manages storage provider lifecycle and enforces fail-closed production rules.
 */

export * from './types';
export * from './key-generator';
export * from './sigv4';
export * from './sniffer';
export * from './memory';
export * from './s3';

import { StorageProvider, StorageConfig } from './types';
import { MemoryStorageProvider } from './memory';
import { S3StorageProvider } from './s3';

let activeProvider: StorageProvider | null = null;

export function setStorageProviderForTesting(provider: StorageProvider | null): void {
  activeProvider = provider;
}

export function resetStorageProvider(): void {
  activeProvider = null;
}

export function resolveStorageConfig(customEnv?: NodeJS.ProcessEnv): StorageConfig {
  const env = customEnv || process.env;
  const isProduction = env.NODE_ENV === 'production';
  const rawDriver = (env.STORAGE_DRIVER || '').trim().toLowerCase();

  const driver = (rawDriver === 'memory' ? 'memory' : rawDriver === 's3' ? 's3' : isProduction ? 's3' : 'memory') as 's3' | 'memory';

  return {
    driver,
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION || 'ap-south-1',
    bucket: env.STORAGE_BUCKET,
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
    forcePathStyle: env.STORAGE_FORCE_PATH_STYLE === 'true',
    uploadTtlSeconds: env.STORAGE_UPLOAD_TTL ? Number(env.STORAGE_UPLOAD_TTL) : 300,
    downloadTtlSeconds: env.STORAGE_DOWNLOAD_TTL ? Number(env.STORAGE_DOWNLOAD_TTL) : 60
  };
}

export function getStorageProvider(customEnv?: NodeJS.ProcessEnv): StorageProvider {
  if (activeProvider) return activeProvider;

  const env = customEnv || process.env;
  const isProduction = env.NODE_ENV === 'production';
  const config = resolveStorageConfig(env);

  if (isProduction) {
    if (config.driver === 'memory') {
      throw new Error(
        'STORAGE_CONFIGURATION_ERROR: Memory storage driver is strictly forbidden in production. S3-compatible object storage is required.'
      );
    }

    if (!config.endpoint || !config.bucket || !config.region || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error(
        'STORAGE_CONFIGURATION_ERROR: Production S3 storage configuration is missing or incomplete.'
      );
    }

    activeProvider = new S3StorageProvider(config);
    return activeProvider;
  }

  // Non-production
  if (config.driver === 's3') {
    activeProvider = new S3StorageProvider(config);
    return activeProvider;
  }

  // Default to memory driver in test/dev
  activeProvider = new MemoryStorageProvider();
  return activeProvider;
}
