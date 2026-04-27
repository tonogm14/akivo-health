-- Migration 011: Active status for admin users
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure root admin is always active
UPDATE admins SET is_active = true WHERE username = 'admin';

-- Index for login performance
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins (username, is_active);
