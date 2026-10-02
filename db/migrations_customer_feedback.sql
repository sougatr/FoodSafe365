-- Migration: Customer Food-Safety Ratings Persistence Layer
-- Links diner ratings to specific outlet_id and supports cross-device feedback

CREATE TABLE IF NOT EXISTS customer_feedback (
  id text PRIMARY KEY,
  outlet_id text NOT NULL,
  outlet_name text NOT NULL,
  overall_score numeric(3,2) NOT NULL,
  cleanliness_score numeric(3,2) NOT NULL,
  staff_hygiene_score numeric(3,2) NOT NULL,
  food_freshness_score numeric(3,2) NOT NULL,
  safe_water_score numeric(3,2) NOT NULL,
  washroom_score numeric(3,2) NOT NULL,
  feedback text,
  diner_name text,
  diner_mobile text,
  table_number text,
  verified_dine_in boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_outlet ON customer_feedback(outlet_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_created ON customer_feedback(created_at DESC);
