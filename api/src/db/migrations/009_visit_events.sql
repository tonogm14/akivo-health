CREATE TABLE IF NOT EXISTS visit_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id    UUID        NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  event_type  VARCHAR(50) NOT NULL,
  actor_type  VARCHAR(20) NOT NULL CHECK (actor_type IN ('patient','doctor','system')),
  actor_id    UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_events_visit     ON visit_events(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_events_actor     ON visit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_visit_events_created   ON visit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_events_type      ON visit_events(event_type);
