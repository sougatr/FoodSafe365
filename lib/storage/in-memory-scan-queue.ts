/**
 * FoodSafe365 — In-Memory Scan Queue Adapter
 * 
 * Implements ScanQueueAdapter in memory with visibility timeouts, retry counts,
 * and dead-letter queue (DLQ) support for deterministic local testing.
 */

import crypto from 'crypto';
import { ScanQueueAdapter, ScanResultEvent, QueueMessage } from './scanner-contract';

interface InternalMessage {
  messageId: string;
  receiptHandle: string;
  body: ScanResultEvent;
  receiveCount: number;
  visibleAfter: number; // epoch ms
}

export class InMemoryScanQueue implements ScanQueueAdapter {
  private messages: Map<string, InternalMessage> = new Map();
  private dlq: InternalMessage[] = [];
  private maxReceiveCount: number;

  constructor(maxReceiveCount: number = 3) {
    this.maxReceiveCount = maxReceiveCount;
  }

  async sendMessage(event: ScanResultEvent, delaySeconds: number = 0): Promise<string> {
    const messageId = `msg-${crypto.randomUUID()}`;
    const receiptHandle = `rcpt-${crypto.randomUUID()}`;
    const visibleAfter = Date.now() + delaySeconds * 1000;

    const msg: InternalMessage = {
      messageId,
      receiptHandle,
      body: event,
      receiveCount: 0,
      visibleAfter
    };

    this.messages.set(messageId, msg);
    return messageId;
  }

  async receiveMessages(maxMessages: number = 10, visibilityTimeoutSeconds: number = 30): Promise<QueueMessage[]> {
    const now = Date.now();
    const result: QueueMessage[] = [];

    for (const [id, msg] of Array.from(this.messages.entries())) {
      if (msg.visibleAfter <= now) {
        // Increment receive count
        msg.receiveCount += 1;

        if (msg.receiveCount > this.maxReceiveCount) {
          // Route to Dead-Letter Queue
          this.dlq.push({ ...msg });
          this.messages.delete(id);
          continue;
        }

        // Set visibility timeout
        msg.receiptHandle = `rcpt-${crypto.randomUUID()}`;
        msg.visibleAfter = now + visibilityTimeoutSeconds * 1000;

        result.push({
          messageId: msg.messageId,
          receiptHandle: msg.receiptHandle,
          body: msg.body,
          receiveCount: msg.receiveCount
        });

        if (result.length >= maxMessages) {
          break;
        }
      }
    }

    return result;
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    for (const [id, msg] of Array.from(this.messages.entries())) {
      if (msg.receiptHandle === receiptHandle) {
        this.messages.delete(id);
        return;
      }
    }
  }

  async changeMessageVisibility(receiptHandle: string, visibilityTimeoutSeconds: number): Promise<void> {
    const now = Date.now();
    for (const msg of Array.from(this.messages.values())) {
      if (msg.receiptHandle === receiptHandle) {
        msg.visibleAfter = now + visibilityTimeoutSeconds * 1000;
        return;
      }
    }
  }

  async getQueueAttributes(): Promise<{ approximateCount: number; dlqCount: number }> {
    const now = Date.now();
    let visibleCount = 0;
    for (const msg of Array.from(this.messages.values())) {
      if (msg.visibleAfter <= now) {
        visibleCount++;
      }
    }
    return {
      approximateCount: visibleCount,
      dlqCount: this.dlq.length
    };
  }

  getDlqMessages(): QueueMessage[] {
    return this.dlq.map((msg) => ({
      messageId: msg.messageId,
      receiptHandle: msg.receiptHandle,
      body: msg.body,
      receiveCount: msg.receiveCount
    }));
  }

  clear(): void {
    this.messages.clear();
    this.dlq = [];
  }
}
