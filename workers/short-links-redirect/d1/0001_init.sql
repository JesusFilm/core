-- D1 replica of the edge store (prds/short-links/TECH-DESIGN.md, "D1").
-- Same keys (`domain:<hostname>`, `link:<hostname>/<pathname>`) and JSON values
-- as Workers KV. api-media upserts rows via the D1 REST API in the same publish
-- call that writes KV; the Worker reads it only when KV misses.
CREATE TABLE IF NOT EXISTS short_link_records (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
