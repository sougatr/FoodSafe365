ALTER TABLE rules ADD COLUMN IF NOT EXISTS evaluation_config jsonb DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS uq_check_response_item ON check_responses(check_instance_id, check_template_item_id);
CREATE INDEX IF NOT EXISTS idx_check_instances_outlet_date ON check_instances(outlet_id, started_at);
CREATE INDEX IF NOT EXISTS idx_observations_outlet_status ON observations(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_actions_outlet_status ON corrective_actions(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_system_events_processed ON system_events(processed, occurred_at);
-- Rule-specific response semantics. Numeric limits are intentionally NOT seeded here.
UPDATE rules SET evaluation_config='{"pass_values":["yes","pass"],"fail_values":["no","fail"],"next_step":"Correct the condition and record the corrective action."}'::jsonb
WHERE rule_code NOT IN ('FS-PST-002');
UPDATE rules SET evaluation_config='{"pass_values":["no"],"fail_values":["yes"],"next_step":"Protect/isolate affected food, notify the manager and initiate pest-control corrective action."}'::jsonb
WHERE rule_code='FS-PST-002';

-- Prevent duplicate daily instances for the same outlet/template/day.
CREATE UNIQUE INDEX IF NOT EXISTS uq_daily_check_instance
  ON check_instances(outlet_id, check_template_id, ((started_at AT TIME ZONE 'UTC')::date));

-- Faster tenant-scoped workflow reads.
CREATE INDEX IF NOT EXISTS idx_check_responses_instance_item ON check_responses(check_instance_id, check_template_item_id);
CREATE INDEX IF NOT EXISTS idx_action_verifications_action ON action_verifications(corrective_action_id, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_entity ON evidence(outlet_id, entity_type, entity_id);
