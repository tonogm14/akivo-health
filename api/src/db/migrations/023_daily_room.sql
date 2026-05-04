-- Daily.co room references stored on the visit for telemedicine consultations
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS daily_room_url  TEXT,
  ADD COLUMN IF NOT EXISTS daily_room_name VARCHAR(100);
