/**
 * FoodSafe365 — Tenant-Isolated Object Key Generator
 * Enforces strict multi-tenant path hierarchy and prevents path traversal.
 */

import crypto from 'crypto';

export const ALLOWED_ENTITY_TYPES = new Set([
  'check_response',
  'observation',
  'corrective_action',
  'document',
  'service',
  'haccp_monitoring'
]);

export interface KeyGenerationParams {
  organisationId: string;
  outletId: string;
  entityType: string;
  entityId: string;
  fileName: string;
  evidenceId?: string;
}

export interface ParsedStorageKey {
  organisationId: string;
  outletId: string;
  entityType: string;
  entityId: string;
  evidenceId: string;
  fileName: string;
}

/**
 * Sanitizes an identifier or slug to prevent path traversal and special characters.
 */
function sanitizeIdentifier(raw: string, fieldName: string): string {
  if (!raw || typeof raw !== 'string') {
    throw new Error(`INVALID_STORAGE_KEY_PARAM: ${fieldName} must be a non-empty string.`);
  }
  const trimmed = raw.trim();
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('\0')) {
    throw new Error(`INVALID_STORAGE_KEY_PARAM: ${fieldName} contains illegal path traversal characters.`);
  }
  // Enforce valid UUID, slug or alphanumeric characters: a-zA-Z0-9-_:
  if (!/^[a-zA-Z0-9-_:]+$/.test(trimmed)) {
    throw new Error(`INVALID_STORAGE_KEY_PARAM: ${fieldName} contains illegal characters: "${trimmed}".`);
  }
  return trimmed;
}

/**
 * Sanitizes a client-provided file name to prevent path traversal and command injection.
 */
export function sanitizeFileName(rawFileName: string): string {
  if (!rawFileName || typeof rawFileName !== 'string') {
    return 'evidence_file.bin';
  }
  // Extract basename only
  const base = rawFileName.split(/[/\\]/).pop() || 'evidence_file.bin';
  // Remove null bytes and control chars
  const clean = base.replace(/[\x00-\x1f\x7f]/g, '');
  // Extract extension
  const dotIndex = clean.lastIndexOf('.');
  const ext = dotIndex !== -1 ? clean.substring(dotIndex).toLowerCase() : '';
  const namePart = dotIndex !== -1 ? clean.substring(0, dotIndex) : clean;

  // Sanitize name part
  const safeName = namePart
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);

  // Validate extension
  const safeExt = ext.replace(/[^a-z0-9]/g, '').substring(0, 10);
  const finalExt = safeExt ? `.${safeExt}` : '';

  return `${safeName || 'file'}${finalExt}`;
}

/**
 * Builds a deterministic, tenant-isolated object key for storage.
 * Hierarchy:
 * tenants/{organisationId}/outlets/{outletId}/{entityType}/{entityId}/{evidenceId}-{sanitizedFileName}
 */
export function buildEvidenceStorageKey(params: KeyGenerationParams): string {
  const orgId = sanitizeIdentifier(params.organisationId, 'organisationId');
  const outletId = sanitizeIdentifier(params.outletId, 'outletId');
  const entityId = sanitizeIdentifier(params.entityId, 'entityId');

  const entityType = params.entityType.trim().toLowerCase();
  if (!ALLOWED_ENTITY_TYPES.has(entityType)) {
    throw new Error(
      `INVALID_ENTITY_TYPE: "${params.entityType}" is not an authorized evidence entity type.`
    );
  }

  const evidenceId = params.evidenceId
    ? sanitizeIdentifier(params.evidenceId, 'evidenceId')
    : crypto.randomUUID();

  const safeFile = sanitizeFileName(params.fileName);

  return `tenants/${orgId}/outlets/${outletId}/${entityType}/${entityId}/${evidenceId}-${safeFile}`;
}

/**
 * Parses and verifies an existing evidence storage key.
 */
export function parseEvidenceStorageKey(key: string): ParsedStorageKey | null {
  if (!key || typeof key !== 'string') return null;
  const parts = key.split('/');
  if (parts.length !== 7) return null;
  if (parts[0] !== 'tenants' || parts[2] !== 'outlets') return null;

  const [_, orgId, __, outletId, entityType, entityId, fileWithId] = parts;
  if (!ALLOWED_ENTITY_TYPES.has(entityType)) return null;

  const dashIndex = fileWithId.indexOf('-');
  if (dashIndex === -1) return null;

  const evidenceId = fileWithId.substring(0, dashIndex);
  const fileName = fileWithId.substring(dashIndex + 1);

  return {
    organisationId: orgId,
    outletId,
    entityType,
    entityId,
    evidenceId,
    fileName
  };
}
