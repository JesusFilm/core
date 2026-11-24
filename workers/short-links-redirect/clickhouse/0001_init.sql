-- ClickHouse schema for redirect events (prds/short-links/TECH-DESIGN.md,
-- "ClickHouse"). The queue consumer inserts over HTTP with
-- `INSERT INTO redirects.redirect_events FORMAT JSONEachRow`; api-media reads
-- it with `FORMAT JSON` for the dashboards.
CREATE DATABASE IF NOT EXISTS redirects;

CREATE TABLE IF NOT EXISTS redirects.redirect_events (
  ts               DateTime64(3, 'UTC'),
  hostname         LowCardinality(String),
  pathname         String,
  link_id          String,
  campaign_ids     Array(String),
  video_id         Nullable(String),
  youtube_video_id Nullable(String),
  placement        LowCardinality(Nullable(String)),
  destination      String,
  status           UInt16,
  attribution      LowCardinality(String),
  country          LowCardinality(Nullable(String)),
  device_class     LowCardinality(String),
  os               LowCardinality(String),
  browser          LowCardinality(String),
  referrer_host    Nullable(String),
  language         LowCardinality(Nullable(String)),
  utm_source       Nullable(String),
  utm_medium       Nullable(String),
  utm_campaign     Nullable(String),
  resolved_from    LowCardinality(String),
  global           UInt8,
  owner_hostname   LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(ts)
ORDER BY (link_id, ts);
