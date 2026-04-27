-- Doctor House — initial schema
-- Run once on a fresh database (idempotent via IF NOT EXISTS)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS  (identified by phone; no password)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      VARCHAR(15)  UNIQUE NOT NULL,
  name       VARCHAR(100),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- OTP CODES  (WhatsApp / SMS verification)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      VARCHAR(15)  NOT NULL,
  code       VARCHAR(6)   NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  used       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes (phone, expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- DOCTORS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  specialty        VARCHAR(100) NOT NULL DEFAULT 'Medicina General',
  cmp_license      VARCHAR(20)  UNIQUE NOT NULL,
  phone            VARCHAR(15),
  experience_years INTEGER      NOT NULL DEFAULT 0,
  rating           NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  total_reviews    INTEGER      NOT NULL DEFAULT 0,
  is_available     BOOLEAN      NOT NULL DEFAULT FALSE,
  latitude         NUMERIC(10,7),
  longitude        NUMERIC(10,7),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- VISITS
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('pending','matched','on_way','arrived','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE visit_urgency AS ENUM ('now','today','schedule');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS visits (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         REFERENCES users(id),
  doctor_id     UUID         REFERENCES doctors(id),
  status        visit_status NOT NULL DEFAULT 'pending',
  urgency       visit_urgency NOT NULL,
  address       TEXT         NOT NULL,
  address_ref   TEXT,
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),
  scheduled_at  TIMESTAMPTZ,
  eta_minutes   INTEGER,
  price         NUMERIC(8,2) NOT NULL DEFAULT 120.00,
  cancel_fee    NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  cancel_reason TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_visits_user   ON visits (user_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor ON visits (doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits (status);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS visits_updated_at ON visits;
CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- VISIT SYMPTOMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visit_symptoms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  symptom_code VARCHAR(30) NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- VISIT PATIENT
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE age_group AS ENUM ('baby','child','teen','adult','elder','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS visit_patients (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id       UUID      NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  age_group      age_group NOT NULL DEFAULT 'adult',
  medical_flags  TEXT[]    NOT NULL DEFAULT '{}',
  notes          TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('yape','cash','card');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','confirmed','paid','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS payments (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     UUID           NOT NULL REFERENCES visits(id),
  method       payment_method NOT NULL,
  amount       NUMERIC(8,2)  NOT NULL,
  tip          NUMERIC(8,2)  NOT NULL DEFAULT 0.00,
  status       payment_status NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id   UUID NOT NULL REFERENCES visits(id),
  doctor_id  UUID NOT NULL REFERENCES doctors(id),
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  tags       TEXT[]   NOT NULL DEFAULT '{}',
  tip        NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
