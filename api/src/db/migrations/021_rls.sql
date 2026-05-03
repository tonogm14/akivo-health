-- Migration 021: Row Level Security on all user-data tables
--
-- The API connects as dh_user (single service role).  We enable FORCE RLS on
-- every table that holds personally-identifiable or sensitive data, then grant
-- dh_user a full-access policy.  This means:
--   • The app keeps working exactly as today.
--   • Any future Postgres role created WITHOUT an explicit policy sees 0 rows,
--     providing defense-in-depth against credential leaks or lateral movement.
--
-- Run order: after all earlier migrations.

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: silently skip if the policy already exists
-- ─────────────────────────────────────────────────────────────────────────────
DO $body$
DECLARE
  tbl  TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'otp_codes',
    'visits', 'visit_symptoms', 'visit_patients', 'visit_events',
    'payments', 'reviews',
    'chat_messages',
    'consultation_reports', 'prescriptions',
    'doctors', 'doctor_applications', 'doctor_location_logs',
    'admins', 'admin_audit_logs',
    'coupons'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    -- Force the owner (dh_user) to also be subject to policies
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
    -- Service-role: full read + write access
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl AND policyname = 'app_service_role'
    ) THEN
      EXECUTE format(
        'CREATE POLICY app_service_role ON %I TO dh_user USING (true) WITH CHECK (true)',
        tbl
      );
    END IF;
  END LOOP;
END;
$body$;
