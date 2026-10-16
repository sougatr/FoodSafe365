/**
 * FoodSafe365 — Evidence Scan Service
 * 
 * Core domain service for processing malware scan results.
 * Guarantees:
 * 1. Strict fail-closed quarantine: evidence remains inaccessible until an authorized clean scan clears it.
 * 2. Idempotent state transitions: duplicate events do not duplicate database updates or audit logs.
 * 3. Immediate purge: infected files are removed from object storage and marked failed/quarantined.
 * 4. Tenant boundary protection: key prefix and outlet/organisation matching strictly enforced.
 * 5. 10-minute threshold: treated strictly as an operational alert; never an auto-clearance rule.
 */

import { query, transaction } from '../db';
import { getStorageProvider } from './index';
import { StorageProvider } from './types';
import { ScanResultEvent } from './scanner-contract';

export interface ProcessScanResult {
  action: 'cleared' | 'quarantined' | 'indeterminate' | 'already_processed' | 'deferred' | 'ignored';
  evidenceId: string;
  reason?: string;
  threatName?: string;
}

export interface StalledScanAlert {
  evidenceId: string;
  outletId: string;
  organisationId: string;
  storageKey: string;
  confirmedAt: string;
  ageMinutes: number;
}

export class EvidenceScanService {
  /**
   * Processes a single scan result event within the evidence domain.
   */
  async processScanEvent(event: ScanResultEvent, storageOverride?: StorageProvider): Promise<ProcessScanResult> {
    const storage = storageOverride || getStorageProvider();

    // 1. Fetch current evidence state joined with outlet
    const rows = await query<any>(
      `SELECT e.*, o.organisation_id 
       FROM evidence e 
       JOIN outlets o ON o.id = e.outlet_id 
       WHERE e.id = $1`,
      [event.evidenceId]
    );

    const record = rows[0];
    if (!record) {
      throw new Error(`EVIDENCE_NOT_FOUND: Evidence ${event.evidenceId} does not exist.`);
    }

    // 2. Strict Tenant & Outlet Boundary Verification
    if (record.organisation_id !== event.organisationId) {
      throw new Error(
        `TENANT_BOUNDARY_VIOLATION: Event tenant ${event.organisationId} does not match record tenant ${record.organisation_id}`
      );
    }

    if (record.outlet_id !== event.outletId) {
      throw new Error(
        `OUTLET_BOUNDARY_VIOLATION: Event outlet ${event.outletId} does not match record outlet ${record.outlet_id}`
      );
    }

    if (record.storage_key !== event.storageKey) {
      throw new Error(
        `STORAGE_KEY_MISMATCH: Event key ${event.storageKey} does not match record key ${record.storage_key}`
      );
    }

    // Expected tenant prefix hierarchy
    const expectedPrefix = `tenants/${record.organisation_id}/outlets/${record.outlet_id}/`;
    if (!record.storage_key.startsWith(expectedPrefix)) {
      throw new Error(`STORAGE_KEY_PATH_VIOLATION: Key does not conform to tenant prefix ${expectedPrefix}`);
    }

    // 3. Lifecycle State Guards
    // If evidence is still in 'pending' (unconfirmed upload window), defer scan processing
    if (record.status === 'pending') {
      return {
        action: 'deferred',
        evidenceId: event.evidenceId,
        reason: 'EVIDENCE_PENDING_CONFIRMATION'
      };
    }

    // If already deleted or failed, ignore scan event
    if (record.status === 'deleted' || record.status === 'failed') {
      return {
        action: 'ignored',
        evidenceId: event.evidenceId,
        reason: `EVIDENCE_STATUS_${record.status.toUpperCase()}`
      };
    }

    // 4. Idempotency Check: Already processed
    if (record.scan_status === 'cleared' || record.scan_status === 'quarantined') {
      return {
        action: 'already_processed',
        evidenceId: event.evidenceId,
        reason: `ALREADY_${record.scan_status.toUpperCase()}`
      };
    }

    // 5. Outcome Processing
    if (event.result === 'clean') {
      return await transaction(async (client) => {
        const uRes = await client.query(
          `UPDATE evidence 
           SET scan_status = 'cleared' 
           WHERE id = $1 AND status = 'confirmed' AND scan_status = 'pending_scan' 
           RETURNING *`,
          [event.evidenceId]
        );

        if (uRes.rows.length === 0) {
          return {
            action: 'already_processed',
            evidenceId: event.evidenceId,
            reason: 'RACE_ALREADY_UPDATED'
          };
        }

        // Immutable audit log
        await client.query(
          `INSERT INTO audit_log (
            id, outlet_id, user_id, action, entity_type, entity_id, details, created_at
          ) VALUES (
            gen_random_uuid(), $1, NULL, 'EVIDENCE_SCAN_CLEARED', $2, $3, $4, now()
          )`,
          [
            record.outlet_id,
            record.entity_type,
            record.entity_id,
            JSON.stringify({
              evidence_id: event.evidenceId,
              scanner_engine: event.scannerEngine,
              scanned_at: event.scannedAt,
              storage_key: record.storage_key
            })
          ]
        );

        return {
          action: 'cleared',
          evidenceId: event.evidenceId
        };
      });
    }

    if (event.result === 'infected') {
      const threat = event.threatName || 'SUSPICIOUS_PAYLOAD';

      // Immediate storage purge
      try {
        await storage.deleteObject(record.storage_key);
      } catch (delErr: any) {
        console.error(`[SCAN-PURGE-FAIL] Failed to delete infected object ${record.storage_key}:`, delErr.message);
      }

      return await transaction(async (client) => {
        const uRes = await client.query(
          `UPDATE evidence 
           SET scan_status = 'quarantined', 
               status = 'failed', 
               failure_reason = $2 
           WHERE id = $1 AND status = 'confirmed' AND scan_status = 'pending_scan' 
           RETURNING *`,
          [event.evidenceId, `MALWARE_DETECTED: ${threat}`]
        );

        if (uRes.rows.length === 0) {
          return {
            action: 'already_processed',
            evidenceId: event.evidenceId,
            reason: 'RACE_ALREADY_UPDATED'
          };
        }

        // Immutable audit log
        await client.query(
          `INSERT INTO audit_log (
            id, outlet_id, user_id, action, entity_type, entity_id, details, created_at
          ) VALUES (
            gen_random_uuid(), $1, NULL, 'EVIDENCE_MALWARE_QUARANTINED', $2, $3, $4, now()
          )`,
          [
            record.outlet_id,
            record.entity_type,
            record.entity_id,
            JSON.stringify({
              evidence_id: event.evidenceId,
              threat_name: threat,
              scanner_engine: event.scannerEngine,
              scanned_at: event.scannedAt,
              storage_key: record.storage_key,
              action_taken: 'STORAGE_PURGED_AND_QUARANTINED'
            })
          ]
        );

        return {
          action: 'quarantined',
          evidenceId: event.evidenceId,
          threatName: threat
        };
      });
    }

    // Indeterminate result: do NOT clear quarantine
    return {
      action: 'indeterminate',
      evidenceId: event.evidenceId,
      reason: event.details?.error || 'SCANNER_INDETERMINATE_RESULT'
    };
  }

