/**
 * FoodSafe365 — ClamAV Scanner Adapter
 * 
 * Implements the ClamAV daemon TCP client protocol (INSTREAM) without external dependencies.
 */

import net from 'net';
import { MalwareScannerAdapter } from './scanner-contract';

export interface ClamAvConfig {
  host?: string;
  port?: number;
  timeoutMs?: number;
  chunkSize?: number;
}

export class ClamAvAdapter implements MalwareScannerAdapter {
  public readonly name = 'clamav';
  private host: string;
  private port: number;
  private timeoutMs: number;
  private chunkSize: number;

  constructor(config?: ClamAvConfig) {
    this.host = config?.host || process.env.CLAMAV_HOST || '127.0.0.1';
    this.port = config?.port || Number(process.env.CLAMAV_PORT || 3310);
    this.timeoutMs = config?.timeoutMs || 15000;
    this.chunkSize = config?.chunkSize || 2048;
  }

  /**
   * Healthcheck via ClamAV PING command
   */
  async ping(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const socket = net.createConnection({ host: this.host, port: this.port });
      let received = '';

      socket.setTimeout(this.timeoutMs);

      socket.on('connect', () => {
        socket.write('nPING\n');
      });

      socket.on('data', (data) => {
        received += data.toString('utf8');
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('close', () => {
        resolve(received.trim().includes('PONG'));
      });
    });
  }

  /**
   * Scans an in-memory buffer using ClamAV zINSTREAM protocol
   */
  async scanBuffer(buffer: Buffer): Promise<{ clean: boolean; threatName?: string; rawResponse: string }> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.host, port: this.port });
      let response = '';

      socket.setTimeout(this.timeoutMs);

      socket.on('connect', () => {
        // Send command prefix: zINSTREAM\0
        socket.write('zINSTREAM\0');

        let offset = 0;
        const total = buffer.length;

        const writeChunk = () => {
          while (offset < total) {
            const end = Math.min(offset + this.chunkSize, total);
            const chunk = buffer.subarray(offset, end);
            offset = end;

            const lengthHeader = Buffer.alloc(4);
            lengthHeader.writeUInt32BE(chunk.length, 0);

            socket.write(lengthHeader);
            const canContinue = socket.write(chunk);

            if (!canContinue) {
              socket.once('drain', writeChunk);
              return;
            }
          }

          // Terminate stream with zero length chunk (0x00000000)
          const zeroLength = Buffer.alloc(4, 0);
          socket.write(zeroLength);
        };

        writeChunk();
      });

      socket.on('data', (data) => {
        response += data.toString('utf8');
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error(`CLAMAV_TIMEOUT: Connection timed out after ${this.timeoutMs}ms`));
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(new Error(`CLAMAV_SOCKET_ERROR: ${err.message}`));
      });

      socket.on('close', () => {
        // Strip null characters and trim
        const sanitized = response.replace(/\0/g, '').trim();

        if (sanitized.includes('FOUND')) {
          // Format: "stream: <ThreatName> FOUND"
          const match = sanitized.match(/stream:\s*(.+)\s*FOUND/i);
          const threatName = match ? match[1].trim() : 'UNKNOWN_THREAT';
          resolve({ clean: false, threatName, rawResponse: sanitized });
          return;
        }

        if (sanitized.includes('OK')) {
          resolve({ clean: true, rawResponse: sanitized });
          return;
        }

        if (sanitized.includes('ERROR')) {
          reject(new Error(`CLAMAV_ENGINE_ERROR: ${sanitized}`));
          return;
        }

        reject(new Error(`CLAMAV_UNRECOGNIZED_RESPONSE: ${sanitized || 'NO_RESPONSE'}`));
      });
    });
  }
}
