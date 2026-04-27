-- Migration 014: Full profile and active status for doctors
ALTER TABLE doctors 
  ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS dni_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20),
  ADD COLUMN IF NOT EXISTS sub_specialty VARCHAR(100),
  ADD COLUMN IF NOT EXISTS work_slots JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS mobility_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
  ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS university VARCHAR(100),
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing doctors to be active by default if not set
UPDATE doctors SET is_active = true WHERE is_active IS NULL;
