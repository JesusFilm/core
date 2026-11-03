-- Plausible's ClickHouse schema (plausible_events_db) as of Plausible CE
-- v2.1.1, written for ClickHouse Cloud: CREATE TABLE IF NOT EXISTS, and Ecto's
-- TinyLog schema_migrations as MergeTree ORDER BY tuple() (Cloud rejects
-- TinyLog). Run as `default` when preparing a Cloud service for Plausible
-- (README.md, "Preparing the event store"). Plausible's own migrations own
-- the schema afterwards.

CREATE DATABASE IF NOT EXISTS plausible_events_db;

CREATE TABLE IF NOT EXISTS plausible_events_db.events
(
    `name` String,
    `domain` String,
    `user_id` UInt64,
    `session_id` UInt64,
    `hostname` String,
    `pathname` String,
    `referrer` String,
    `referrer_source` String,
    `country_code` LowCardinality(FixedString(2)),
    `screen_size` LowCardinality(String),
    `operating_system` LowCardinality(String),
    `browser` LowCardinality(String),
    `timestamp` DateTime,
    `utm_medium` String,
    `utm_source` String,
    `utm_campaign` String,
    `meta.key` Array(String),
    `meta.value` Array(String),
    `browser_version` LowCardinality(String),
    `operating_system_version` LowCardinality(String),
    `subdivision1_code` LowCardinality(String),
    `subdivision2_code` LowCardinality(String),
    `city_geoname_id` UInt32,
    `utm_content` String,
    `utm_term` String,
    `transferred_from` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (domain, toDate(timestamp), user_id)
SAMPLE BY user_id
SETTINGS index_granularity = 8192
;

CREATE TABLE IF NOT EXISTS plausible_events_db.events_v2
(
    `timestamp` DateTime CODEC(Delta(4), LZ4),
    `name` LowCardinality(String),
    `site_id` UInt64,
    `user_id` UInt64,
    `session_id` UInt64,
    `hostname` String CODEC(ZSTD(3)),
    `pathname` String CODEC(ZSTD(3)),
    `referrer` String CODEC(ZSTD(3)),
    `referrer_source` String CODEC(ZSTD(3)),
    `country_code` FixedString(2),
    `screen_size` LowCardinality(String),
    `operating_system` LowCardinality(String),
    `browser` LowCardinality(String),
    `utm_medium` String CODEC(ZSTD(3)),
    `utm_source` String CODEC(ZSTD(3)),
    `utm_campaign` String CODEC(ZSTD(3)),
    `meta.key` Array(String) CODEC(ZSTD(3)),
    `meta.value` Array(String) CODEC(ZSTD(3)),
    `browser_version` LowCardinality(String),
    `operating_system_version` LowCardinality(String),
    `subdivision1_code` LowCardinality(String),
    `subdivision2_code` LowCardinality(String),
    `city_geoname_id` UInt32,
    `utm_content` String CODEC(ZSTD(3)),
    `utm_term` String CODEC(ZSTD(3)),
    `revenue_reporting_amount` Nullable(Decimal(18, 3)),
    `revenue_reporting_currency` FixedString(3),
    `revenue_source_amount` Nullable(Decimal(18, 3)),
    `revenue_source_currency` FixedString(3),
    `city` UInt32 ALIAS city_geoname_id,
    `country` LowCardinality(FixedString(2)) ALIAS country_code,
    `device` LowCardinality(String) ALIAS screen_size,
    `os` LowCardinality(String) ALIAS operating_system,
    `os_version` LowCardinality(String) ALIAS operating_system_version,
    `region` LowCardinality(String) ALIAS subdivision1_code,
    `screen` LowCardinality(String) ALIAS screen_size,
    `source` String ALIAS referrer_source
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (site_id, toDate(timestamp), name, user_id)
ORDER BY (site_id, toDate(timestamp), name, user_id, timestamp)
SAMPLE BY user_id
SETTINGS index_granularity = 8192
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_browsers
(
    `site_id` UInt64,
    `date` Date,
    `browser` String,
    `visitors` UInt64,
    `visits` UInt64,
    `visit_duration` UInt64,
    `bounces` UInt32,
    `import_id` UInt64,
    `pageviews` UInt64,
    `browser_version` String
)
ENGINE = MergeTree
ORDER BY (site_id, date, browser)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_custom_events
(
    `site_id` UInt64,
    `import_id` UInt64,
    `date` Date,
    `name` String CODEC(ZSTD(3)),
    `link_url` String CODEC(ZSTD(3)),
    `path` String CODEC(ZSTD(3)),
    `visitors` UInt64,
    `events` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, import_id, date, name)
SETTINGS replicated_deduplication_window = 0, index_granularity = 8192
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_devices
(
    `site_id` UInt64,
    `date` Date,
    `device` String,
    `visitors` UInt64,
    `visits` UInt64,
    `visit_duration` UInt64,
    `bounces` UInt32,
    `import_id` UInt64,
    `pageviews` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, device)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_entry_pages
(
    `site_id` UInt64,
    `date` Date,
    `entry_page` String,
    `visitors` UInt64,
    `entrances` UInt64,
    `visit_duration` UInt64,
    `bounces` UInt32,
    `import_id` UInt64,
    `pageviews` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, entry_page)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_exit_pages
(
    `site_id` UInt64,
    `date` Date,
    `exit_page` String,
    `visitors` UInt64,
    `exits` UInt64,
    `import_id` UInt64,
    `pageviews` UInt64,
    `bounces` UInt32,
    `visit_duration` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, exit_page)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_locations
(
    `site_id` UInt64,
    `date` Date,
    `country` String,
    `region` String,
    `city` UInt64,
    `visitors` UInt64,
    `visits` UInt64,
    `visit_duration` UInt64,
    `bounces` UInt32,
    `import_id` UInt64,
    `pageviews` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, country, region, city)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_operating_systems
(
    `site_id` UInt64,
    `date` Date,
    `operating_system` String,
    `visitors` UInt64,
    `visits` UInt64,
    `visit_duration` UInt64,
    `bounces` UInt32,
    `import_id` UInt64,
    `pageviews` UInt64,
    `operating_system_version` String
)
ENGINE = MergeTree
ORDER BY (site_id, date, operating_system)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_pages
(
    `site_id` UInt64,
    `date` Date,
    `hostname` String,
    `page` String,
    `visitors` UInt64,
    `pageviews` UInt64,
    `exits` UInt64,
    `time_on_page` UInt64,
    `import_id` UInt64,
    `visits` UInt64,
    `active_visitors` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, hostname, page)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_sources
(
    `site_id` UInt64,
    `date` Date,
    `source` String,
    `utm_medium` String,
    `utm_campaign` String,
    `utm_content` String,
    `utm_term` String,
    `visitors` UInt64,
    `visits` UInt64,
    `visit_duration` UInt64,
    `bounces` UInt32,
    `import_id` UInt64,
    `pageviews` UInt64,
    `referrer` String,
    `utm_source` String
)
ENGINE = MergeTree
ORDER BY (site_id, date, source)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.imported_visitors
(
    `site_id` UInt64,
    `date` Date,
    `visitors` UInt64,
    `pageviews` UInt64,
    `bounces` UInt64,
    `visits` UInt64,
    `visit_duration` UInt64,
    `import_id` UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date)
SETTINGS index_granularity = 8192, replicated_deduplication_window = 0
;

CREATE TABLE IF NOT EXISTS plausible_events_db.ingest_counters
(
    `event_timebucket` DateTime,
    `domain` LowCardinality(String),
    `site_id` Nullable(UInt64),
    `metric` LowCardinality(String),
    `value` UInt64
)
ENGINE = SummingMergeTree(value)
ORDER BY (domain, toDate(event_timebucket), metric, toStartOfMinute(event_timebucket))
SETTINGS index_granularity = 8192
;

CREATE TABLE IF NOT EXISTS plausible_events_db.schema_migrations
(
    `version` Int64,
    `inserted_at` DateTime
)
ENGINE = MergeTree ORDER BY tuple()
;

CREATE TABLE IF NOT EXISTS plausible_events_db.sessions
(
    `session_id` UInt64,
    `sign` Int8,
    `domain` String,
    `user_id` UInt64,
    `hostname` String,
    `is_bounce` UInt8,
    `entry_page` String,
    `exit_page` String,
    `pageviews` Int32,
    `events` Int32,
    `duration` UInt32,
    `referrer` String,
    `referrer_source` String,
    `country_code` LowCardinality(FixedString(2)),
    `screen_size` LowCardinality(String),
    `operating_system` LowCardinality(String),
    `browser` LowCardinality(String),
    `start` DateTime,
    `timestamp` DateTime,
    `utm_medium` String,
    `utm_source` String,
    `utm_campaign` String,
    `browser_version` LowCardinality(String),
    `operating_system_version` LowCardinality(String),
    `subdivision1_code` LowCardinality(String),
    `subdivision2_code` LowCardinality(String),
    `city_geoname_id` UInt32,
    `utm_content` String,
    `utm_term` String,
    `transferred_from` String,
    `entry_meta.key` Array(String),
    `entry_meta.value` Array(String)
)
ENGINE = CollapsingMergeTree(sign)
PARTITION BY toYYYYMM(start)
ORDER BY (domain, toDate(start), user_id, session_id)
SAMPLE BY user_id
SETTINGS index_granularity = 8192
;

CREATE TABLE IF NOT EXISTS plausible_events_db.sessions_v2
(
    `session_id` UInt64,
    `sign` Int8,
    `site_id` UInt64,
    `user_id` UInt64,
    `hostname` String CODEC(ZSTD(3)),
    `timestamp` DateTime CODEC(Delta(4), LZ4),
    `start` DateTime CODEC(Delta(4), LZ4),
    `is_bounce` UInt8,
    `entry_page` String CODEC(ZSTD(3)),
    `exit_page` String CODEC(ZSTD(3)),
    `pageviews` Int32,
    `events` Int32,
    `duration` UInt32,
    `referrer` String CODEC(ZSTD(3)),
    `referrer_source` String CODEC(ZSTD(3)),
    `country_code` LowCardinality(FixedString(2)),
    `screen_size` LowCardinality(String),
    `operating_system` LowCardinality(String),
    `browser` LowCardinality(String),
    `utm_medium` String CODEC(ZSTD(3)),
    `utm_source` String CODEC(ZSTD(3)),
    `utm_campaign` String CODEC(ZSTD(3)),
    `browser_version` LowCardinality(String),
    `operating_system_version` LowCardinality(String),
    `subdivision1_code` LowCardinality(String),
    `subdivision2_code` LowCardinality(String),
    `city_geoname_id` UInt32,
    `utm_content` String CODEC(ZSTD(3)),
    `utm_term` String CODEC(ZSTD(3)),
    `transferred_from` String,
    `entry_meta.key` Array(String) CODEC(ZSTD(3)),
    `entry_meta.value` Array(String) CODEC(ZSTD(3)),
    `exit_page_hostname` String CODEC(ZSTD(3)),
    `city` UInt32 ALIAS city_geoname_id,
    `country` LowCardinality(FixedString(2)) ALIAS country_code,
    `device` LowCardinality(String) ALIAS screen_size,
    `entry_page_hostname` String ALIAS hostname,
    `os` LowCardinality(String) ALIAS operating_system,
    `os_version` LowCardinality(String) ALIAS operating_system_version,
    `region` LowCardinality(String) ALIAS subdivision1_code,
    `screen` LowCardinality(String) ALIAS screen_size,
    `source` String ALIAS referrer_source,
    INDEX minmax_timestamp timestamp TYPE minmax GRANULARITY 1
)
ENGINE = VersionedCollapsingMergeTree(sign, events)
PARTITION BY toYYYYMM(start)
PRIMARY KEY (site_id, toDate(start), user_id, session_id)
ORDER BY (site_id, toDate(start), user_id, session_id)
SAMPLE BY user_id
SETTINGS index_granularity = 8192
;

CREATE TABLE IF NOT EXISTS plausible_events_db.sessions_v2_tmp_versioned
(
    `session_id` UInt64,
    `sign` Int8,
    `site_id` UInt64,
    `user_id` UInt64,
    `hostname` String CODEC(ZSTD(3)),
    `timestamp` DateTime CODEC(Delta(4), LZ4),
    `start` DateTime CODEC(Delta(4), LZ4),
    `is_bounce` UInt8,
    `entry_page` String CODEC(ZSTD(3)),
    `exit_page` String CODEC(ZSTD(3)),
    `pageviews` Int32,
    `events` Int32,
    `duration` UInt32,
    `referrer` String CODEC(ZSTD(3)),
    `referrer_source` String CODEC(ZSTD(3)),
    `country_code` LowCardinality(FixedString(2)),
    `screen_size` LowCardinality(String),
    `operating_system` LowCardinality(String),
    `browser` LowCardinality(String),
    `utm_medium` String CODEC(ZSTD(3)),
    `utm_source` String CODEC(ZSTD(3)),
    `utm_campaign` String CODEC(ZSTD(3)),
    `browser_version` LowCardinality(String),
    `operating_system_version` LowCardinality(String),
    `subdivision1_code` LowCardinality(String),
    `subdivision2_code` LowCardinality(String),
    `city_geoname_id` UInt32,
    `utm_content` String CODEC(ZSTD(3)),
    `utm_term` String CODEC(ZSTD(3)),
    `transferred_from` String,
    `entry_meta.key` Array(String) CODEC(ZSTD(3)),
    `entry_meta.value` Array(String) CODEC(ZSTD(3)),
    INDEX minmax_timestamp timestamp TYPE minmax GRANULARITY 1
)
ENGINE = CollapsingMergeTree(sign)
PARTITION BY toYYYYMM(start)
PRIMARY KEY (site_id, toDate(start), user_id, session_id)
ORDER BY (site_id, toDate(start), user_id, session_id)
SAMPLE BY user_id
SETTINGS index_granularity = 8192
;

