-- Migration 001: Grocery Outlets & Product Categories
-- FoodSafe365 P0-1 Production Migration

CREATE TABLE IF NOT EXISTS grocery_outlets (
  id text PRIMARY KEY,
  name text NOT NULL,
  branch_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  manager_name text NOT NULL,
  contact_number text NOT NULL,
  contact_email text NOT NULL,
  fssai_number text,
  store_type text NOT NULL DEFAULT 'supermarket',
  selected_categories jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_outlets_city ON grocery_outlets(city);
CREATE INDEX IF NOT EXISTS idx_grocery_outlets_store_type ON grocery_outlets(store_type);

CREATE TABLE IF NOT EXISTS grocery_product_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  icon text,
  min_temp numeric(5,2),
  max_temp numeric(5,2),
  is_temp_sensitive boolean DEFAULT false,
  target_unit text,
  storage_guidelines text,
  segregation_rules text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grocery_categories_code ON grocery_product_categories(code);
