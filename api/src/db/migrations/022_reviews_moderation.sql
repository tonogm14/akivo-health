-- Migration 022: Review moderation fields
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'visible'
    CHECK (status IN ('visible', 'hidden', 'flagged')),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES admins(id),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
