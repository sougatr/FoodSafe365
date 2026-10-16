-- Migration: 015_evidence_storage_lifecycle.sql
-- Purpose: Evidence upload lifecycle, storage tracking, retention limits, and quarantine controls

DO $$ BEGIN
  CREATE TYPE evidence_upload_status AS ENUM ('pending', 'confirmed', 'failed', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_scan_status AS ENUM ('pending_scan', 'cleared', 'quarantined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS status evidence_upload_status NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS scan_status evidence_scan_status NOT NULL DEFAULT 'cleared',
  ADD COLUMN IF NOT EXISTS storage_key text NULL,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_by uuid NULL,
  ADD COLUMN IF NOT EXISTS retention_until timestamptz NULL,
  ADD COLUMN IF NOT EXISTS failure_reason text NULL;

-- Backfill confirmed_at from captured_at for existing records
UPDATE evidence
  SET confirmed_at = captured_at
  WHERE confirmed_at IS NULL AND status = 'confirmed';

-- Multi-tenant and lifecycle query optimization indexes
CREATE INDEX IF NOT EXISTS idx_evidence_tenant_entity 
  ON evidence(outlet_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_evidence_status_expires 
  ON evidence(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_evidence_scan_status 
  ON evidence(scan_status) 
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_evidence_retention 
  ON evidence(retention_until) 
  WHERE status = 'confirmed';
