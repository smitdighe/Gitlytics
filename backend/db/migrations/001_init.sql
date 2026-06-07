CREATE TABLE IF NOT EXISTS profile_cache (
  username   TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  cached_at  INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expires ON profile_cache(expires_at);
