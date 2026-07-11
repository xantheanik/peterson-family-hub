-- Run this once, right after you create your Postgres database in Vercel.
-- Instructions for how to run it are in README.md.

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  end_date DATE,
  event_time TIME,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT NOT NULL DEFAULT 'America/Denver',
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  meeting_link TEXT,
  description TEXT,
  location TEXT,
  submitted_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);

-- If you already created the events table from an earlier version and just
-- need to add the newer columns, run these (safe even if they already exist):
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Denver';
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN NOT NULL DEFAULT FALSE;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_link TEXT;
