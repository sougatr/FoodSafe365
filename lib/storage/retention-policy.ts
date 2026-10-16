/**
 * FoodSafe365 — Configurable & Versioned Evidence Retention Policies
 * Enforces Rule 2: No hard-coded statutory retention durations without an approved legal/contractual basis.
 */

export interface ApprovedRetentionPolicy {
  version: string;
  entityType: string;
  durationDays: number;
  basis: string;
  approvedBy: string;
  approvedAt: string;
}

export interface RetentionResolutionResult {
  hasApprovedPolicy: boolean;
  retentionUntil: Date | null;
  policyVersion?: string;
  basis: string;
}

// Registry of approved retention policies.
// Configurable per environment or tenant, empty by default to prevent inventing unverified legal mandates.
const approvedPolicies = new Map<string, ApprovedRetentionPolicy>();

/**
 * Registers an approved retention policy with an explicit legal or contractual basis.
 */
export function registerApprovedRetentionPolicy(policy: ApprovedRetentionPolicy): void {
  if (!policy.version || !policy.entityType || !policy.durationDays || !policy.basis) {
    throw new Error('INVALID_RETENTION_POLICY: version, entityType, durationDays, and basis are required.');
  }
  approvedPolicies.set(policy.entityType.toLowerCase().trim(), { ...policy });
}

/**
 * Removes an approved retention policy (e.g. for testing cleanup).
 */
export function clearApprovedRetentionPoliciesForTesting(): void {
  approvedPolicies.clear();
}

/**
 * Resolves the retention period for an evidence entity.
 * If no approved policy exists, returns null without inventing a statutory duration.
 */
export function resolveRetention(
  entityType: string,
  referenceDate: Date = new Date(),
  customPoliciesMap?: Map<string, ApprovedRetentionPolicy>
): RetentionResolutionResult {
  const map = customPoliciesMap || approvedPolicies;
  const policy = map.get(entityType.toLowerCase().trim());

  if (!policy || policy.durationDays <= 0) {
    return {
      hasApprovedPolicy: false,
      retentionUntil: null,
      basis: 'NO_APPROVED_RETENTION_POLICY_CONFIGURED'
    };
  }

  const retentionUntil = new Date(referenceDate.getTime() + policy.durationDays * 86400 * 1000);

  return {
    hasApprovedPolicy: true,
    retentionUntil,
    policyVersion: policy.version,
    basis: policy.basis
  };
}
