-- Migration: Grocery Store & Retail Food Safety Module
-- Implements Receiving, Storage, Equipment Temperature Logs, Stock (FIFO/FEFO), Daily Checks and Alerts

CREATE TABLE IF NOT EXISTS grocery_outlets (
  id text PRIMARY KEY,
  name text NOT NULL,
  branch_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  manager_name text NOT NULL,
  contact_number text NOT NULL,
  contact_email text NOT NULL,
  fssai_number text NOT NULL,
  store_type text NOT NULL,
  selected_categories jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_storage_zones (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
  name text NOT NULL,
  zone_type text NOT NULL,
  target_temp numeric(5,2),
  min_temp numeric(5,2),
  max_temp numeric(5,2),
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_equipment (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
  name text NOT NULL,
  equipment_type text NOT NULL,
  location text NOT NULL,
  target_temp numeric(5,2) NOT NULL,
  min_temp numeric(5,2) NOT NULL,
  max_temp numeric(5,2) NOT NULL,
  responsible_person text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_temperature_logs (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
  equipment_id text NOT NULL REFERENCES grocery_equipment(id) ON DELETE CASCADE,
  equipment_name text NOT NULL,
  reading numeric(5,2) NOT NULL,
  status text NOT NULL,
  method text DEFAULT 'probe',
  notes text,
  corrective_action_id text,
  recorded_by text NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_receivings (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
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
  decision text NOT NULL,
  rejection_reason text,
  evidence_url text,
  inspection_checklist jsonb NOT NULL,
  corrective_action_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_stock_items (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
  product text NOT NULL,
  category text NOT NULL,
  batch text NOT NULL,
  quantity numeric(10,2) NOT NULL,
  unit text NOT NULL,
  date_received date NOT NULL,
  expiry_date date NOT NULL,
  storage_zone_id text NOT NULL,
  storage_zone_name text NOT NULL,
  status text NOT NULL,
  audit_trail jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_daily_checks (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
  check_date date NOT NULL,
  supervisor_name text NOT NULL,
  responses jsonb NOT NULL,
  total_checks integer NOT NULL,
  conforming_count integer NOT NULL,
  non_conforming_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_zones_outlet ON grocery_storage_zones(outlet_id);
CREATE INDEX IF NOT EXISTS idx_grocery_equipment_outlet ON grocery_equipment(outlet_id);
CREATE INDEX IF NOT EXISTS idx_grocery_temp_logs_outlet ON grocery_temperature_logs(outlet_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_receivings_outlet ON grocery_receivings(outlet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_stock_outlet ON grocery_stock_items(outlet_id, expiry_date ASC);
CREATE INDEX IF NOT EXISTS idx_grocery_daily_checks_outlet ON grocery_daily_checks(outlet_id, check_date DESC);
