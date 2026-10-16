/**
 * FoodSafe365 — Stage 7 ClamAV Lifecycle Test Helper
 * 
 * Manages the lifecycle of the disposable local ClamAV test container.
 * - Enforces loopback binding to 127.0.0.1:3310
 * - Enforces container memory limit of 2 GB
 * - Verifies daemon readiness via socket ping
 * - Ensures complete container teardown and removal
 */

import { execSync } from 'child_process';
import { ClamAvAdapter } from '../../lib/storage/clamav-adapter';

export interface ClamAvManagerConfig {
  containerName?: string;
  image?: string;
  host?: string;
  port?: number;
  memoryLimit?: string;
}

export class ClamAvManager {
  private containerName: string;
  private image: string;
  private host: string;
  private port: number;
  private memoryLimit: string;
  private adapter: ClamAvAdapter;

  constructor(config?: ClamAvManagerConfig) {
    this.containerName = config?.containerName || 'foodsafe365-test-clamav';
    this.image = config?.image || 'clamav/clamav:1.4';
    this.host = config?.host || '127.0.0.1';
    this.port = config?.port || 3310;
    this.memoryLimit = config?.memoryLimit || '2g';
    this.adapter = new ClamAvAdapter({ host: this.host, port: this.port });
  }

  isDockerAvailable(): boolean {
    try {
      execSync('docker ps', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async isContainerRunning(): Promise<boolean> {
    try {
      const out = execSync(`docker ps --filter "name=${this.containerName}" --format "{{.Names}}"`, {
        stdio: 'pipe'
      }).toString();
      return out.trim().includes(this.containerName);
    } catch {
      return false;
    }
  }

  async startContainer(): Promise<void> {
    const running = await this.isContainerRunning();
    if (running) {
      return;
    }

    // Ensure any leftover dead container is removed first
    try {
      execSync(`docker rm -f ${this.containerName}`, { stdio: 'pipe' });
    } catch {}

    const cmd = `docker run -d --name ${this.containerName} -m ${this.memoryLimit} -p ${this.host}:${this.port}:3310 ${this.image}`;
    execSync(cmd, { stdio: 'pipe' });
  }

  async waitForReady(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const pong = await this.adapter.ping();
      if (pong) {
        return true;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
  }

  stopContainer(): void {
    try {
      execSync(`docker stop ${this.containerName} && docker rm ${this.containerName}`, {
        stdio: 'pipe'
      });
    } catch {
      // Ignore cleanup error if already stopped
    }
  }
}
