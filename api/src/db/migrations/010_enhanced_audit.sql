-- Migration 010: Enhanced Application Audit
-- We already have admin_audit_logs, but we ensure it can store extra details efficiently.

CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_logs (target_type, target_id);

-- Optional: Create a view for easy access to application-specific logs
CREATE OR REPLACE VIEW application_history AS
SELECT 
    l.id,
    l.created_at,
    l.action,
    l.details,
    a.name as admin_name,
    l.target_id as application_id
FROM admin_audit_logs l
JOIN admins a ON l.admin_id = a.id
WHERE l.target_type = 'doctor_application'
ORDER BY l.created_at ASC;
