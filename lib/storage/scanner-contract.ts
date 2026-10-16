/**
 * FoodSafe365 — Malware Scanner & Queue Contract
 * 
 * Defines the vendor-neutral contracts for malware scanning, event payloads,
 * and asynchronous queue consumption.
 */

export type ScanResultType = 'clean' | 'infected' | 'indeterminate';

export interface ScanResultEvent {
  /** Unique ID of the scan event */
  eventId: string;
  /** Primary evidence ID being scanned */
  evidenceId: string;
  /** Storage key of the object in S3/MinIO */
  storageKey: string;
  /** Target outlet ID for boundary verification */
  outletId: string;
  /** Target organisation ID for tenant verification */
  organisationId: string;
  /** Scan outcome */
  result: ScanResultType;
  /** Identified threat name if result === 'infected' */
  threatName?: string;
  /** Scanner engine identification (e.g., 'clamav:1.4', 'aws-guardduty') */
  scannerEngine: string;
  /** ISO timestamp of scan completion */
  scannedAt: string;
  /** Optional metadata or scanner logs */
  details?: Record<string, any>;
}

export interface QueueMessage {
  messageId: string;
  receiptHandle: string;
  body: ScanResultEvent;
  receiveCount: number;
}

/**
 * Vendor-neutral queue adapter interface.
 * Implemented by InMemoryScanQueue (for tests) and AwsSqsQueue (for production).
 */
export interface ScanQueueAdapter {
  sendMessage(event: ScanResultEvent, delaySeconds?: number): Promise<string>;
  receiveMessages(maxMessages?: number, visibilityTimeoutSeconds?: number): Promise<QueueMessage[]>;
  deleteMessage(receiptHandle: string): Promise<void>;
  changeMessageVisibility(receiptHandle: string, visibilityTimeoutSeconds: number): Promise<void>;
  getQueueAttributes(): Promise<{ approximateCount: number; dlqCount: number }>;
}

/**
 * Scan engine adapter interface.
 * Implemented by ClamAvAdapter, GuardDutyAdapter, and MockScannerAdapter.
 */
export interface MalwareScannerAdapter {
  readonly name: string;
  ping(): Promise<boolean>;
  scanBuffer(buffer: Buffer): Promise<{
    clean: boolean;
    threatName?: string;
    rawResponse: string;
  }>;
}
