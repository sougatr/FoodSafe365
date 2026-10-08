-- Migration 006: Grocery Temperature Logs
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_temperature_logs (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
  equipment_id text NOT NULL REFERENCES grocery_equipment(id) ON DELETE CASCADE,
  equipment_name text NOT NULL,
  reading numeric(5,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('GREEN', 'AMBER', 'RED')),
  method text DEFAULT 'probe',
  notes text,
  corrective_action_id text,
  recorded_by text NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_temp_logs_outlet_recorded ON grocery_temperature_logs(outlet_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_temp_logs_status ON grocery_temperature_logs(status);
CREATE INDEX IF NOT EXISTS idx_grocery_temp_logs_equipment ON grocery_temperature_logs(equipment_id);
