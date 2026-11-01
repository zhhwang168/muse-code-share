CREATE TABLE IF NOT EXISTS codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  delete_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS codes_expiration ON codes(expires_at);
CREATE TABLE IF NOT EXISTS submissions (
  ip_hash TEXT PRIMARY KEY,
  submitted_at INTEGER NOT NULL
);
