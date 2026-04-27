-- Push token on each visit for sending notifications to the patient
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS push_token TEXT DEFAULT NULL;

-- Doctor GPS location history (for ETA recalculation)
CREATE TABLE IF NOT EXISTS doctor_location_logs (
  id          SERIAL PRIMARY KEY,
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  latitude    DECIMAL(10, 7) NOT NULL,
  longitude   DECIMAL(10, 7) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_location ON doctor_location_logs (doctor_id, recorded_at DESC);
