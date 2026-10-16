-- Migration 012: Add Password Hash Credential Columns for Multi-Journey Authentication
-- FoodSafe365 Stage 5A Authentication & Database Safety

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));

ALTER TABLE grocery_outlets ADD COLUMN IF NOT EXISTS password_hash text;
CREATE INDEX IF NOT EXISTS idx_grocery_outlets_email_lower ON grocery_outlets (lower(contact_email));

ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS password_hash text;
CREATE INDEX IF NOT EXISTS idx_service_providers_email_lower ON service_providers (lower(email));
