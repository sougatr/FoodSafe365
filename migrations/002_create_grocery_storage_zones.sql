-- Migration 002: Grocery Storage Zones
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_storage_zones (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
  name text NOT NULL,
  zone_type text NOT NULL,
  target_temp numeric(5,2),
  min_temp numeric(5,2),
  max_temp numeric(5,2),
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_zones_outlet ON grocery_storage_zones(outlet_id);
CREATE INDEX IF NOT EXISTS idx_grocery_zones_type ON grocery_storage_zones(zone_type);
