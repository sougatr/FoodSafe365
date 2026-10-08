-- Migration 005: Grocery Inventory Batches (Stock & FEFO)
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_inventory_batches (
  id text PRIMARY KEY,
  outlet_id text NOT NULL REFERENCES grocery_outlets(id) ON DELETE CASCADE,
  product text NOT NULL,
  category text NOT NULL,
  batch text NOT NULL,
  quantity numeric(10,2) NOT NULL,
  unit text NOT NULL,
  date_received date NOT NULL,
  expiry_date date NOT NULL,
  storage_zone_id text REFERENCES grocery_storage_zones(id) ON DELETE SET NULL,
  storage_zone_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DISPOSED')),
  audit_trail jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_inventory_outlet ON grocery_inventory_batches(outlet_id);
CREATE INDEX IF NOT EXISTS idx_grocery_inventory_expiry ON grocery_inventory_batches(expiry_date ASC);
CREATE INDEX IF NOT EXISTS idx_grocery_inventory_status ON grocery_inventory_batches(status);
