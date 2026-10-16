-- Migration: 014_unclaimed_directory_and_claims
-- Purpose: PostgreSQL persistence for unclaimed restaurant/store records, contacts, claim tokens, and outbox notifications

CREATE TABLE IF NOT EXISTS unclaimed_directory_entries (
  id text PRIMARY KEY,
  name text NOT NULL,
  business_type text NOT NULL DEFAULT 'RESTAURANT',
  city text NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'UNCLAIMED' CHECK (status IN ('DISCOVERED', 'UNCLAIMED', 'INVITED', 'CLAIMED', 'ONBOARDED', 'ACTIVE')),
  claimed_at timestamptz NULL,
  claimed_by_user_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unclaimed_business_contacts (
  id text PRIMARY KEY,
  restaurant_id text NOT NULL REFERENCES unclaimed_directory_entries(id) ON DELETE CASCADE,
  contact_type text NOT NULL CHECK (contact_type IN ('EMAIL', 'PHONE', 'OTHER')),
  contact_value text NOT NULL,
  source_type text NOT NULL DEFAULT 'OFFICIAL_WEBSITE',
  source_reference text NULL,
  is_business_contact boolean NOT NULL DEFAULT true,
  permitted_for_feedback_notification boolean NOT NULL DEFAULT true,
  verified_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claim_tokens (
  token text PRIMARY KEY,
  restaurant_id text NOT NULL REFERENCES unclaimed_directory_entries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  used_at timestamptz NULL,
  claimed_by text NULL
);

CREATE TABLE IF NOT EXISTS outbox_notifications (
  id text PRIMARY KEY,
  restaurant_id text NOT NULL,
  restaurant_name text NOT NULL,
  business_type text NULL,
  feedback_id text NOT NULL,
  notification_type text NOT NULL DEFAULT 'CUSTOMER_FEEDBACK_PROFILE_INVITATION',
  recipient_email text NOT NULL,
  recipient_type text NOT NULL DEFAULT 'BUSINESS_CONTACT',
  contact_source text NOT NULL DEFAULT 'OFFICIAL_WEBSITE',
  subject text NOT NULL,
  body text NOT NULL,
  claim_token text NOT NULL,
  claim_url text NOT NULL,
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'SENT', 'FAILED', 'SUPPRESSED')),
  customer_response_requested boolean NOT NULL DEFAULT false,
  customer_contact_shared text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz NULL,
  metadata jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_unclaimed_dir_status ON unclaimed_directory_entries(status);
CREATE INDEX IF NOT EXISTS idx_unclaimed_contacts_rest ON unclaimed_business_contacts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_rest ON claim_tokens(restaurant_id, used);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_expiry ON claim_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_outbox_notifications_rest ON outbox_notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_outbox_notifications_status ON outbox_notifications(status);

-- Seed initial discovered & unclaimed directory records idempotently
INSERT INTO unclaimed_directory_entries (id, name, business_type, city, location, status, claimed_at, claimed_by_user_id, created_at, updated_at)
VALUES
  ('leopold-cafe', 'Leopold Cafe & Bar', 'RESTAURANT', 'Mumbai', 'Colaba Causeway, Mumbai', 'UNCLAIMED', NULL, NULL, now() - interval '30 days', now() - interval '30 days'),
  ('freshmart-supermarket', 'FreshMart Supermarket', 'SUPERMARKET', 'Mumbai', 'Bandra West, Mumbai', 'UNCLAIMED', NULL, NULL, now() - interval '25 days', now() - interval '25 days'),
  ('abc-grocery', 'ABC Grocery', 'GROCERY', 'Mumbai', 'Andheri East, Mumbai', 'UNCLAIMED', NULL, NULL, now() - interval '20 days', now() - interval '20 days'),
  ('the-table', 'The Table', 'RESTAURANT', 'Mumbai', 'Colaba, Mumbai', 'ACTIVE', now() - interval '60 days', 'mgr-table-1', now() - interval '60 days', now() - interval '60 days'),
  ('the-bombay-canteen', 'The Bombay Canteen', 'RESTAURANT', 'Mumbai', 'Lower Parel, Mumbai', 'ACTIVE', now() - interval '45 days', 'mgr-canteen-1', now() - interval '45 days', now() - interval '45 days'),
  ('bastian-mumbai', 'Bastian', 'RESTAURANT', 'Mumbai', 'Bandra West, Mumbai', 'ACTIVE', now() - interval '40 days', 'mgr-bastian-1', now() - interval '40 days', now() - interval '40 days'),
  ('peter-cat', 'Peter Cat', 'RESTAURANT', 'Kolkata', 'Park Street, Kolkata', 'UNCLAIMED', NULL, NULL, now() - interval '20 days', now() - interval '20 days'),
  ('kyani-and-co', 'Kyani & Co.', 'CAFE', 'Mumbai', 'Marine Lines, Mumbai', 'DISCOVERED', NULL, NULL, now() - interval '10 days', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- Seed initial business contacts idempotently
INSERT INTO unclaimed_business_contacts (id, restaurant_id, contact_type, contact_value, source_type, source_reference, is_business_contact, permitted_for_feedback_notification, verified_at, created_at, updated_at)
VALUES
  ('contact-leopold-1', 'leopold-cafe', 'EMAIL', 'management@leopoldcafe.example.com', 'OFFICIAL_WEBSITE', 'https://leopoldcafe.example.com/contact-management', true, true, now() - interval '15 days', now() - interval '15 days', now() - interval '15 days'),
  ('contact-freshmart-1', 'freshmart-supermarket', 'EMAIL', 'operations@freshmartmumbai.example.com', 'OFFICIAL_WEBSITE', 'https://freshmartmumbai.example.com/store-support', true, true, now() - interval '12 days', now() - interval '12 days', now() - interval '12 days'),
  ('contact-peter-cat-1', 'peter-cat', 'EMAIL', 'info@petercatkolkata.example.com', 'OFFICIAL_WEBSITE', 'https://petercatkolkata.example.com/contact', true, true, now() - interval '10 days', now() - interval '10 days', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;
