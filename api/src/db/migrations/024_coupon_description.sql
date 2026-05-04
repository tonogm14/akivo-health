-- Migration 024: Add description to coupons and push_token to users
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE users   ADD COLUMN IF NOT EXISTS push_token  TEXT;
