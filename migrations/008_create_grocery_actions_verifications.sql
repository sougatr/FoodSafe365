-- Migration 008: Grocery Corrective Actions & Verification Records
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_corrective_actions (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'awaiting_verification', 'closed')),
  assigned_to text,
  source_type text NOT NULL,
  source_id text,
  source_check_code text,
  requires_external_service boolean DEFAULT false,
  service_category text,
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_grocery_actions_outlet_status ON grocery_corrective_actions(outlet_id, status);

CREATE TABLE IF NOT EXISTS grocery_verification_records (
  id text PRIMARY KEY,
  corrective_action_id text NOT NULL REFERENCES grocery_corrective_actions(id) ON DELETE CASCADE,
  result text NOT NULL CHECK (result IN ('verified_effective', 'rejected', 'partially_effective')),
  notes text NOT NULL,
  verified_by text NOT NULL,
  verification_method text NOT NULL,
  verified_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_verifications_action_id ON grocery_verification_records(corrective_action_id);
