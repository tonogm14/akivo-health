-- Migration 009: Granular permissions for admin users
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';

-- Set full permissions for the initial super admin
UPDATE admins SET role = 'admin', permissions = '["overview", "apps", "consultations", "doctors", "management"]' WHERE username = 'admin';

-- Create table if not already indexed for performance (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_admins_permissions ON admins USING GIN (permissions);
