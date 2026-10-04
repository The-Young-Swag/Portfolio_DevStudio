CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    stack TEXT NOT NULL DEFAULT '[]',
    year INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '',
    highlights TEXT NOT NULL DEFAULT '[]',
    repo_url TEXT,
    live_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL DEFAULT '',
    year TEXT NOT NULL DEFAULT '',
    credential TEXT NOT NULL DEFAULT '',
    badge TEXT NOT NULL DEFAULT '',
    code TEXT NOT NULL DEFAULT '',
    accent TEXT NOT NULL DEFAULT 'blue',
    image TEXT,
    link TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,
    items TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT '',
    headline TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    availability TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    github TEXT NOT NULL DEFAULT '',
    linkedin TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    resume TEXT NOT NULL DEFAULT '',
    portrait TEXT,
    hero_stats TEXT,
    also_true TEXT,
    contact_heading TEXT,
    contact_title TEXT,
    contact_intro TEXT,
    contact_email_label TEXT,
    footer_note TEXT
);

CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    href TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data BLOB NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
