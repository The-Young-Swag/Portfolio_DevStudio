-- One-time migration for databases created before the images feature.
-- New databases do not need this file: db/schema.sql already contains
-- every table and column below.
--
-- Apply exactly once to the existing remote database:
--   turso db shell portfolio < db/migrations/0001_content_images.sql

CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data BLOB NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE projects ADD COLUMN repo_url TEXT;
ALTER TABLE projects ADD COLUMN live_url TEXT;

ALTER TABLE certifications ADD COLUMN image TEXT;
ALTER TABLE certifications ADD COLUMN link TEXT;

ALTER TABLE profile ADD COLUMN portrait TEXT;
ALTER TABLE profile ADD COLUMN hero_stats TEXT;
ALTER TABLE profile ADD COLUMN also_true TEXT;
ALTER TABLE profile ADD COLUMN contact_heading TEXT;
ALTER TABLE profile ADD COLUMN contact_title TEXT;
ALTER TABLE profile ADD COLUMN contact_intro TEXT;
ALTER TABLE profile ADD COLUMN contact_email_label TEXT;
ALTER TABLE profile ADD COLUMN footer_note TEXT;

UPDATE projects SET thumbnail = ''
WHERE thumbnail IN ('arc-hive', 'library-attendance', 'luminoesis', 'portfolio');