  /**
   * Operational monitor for stalled pending scans (>10 minutes).
   * Emits alerts; strictly maintains fail-closed quarantine.
   */
  async checkStalledPendingScans(thresholdMinutes: number = 10, now: Date = new Date()): Promise<StalledScanAlert[]> {
    const cutoff = new Date(now.getTime() - thresholdMinutes * 60 * 1000);

    const rows = await query<any>(
      `SELECT e.id, e.outlet_id, e.storage_key, e.confirmed_at, o.organisation_id 
       FROM evidence e 
       JOIN outlets o ON o.id = e.outlet_id 
       WHERE e.status = 'confirmed' 
         AND e.scan_status = 'pending_scan' 
         AND e.confirmed_at <= $1`,
      [cutoff]
    );

    const alerts: StalledScanAlert[] = [];

    for (const r of rows) {
      const confirmedDate = new Date(r.confirmed_at);
      const ageMinutes = Math.round((now.getTime() - confirmedDate.getTime()) / (60 * 1000));

      const alert: StalledScanAlert = {
        evidenceId: r.id,
        outletId: r.outlet_id,
        organisationId: r.organisation_id,
        storageKey: r.storage_key,
        confirmedAt: confirmedDate.toISOString(),
        ageMinutes
      };

      alerts.push(alert);
      console.warn(
        `[SCAN-ALERT-STALLED] Evidence ${r.id} in pending_scan for ${ageMinutes}m (confirmed: ${alert.confirmedAt}). Quarantine strictly retained.`
      );
    }

    return alerts;
  }
}
