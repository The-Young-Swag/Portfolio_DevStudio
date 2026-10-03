CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    stack TEXT NOT NULL DEFAULT '[]',
    year INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '',
    highlights TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
