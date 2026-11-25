-- Plausible's user on the environment's ClickHouse Cloud service, run as
-- `default` (or your SQL console login) after schema.sql (README.md,
-- "Preparing the event store"). The service also holds the short-links
-- `redirects` database; this user cannot see it.
--
-- Passwords: Cloud wants 12+ characters with upper, lower, digit and symbol,
-- and Plausible's goes into a URL, so use URL-safe characters only:
--   echo "$(openssl rand -hex 20)-Pz"

-- Two memory limits sized together for the 8 GiB replica. max_memory_usage
-- caps one query; max_memory_usage_for_user caps everything Plausible runs at
-- once, which is what protects the short-links tenant: a dashboard fans out
-- several queries and api-journeys adds more. The memory cap is the guard;
-- the concurrency cap only has to stay out of the way (8 was hit by a single
-- prod dashboard load within minutes of the cutover).
CREATE SETTINGS PROFILE IF NOT EXISTS plausible_profile SETTINGS
  max_memory_usage = 2147483648,          -- 2 GiB
  max_memory_usage_for_user = 4294967296, -- 4 GiB
  max_execution_time = 120,
  max_concurrent_queries_for_user = 64;
-- Already created? ALTER SETTINGS PROFILE plausible_profile SETTINGS <the same list>;

-- Plausible: its own database, with the DDL its migrations need. Not GRANT
-- ALL: the SQL console runs as your console login, not `default`, and cannot
-- pass on the SYSTEM, CHECK and view privileges that ALL includes.
CREATE USER IF NOT EXISTS plausible IDENTIFIED WITH sha256_password BY '<plausible password>'
  SETTINGS PROFILE 'plausible_profile';
GRANT SELECT, INSERT, ALTER, CREATE TABLE, CREATE DATABASE, DROP TABLE, DROP DATABASE, TRUNCATE, OPTIMIZE
  ON plausible_events_db.* TO plausible;
