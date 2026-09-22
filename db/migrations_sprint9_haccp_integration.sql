-- Sprint 9: HACCP monitoring <-> Daily Checks <-> Corrective Actions
ALTER TABLE ccps ADD COLUMN IF NOT EXISTS critical_limit_min numeric NULL;
ALTER TABLE ccps ADD COLUMN IF NOT EXISTS critical_limit_max numeric NULL;
ALTER TABLE ccps ADD COLUMN IF NOT EXISTS validation_status text NULL CHECK (validation_status IN ('validated','pending'));
ALTER TABLE ccps ADD COLUMN IF NOT EXISTS validated_by uuid NULL;
ALTER TABLE ccps ADD COLUMN IF NOT EXISTS validated_at timestamptz NULL;
ALTER TABLE check_template_items ADD COLUMN IF NOT EXISTS ccp_id uuid NULL REFERENCES ccps(id);
CREATE INDEX IF NOT EXISTS idx_check_template_items_ccp_id ON check_template_items(ccp_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_records_ccp_time ON monitoring_records(ccp_id, observation_time DESC);
