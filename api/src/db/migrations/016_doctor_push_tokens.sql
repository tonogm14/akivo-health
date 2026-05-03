-- Migration 016: Doctor push tokens
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS push_token TEXT DEFAULT NULL;
