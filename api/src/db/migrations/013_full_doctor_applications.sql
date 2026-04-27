-- Migration 013: Expand doctor applications to capture all form data
ALTER TABLE doctor_applications
  ADD COLUMN IF NOT EXISTS dni_number      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS birth_date      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS sub_specialty   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS work_slots      TEXT[],
  ADD COLUMN IF NOT EXISTS mobility_type   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_data    JSONB;
