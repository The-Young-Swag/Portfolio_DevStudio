-- One-time migration for databases created before the content-pages
-- feature set (files storage, certification children and PDFs, project
-- access states and case studies, flat stack items).
-- New databases do not need this file: db/schema.sql already contains
-- every table and column below.
--
-- IMPORTANT: ALTER TABLE ... ADD COLUMN is not idempotent in SQLite.
-- This file must run exactly once against the existing remote database.
-- If a statement fails with "duplicate column name", the statements
-- before it already applied; re-run only the remaining ones.
--
-- Apply once:
--   turso db shell portfolio < db/migrations/0002_content_pages.sql

CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    data BLOB NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE certifications ADD COLUMN parent_id INTEGER;
ALTER TABLE certifications ADD COLUMN pdf TEXT;
ALTER TABLE certifications ADD COLUMN badge_image TEXT;
ALTER TABLE certifications ADD COLUMN badge_link TEXT;

ALTER TABLE projects ADD COLUMN source_access TEXT;
ALTER TABLE projects ADD COLUMN demo_access TEXT;
ALTER TABLE projects ADD COLUMN access_note TEXT;
ALTER TABLE projects ADD COLUMN has_case_study INTEGER;
ALTER TABLE projects ADD COLUMN case_problem TEXT;
ALTER TABLE projects ADD COLUMN case_role TEXT;
ALTER TABLE projects ADD COLUMN case_solution TEXT;
ALTER TABLE projects ADD COLUMN case_result TEXT;
ALTER TABLE projects ADD COLUMN case_screenshots TEXT;

CREATE TABLE IF NOT EXISTS stack_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'comfortable',
    since_year INTEGER,
    is_core INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
