-- Migration 007: Grocery Daily Checks & Inspection Items
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_daily_checks (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
  check_date date NOT NULL,
  shift text NOT NULL DEFAULT 'morning',
  completed_by text NOT NULL,
  verified_by text,
  overall_status text NOT NULL CHECK (overall_status IN ('COMPLIANT', 'ATTENTION_REQUIRED', 'ACTION_REQUIRED')),
  passed_count integer NOT NULL,
  flagged_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_daily_checks_outlet_date ON grocery_daily_checks(outlet_id, check_date DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_daily_checks_status ON grocery_daily_checks(overall_status);

CREATE TABLE IF NOT EXISTS grocery_daily_check_items (
  id text PRIMARY KEY,
  check_id text NOT NULL REFERENCES grocery_daily_checks(id) ON DELETE CASCADE,
  check_code text NOT NULL,
  category text NOT NULL,
  question text NOT NULL,
  status text NOT NULL CHECK (status IN ('YES', 'NO', 'NA')),
  notes text,
  photo_url text,
  corrective_action_required boolean DEFAULT false,
  corrective_action_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_check_items_check_id ON grocery_daily_check_items(check_id);
CREATE INDEX IF NOT EXISTS idx_grocery_check_items_code ON grocery_daily_check_items(check_code);
