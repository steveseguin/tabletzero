CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY,
 kind TEXT NOT NULL,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 author TEXT NOT NULL,
 authorship TEXT NOT NULL,
 model TEXT NOT NULL,
 model_version TEXT NOT NULL,
 prompt TEXT NOT NULL,
 editing TEXT NOT NULL,
 book_id TEXT NOT NULL,
 rate_fingerprint TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
 reviewed_at TEXT,
 review_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_submissions_status_date ON submissions (status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_rate ON submissions (rate_fingerprint, submitted_at);
