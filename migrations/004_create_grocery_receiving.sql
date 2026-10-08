-- Migration 004: Grocery Receiving Records & Inspections
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_receiving_records (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
  date_time timestamptz DEFAULT now(),
  supplier text NOT NULL,
  product text NOT NULL,
  product_category text NOT NULL,
  quantity text NOT NULL,
  batch_number text,
  use_by_date date,
  packaging_condition text NOT NULL,
  product_condition text NOT NULL,
  temperature numeric(5,2),
  is_temp_sensitive boolean DEFAULT false,
  receiving_person text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('ACCEPT', 'REJECT', 'HOLD')),
  rejection_reason text,
  evidence_url text,
  inspection_checklist jsonb NOT NULL,
  corrective_action_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_receivings_outlet_date ON grocery_receiving_records(outlet_id, date_time DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_receivings_decision ON grocery_receiving_records(decision);
CREATE INDEX IF NOT EXISTS idx_grocery_receivings_batch ON grocery_receiving_records(batch_number);

-- Normalized inspection checks table
CREATE TABLE IF NOT EXISTS grocery_receiving_inspections (
  id text PRIMARY KEY,
  receiving_id text NOT NULL REFERENCES grocery_receiving_records(id) ON DELETE CASCADE,
  check_name text NOT NULL,
  passed boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_inspections_receiving ON grocery_receiving_inspections(receiving_id);
