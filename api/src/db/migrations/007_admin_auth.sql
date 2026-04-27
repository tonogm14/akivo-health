-- Migration 007: Admin authentication and metrics support
CREATE TABLE IF NOT EXISTS admins (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  name          VARCHAR(100),
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Additional columns for metrics if needed
ALTER TABLE doctor_applications ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMPTZ;

-- Audit logs for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID         REFERENCES admins(id),
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
