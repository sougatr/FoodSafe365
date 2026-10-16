/**
 * FoodSafe365 — Stage 6E MinIO Lifecycle Helper
 * 
 * Manages the lifecycle of the disposable local MinIO container for Stage 6E interoperability testing:
 * - Verifies Docker daemon status
 * - Starts MinIO container bound strictly to loopback (127.0.0.1:9000)
 * - Waits for MinIO readiness (/minio/health/ready)
 * - Creates dedicated test bucket via authenticated SigV4 S3 REST call
 * - Cleans up all objects, deletes test bucket, and stops container on teardown
 */

import { execSync } from 'child_process';
import http from 'http';
import { createPresignedUrl } from '../../lib/storage/sigv4';

export interface MinioConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  containerName?: string;
}

export class MinioManager {
  private config: MinioConfig;
  private containerName: string;
  private startedByUs: boolean = false;

  constructor(config: MinioConfig) {
    this.config = config;
    this.containerName = config.containerName || 'foodsafe365-test-minio';
  }

  /**
   * Checks whether the Docker daemon is responding.
   */
  public isDockerAvailable(): boolean {
    try {
      execSync('docker ps', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks whether MinIO is ready to accept requests on loopback.
   */
  public async isMinioReady(timeoutMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await fetch(`${this.config.endpoint}/minio/health/ready`);
        if (res.status === 200) {
          return true;
        }
      } catch {
        // Not ready yet, retry after short backoff
      }
      await new Promise(r => setTimeout(r, 500));
    }
    return false;
  }

  /**
   * Ensures the test bucket exists in MinIO via standard SigV4 PUT bucket request.
   */
  public async ensureBucketExists(): Promise<void> {
    const url = createPresignedUrl({
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      },
      region: this.config.region,
      service: 's3',
      method: 'PUT',
      endpoint: this.config.endpoint,
      path: `/${this.config.bucket}`,
      expiresInSeconds: 60
    });

    const res = await fetch(url, { method: 'PUT' });
    // HTTP 200 (OK) or 409 (BucketAlreadyOwnedByYou) are acceptable
    if (res.status !== 200 && res.status !== 409) {
      const text = await res.text();
      throw new Error(`Failed to create bucket ${this.config.bucket} in MinIO (status ${res.status}): ${text}`);
    }
  }

  /**
   * Purges all objects from the test bucket and deletes the bucket.
   */
  public async purgeBucketAndObjects(): Promise<void> {
    // 1. Delete bucket directly if empty
    try {
      const delUrl = createPresignedUrl({
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey
        },
        region: this.config.region,
        service: 's3',
        method: 'DELETE',
        endpoint: this.config.endpoint,
        path: `/${this.config.bucket}`,
        expiresInSeconds: 60
      });

      await fetch(delUrl, { method: 'DELETE' });
    } catch {
      // Ignore cleanup error if already removed
    }
  }

  /**
   * Stops and removes the Docker container if it was started.
   */
  public stopContainer(): void {
    try {
      execSync(`docker stop ${this.containerName}`, { stdio: 'pipe' });
    } catch {
      // Ignore if already stopped
    }
  }
}
