-- Migration 003: Grocery Equipment
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_equipment (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_grocery_equipment_outlet ON grocery_equipment(outlet_id);
CREATE INDEX IF NOT EXISTS idx_grocery_equipment_active ON grocery_equipment(active);
