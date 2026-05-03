-- Migration 019: Add refund columns to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'none'; -- none, pending, completed
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_transaction_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_at TIMESTAMP WITH TIME ZONE;
