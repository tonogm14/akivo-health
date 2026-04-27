-- Doctor House — services & injectables catalog
-- Run manually: docker exec -i doctorhouse-postgres-1 psql -U dh_user -d doctorhouse < api/src/db/migrations/002_services_injectables.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES CATALOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(50)   UNIQUE NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  description TEXT,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  base_price  NUMERIC(8,2)  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO services (slug, name, description, is_active, base_price) VALUES
  ('doctor_visit', 'Visita médica',  'Atención médica general a domicilio',    TRUE,  120.00),
  ('injectable',   'Inyectables',    'Aplicación de inyectables a domicilio',  TRUE,   50.00),
  ('telemedicine', 'Telemedicina',   'Consulta médica por videollamada',       FALSE,  60.00)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- INJECTABLES CATALOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS injectables (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   VARCHAR(100)  NOT NULL,
  description            TEXT,
  price                  NUMERIC(8,2)  NOT NULL,
  requires_prescription  BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active              BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO injectables (name, description, price, requires_prescription) VALUES
  ('Vitamina B12',    'Cianocobalamina 1000 mcg/mL — energía y sistema nervioso',  35.00, FALSE),
  ('Vitamina C IV',   'Ácido ascórbico 500 mg/mL — refuerzo inmune',               45.00, FALSE),
  ('Complejo B',      'Vitaminas B1, B6, B12 — metabolismo y nervios',             40.00, FALSE),
  ('Diclofenaco',     'Antiinflamatorio 75 mg — dolor e inflamación',              30.00, FALSE),
  ('Ketorolaco',      'Analgésico 30 mg — dolor moderado a intenso',               35.00, FALSE),
  ('Metamizol',       'Analgésico-antiespasmódico 1 g — fiebre y dolor',           28.00, FALSE),
  ('Metoclopramida',  'Antiemético 10 mg — náuseas y vómitos',                     25.00, FALSE),
  ('Dexametasona',    'Corticosteroide 4 mg — inflamación severa',                 40.00, TRUE),
  ('Ranitidina',      'Antiácido 50 mg — gastritis y úlcera',                      25.00, FALSE),
  ('Tramadol',        'Analgésico opioide 100 mg — dolor intenso',                 50.00, TRUE)
ON CONFLICT DO NOTHING;

-- Fix price if migration already ran with 0.00
UPDATE services SET base_price = 50.00 WHERE slug = 'injectable' AND base_price = 0.00;

-- ─────────────────────────────────────────────────────────────────────────────
-- ADD service_type AND injectable_id TO visits
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS service_type  VARCHAR(50) NOT NULL DEFAULT 'doctor_visit',
  ADD COLUMN IF NOT EXISTS injectable_id UUID REFERENCES injectables(id);
