-- Migration 008: Roles and enhanced audit logging
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE admins ADD COLUMN IF NOT EXISTS role admin_role NOT NULL DEFAULT 'user';

-- Ensure the first admin is actually an admin
UPDATE admins SET role = 'admin' WHERE username = 'admin';

-- Index for date filtering in applications
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON doctor_applications (created_at);
CREATE INDEX IF NOT EXISTS idx_apps_reviewed_at ON doctor_applications (reviewed_at);
