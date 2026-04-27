-- Migration 012: Root admin protection
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_root BOOLEAN DEFAULT false;

-- Assign root status to the initial owner
UPDATE admins SET is_root = true, role = 'admin', is_active = true WHERE username = 'admin';

-- Extra security index
CREATE INDEX IF NOT EXISTS idx_admins_root ON admins (is_root);
