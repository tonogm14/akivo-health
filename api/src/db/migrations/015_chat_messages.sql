-- Migration 015: Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id   UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('patient', 'doctor')),
    sender_id  UUID NOT NULL, -- user_id if patient, doctor_id if doctor
    text       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_visit ON chat_messages(visit_id);
