-- Clinical consultation data (vitals + diagnosis + notes)
CREATE TABLE IF NOT EXISTS consultation_reports (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id         UUID        NOT NULL UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
  doctor_id        UUID        REFERENCES doctors(id) ON DELETE SET NULL,
  -- Vitals
  temp_c           NUMERIC(4,1),
  bp_systolic      SMALLINT,
  bp_diastolic     SMALLINT,
  hr_bpm           SMALLINT,
  spo2_pct         NUMERIC(4,1),
  rr_rpm           SMALLINT,
  weight_kg        NUMERIC(5,1),
  -- Clinical
  diagnosis        TEXT,
  diagnosis_code   VARCHAR(20),
  clinical_notes   TEXT,
  -- Timing (set by doctor app)
  consultation_started_at   TIMESTAMPTZ,
  consultation_finished_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prescriptions (one row per medication)
CREATE TABLE IF NOT EXISTS prescriptions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     UUID        NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  doctor_id    UUID        REFERENCES doctors(id) ON DELETE SET NULL,
  drug_name    VARCHAR(200) NOT NULL,
  dose         VARCHAR(100),
  frequency    VARCHAR(100),
  duration_days INTEGER,
  instructions TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_reports_visit ON consultation_reports(visit_id);
CREATE INDEX IF NOT EXISTS idx_consultation_reports_doctor ON consultation_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_visit ON prescriptions(visit_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_consultation_reports_updated_at
  BEFORE UPDATE ON consultation_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
