-- Migration 011: Distributed Rate Limiting Ledger
-- FoodSafe365 P0-3 Production Hardening

CREATE TABLE IF NOT EXISTS distributed_rate_limits (
  key text PRIMARY KEY,
  points integer NOT NULL DEFAULT 1,
  expire_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_distributed_rate_limits_expire ON distributed_rate_limits(expire_at);
