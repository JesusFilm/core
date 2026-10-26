-- Plausible's two users on the environment's ClickHouse Cloud service, run as
-- `default` (or your SQL console login) after schema.sql (README.md, "Moving the events to ClickHouse
-- Cloud"). The service also holds the short-links `redirects` database;
-- neither user can see it.
--
-- Passwords: Cloud wants 12+ characters with upper, lower, digit and symbol,
-- and Plausible's goes into a URL, so use URL-safe characters only:
--   echo "$(openssl rand -hex 20)-Pz"

-- Two memory limits sized together for the 8 GiB replica. max_memory_usage
-- caps one query; max_memory_usage_for_user caps everything Plausible runs at
-- once, which is what protects the short-links tenant: a dashboard fans out
-- several queries and api-journeys adds more.
CREATE SETTINGS PROFILE IF NOT EXISTS plausible_profile SETTINGS
  max_memory_usage = 2147483648,          -- 2 GiB
  max_memory_usage_for_user = 4294967296, -- 4 GiB
  max_execution_time = 120,
  max_concurrent_queries_for_user = 8;

-- Plausible: its own database, with the DDL its migrations need. Not GRANT
-- ALL: the SQL console runs as your console login, not `default`, and cannot
-- pass on the SYSTEM, CHECK and view privileges that ALL includes.
CREATE USER IF NOT EXISTS plausible IDENTIFIED WITH sha256_password BY '<plausible password>'
  SETTINGS PROFILE 'plausible_profile';
GRANT SELECT, INSERT, ALTER, CREATE TABLE, CREATE DATABASE, DROP TABLE, DROP DATABASE, TRUNCATE, OPTIMIZE
  ON plausible_events_db.* TO plausible;

-- The copy (copy-to-cloud.sh). Dropped after the cutover:
--   DROP USER migrator;
CREATE USER IF NOT EXISTS migrator IDENTIFIED WITH sha256_password BY '<migrator password>';
GRANT INSERT, SELECT ON plausible_events_db.* TO migrator;
-- copy-to-cloud.sh compares column lists through system.columns.
GRANT SELECT ON system.columns TO migrator;
