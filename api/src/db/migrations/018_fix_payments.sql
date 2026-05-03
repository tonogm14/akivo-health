-- Migration 018: Fix payments table schema
-- Add missing operation_code and make method more flexible

-- 1. Convert method to VARCHAR to avoid ENUM restrictions during development
ALTER TABLE payments ALTER COLUMN method TYPE VARCHAR(30);

-- 2. Add operation_code column
ALTER TABLE payments ADD COLUMN IF NOT EXISTS operation_code TEXT;

-- 3. Add index for faster lookups of operation codes
CREATE INDEX IF NOT EXISTS idx_payments_operation_code ON payments (operation_code);
