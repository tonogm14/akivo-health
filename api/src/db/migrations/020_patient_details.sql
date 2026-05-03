-- Migration 020: Add missing patient fields
ALTER TABLE visit_patients ADD COLUMN IF NOT EXISTS document VARCHAR(20);
ALTER TABLE visit_patients ADD COLUMN IF NOT EXISTS has_meds BOOLEAN;
ALTER TABLE visit_patients ADD COLUMN IF NOT EXISTS med_name TEXT;
