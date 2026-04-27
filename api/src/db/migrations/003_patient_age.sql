-- Doctor House — add exact age to visit_patients
-- Run: docker exec -i doctorhouse-postgres-1 psql -U dh_user -d doctorhouse < api/src/db/migrations/003_patient_age.sql

ALTER TABLE visit_patients
  ADD COLUMN IF NOT EXISTS age SMALLINT CHECK (age >= 0 AND age <= 120);
