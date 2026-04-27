-- Preferencia del tipo de médico al crear una visita
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS doctor_type        VARCHAR(20)  DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS specialty_requested VARCHAR(80)  DEFAULT NULL;
