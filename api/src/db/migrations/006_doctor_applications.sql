-- Migration 006: Doctor application workflow + extend doctors table

-- Add login credentials and metadata to existing doctors table
ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS email           VARCHAR(150) UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash   VARCHAR(80),
  ADD COLUMN IF NOT EXISTS bio             TEXT,
  ADD COLUMN IF NOT EXISTS photo_url       VARCHAR(500),
  ADD COLUMN IF NOT EXISTS districts       TEXT[],
  ADD COLUMN IF NOT EXISTS university      VARCHAR(150),
  ADD COLUMN IF NOT EXISTS rne_license     VARCHAR(20),
  ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- Doctor applications submitted via landing page
CREATE TABLE IF NOT EXISTS doctor_applications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  specialty        VARCHAR(100) NOT NULL DEFAULT 'Medicina General',
  cmp_license      VARCHAR(20)  UNIQUE NOT NULL,
  experience_years INTEGER      NOT NULL DEFAULT 0,
  university       VARCHAR(150),
  rne_license      VARCHAR(20),
  districts        TEXT[],
  bio              TEXT,
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  doctor_id        UUID         REFERENCES doctors(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  admin_notes      TEXT,
  documents        JSONB
);

CREATE INDEX IF NOT EXISTS idx_applications_status     ON doctor_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_cmp        ON doctor_applications(cmp_license);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON doctor_applications(created_at DESC);
