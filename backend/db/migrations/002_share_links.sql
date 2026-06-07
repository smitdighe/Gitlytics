CREATE TABLE IF NOT EXISTS share_links (
  token      TEXT PRIMARY KEY,
  username   TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (username) REFERENCES profile_cache(username) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_share_username ON share_links(username);
