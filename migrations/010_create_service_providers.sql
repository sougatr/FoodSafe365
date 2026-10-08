-- Migration 010: Service Providers & Restaurant Service Requests
-- FoodSafe365 P0 Production Migration

CREATE TABLE IF NOT EXISTS service_providers (
  id text PRIMARY KEY,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  address text,
  city text NOT NULL,
  state text,
  categories text[] NOT NULL,
  description text NOT NULL,
  verification_status text DEFAULT 'unverified',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurant_service_requests (
  id text PRIMARY KEY,
  organisation_id text NOT NULL,
  outlet_id text NOT NULL,
  outlet_name text NOT NULL,
  outlet_city text,
  outlet_address text,
  corrective_action_id text NOT NULL,
  corrective_action_title text NOT NULL,
  provider_id text NOT NULL,
  provider_name text NOT NULL,
  service_category text NOT NULL,
  problem_description text NOT NULL,
  priority text DEFAULT 'high',
  contact_person text,
  contact_phone text,
  notes text,
  completion_notes text,
  rejection_notes text,
  status text NOT NULL,
  requested_at timestamptz DEFAULT now(),
  scheduled_at timestamptz NULL,
  completed_at timestamptz NULL,
  confirmed_at timestamptz NULL,
  audit_trail jsonb DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_srv_requests_outlet ON restaurant_service_requests(outlet_id);
CREATE INDEX IF NOT EXISTS idx_srv_requests_provider ON restaurant_service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_srv_requests_action ON restaurant_service_requests(corrective_action_id);
