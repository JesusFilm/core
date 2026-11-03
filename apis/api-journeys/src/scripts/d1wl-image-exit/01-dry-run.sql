-- READ-ONLY dry run for the d1wl -> Cloudflare Images Block.src rewrite.
--
-- Run it from the working directory that holds mapping.csv (see RUNBOOK.md):
--   psql "$PSQL_URL" -X -f <path>/01-dry-run.sql
--
-- It writes nothing to the database. The only objects it creates are
-- session-local temp tables/views (in _load-mapping.sql), and they are made
-- BEFORE the session is switched to read-only; after that any write fails.
-- Files written to the working directory (client side):
--   dry-run-blocks.csv      every Block that would change
--   dry-run-journeys.csv    every journey that owns one, with live/template flags
--   dry-run-revalidate.csv  slug,hostname pairs to refresh afterwards (live only)

\set ON_ERROR_STOP on
\ir _load-mapping.sql

SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;
SET statement_timeout = '120s';

\echo
\echo '== Summary =='
SELECT (SELECT count(*) FROM d1wl_affected)                                  AS blocks_to_rewrite,
       (SELECT count(*) FROM d1wl_affected WHERE block_deleted_at IS NOT NULL) AS of_which_soft_deleted,
       (SELECT count(*) FROM d1wl_journeys)                                   AS journeys,
       (SELECT count(*) FROM d1wl_journeys WHERE is_live)                     AS journeys_live,
       (SELECT count(DISTINCT team_id) FROM d1wl_journeys)                    AS teams,
       (SELECT count(DISTINCT team_id) FROM d1wl_journeys WHERE is_live)      AS teams_live,
       (SELECT count(*) FROM d1wl_journeys WHERE is_template)                 AS template_journeys,
       (SELECT count(*) FROM d1wl_unmapped)                                   AS unmapped_blocks;

\echo
\echo '== Journeys by status (live = published, not deleted/trashed/archived) =='
SELECT status, is_live, is_template, count(*) AS journeys, sum(affected_blocks) AS blocks
FROM d1wl_journeys
GROUP BY status, is_live, is_template
ORDER BY status, is_live DESC, is_template DESC;

\echo
\echo '== Per mapping row (a row with 0 blocks means the mapping key matches nothing) =='
SELECT m.d1wl_url,
       m.cloudflare_url,
       count(a.block_id)              AS blocks,
       count(DISTINCT a.journey_id)   AS journeys
FROM d1wl_map m
LEFT JOIN d1wl_affected a ON a.old_src = m.d1wl_url
GROUP BY m.d1wl_url, m.cloudflare_url
ORDER BY m.d1wl_url;

\echo
\echo '== TEMPLATE journeys holding d1wl images (these are what keeps re-seeding new journeys) =='
SELECT journey_id, slug, status, is_live, affected_blocks, deleted_at
FROM d1wl_journeys
WHERE is_template
ORDER BY slug;

\echo
\echo '== UNMAPPED Block.src values that still mention the d1wl host (must be empty before committing) =='
SELECT src, count(*) AS blocks, count(DISTINCT journey_id) AS journeys
FROM d1wl_unmapped
GROUP BY src
ORDER BY blocks DESC;

\echo
\echo '== Affected blocks that are a journey primary / creator / logo image (og:image, Facebook re-scrape) =='
SELECT is_primary_image, is_creator_image, is_logo_image, count(*) AS journeys, count(*) FILTER (WHERE is_live) AS live
FROM d1wl_journeys
WHERE is_primary_image OR is_creator_image OR is_logo_image
GROUP BY is_primary_image, is_creator_image, is_logo_image;

\echo
\echo '== Writing dry-run CSVs to the working directory =='
\copy (SELECT * FROM d1wl_affected ORDER BY journey_id, block_id) TO 'dry-run-blocks.csv' WITH (FORMAT csv, HEADER true)
\copy (SELECT * FROM d1wl_journeys ORDER BY is_live DESC, slug) TO 'dry-run-journeys.csv' WITH (FORMAT csv, HEADER true)
\copy (SELECT * FROM d1wl_revalidate ORDER BY slug, hostname) TO 'dry-run-revalidate.csv' WITH (FORMAT csv, HEADER true)

-- ---------------------------------------------------------------------------
-- Residual scan: anything ELSE in the journeys database that still contains
-- the d1wl host (Block.image on video blocks, Campaign blocks, template
-- gallery pages, JSON settings...). The UPDATE rewrites Block.src only, so
-- these are report-only. Tables with more than ~1M estimated rows are skipped
-- (and listed) so this stays cheap on production.
-- ---------------------------------------------------------------------------
\echo
\echo '== Residual scan: other columns that mention the d1wl host (NOT touched by the UPDATE) =='
SELECT table_name, column_name, hits
FROM (
  SELECT c.table_name,
         c.column_name,
         (xpath('/row/n/text()',
                query_to_xml(format('SELECT count(*) AS n FROM %I.%I WHERE %I::text ILIKE %L',
                                    c.table_schema, c.table_name, c.column_name,
                                    '%d1wl257kev7hsz%'),
                             false, true, '')))[1]::text::bigint AS hits
  FROM information_schema.columns c
  JOIN pg_class pc ON pc.oid = to_regclass(format('%I.%I', c.table_schema, c.table_name))
  WHERE c.table_schema = current_schema()
    AND pc.relkind = 'r'
    AND pc.reltuples < 1000000
    AND c.data_type IN ('text', 'character varying', 'json', 'jsonb', 'ARRAY')
) scan
WHERE hits > 0
ORDER BY table_name, column_name;

\echo
\echo '== Residual scan: tables skipped as too large (> ~1M estimated rows) =='
SELECT c.relname AS table_name, c.reltuples::bigint AS estimated_rows
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = current_schema() AND c.relkind = 'r' AND c.reltuples >= 1000000
ORDER BY c.reltuples DESC;

\echo
\echo 'Dry run complete. Nothing was written to the database.'
