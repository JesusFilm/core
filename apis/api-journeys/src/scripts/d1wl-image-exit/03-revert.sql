-- Put Block.src back to the d1wl values recorded in before-state.csv.
--
-- ROLLBACK BY DEFAULT, same flip as the migration:
--   psql "$PSQL_URL" -X -f <path>/03-revert.sql
--   psql "$PSQL_URL" -X -v commit=1 -f <path>/03-revert.sql
--
-- Compare-and-set: a block is restored only if its src is still the
-- new_src the migration wrote. A block someone has edited since (a different
-- image chosen) is left alone and counted as "skipped_changed_since".
-- Run it from the directory holding before-state.csv and the
-- before-state.identity.csv 02-migrate.sql wrote beside it (checked against
-- this connection before anything is touched). It does not need mapping.csv;
-- it is self-contained.

\set ON_ERROR_STOP on
\pset pager off

\if :{?commit}
\else
  \set commit 0
\endif

\echo
\echo '== Target =='
SELECT current_database() AS database, current_schema() AS schema, current_user AS db_user;

-- Refuse to run before-state.csv against a database other than the one
-- 02-migrate.sql wrote it for, even if block ids happen to collide (e.g. a
-- copied environment).
CREATE TEMP TABLE d1wl_identity (
  database     text,
  schema       text,
  server_addr  text,
  server_port  text
);
\copy d1wl_identity FROM 'before-state.identity.csv' WITH (FORMAT csv, HEADER true)

SELECT (SELECT database FROM d1wl_identity) = current_database()
   AND (SELECT schema FROM d1wl_identity)   = current_schema()
   AND (SELECT server_addr FROM d1wl_identity) = coalesce(inet_server_addr()::text, '')
   AND (SELECT server_port FROM d1wl_identity) = coalesce(inet_server_port()::text, '') AS identity_ok \gset
\if :identity_ok
\else
  \echo 'ERROR: before-state.identity.csv does not match this connection (database/schema/'
  \echo '       server address/port). before-state.csv was produced for a different target.'
  \echo '       Restoring it here could overwrite unrelated blocks that happen to share ids.'
  \echo '       Aborting.'
  DO $$ BEGIN RAISE EXCEPTION 'aborted, see the ERROR lines above'; END $$;
\endif

CREATE TEMP TABLE d1wl_before (
  block_id         text PRIMARY KEY,
  journey_id       text,
  typename         text,
  old_src          text NOT NULL,
  new_src          text NOT NULL,
  block_deleted_at text
);
\copy d1wl_before FROM 'before-state.csv' WITH (FORMAT csv, HEADER true)

SELECT count(*) AS csv_rows,
       coalesce(count(*) > 0
                AND bool_and(old_src LIKE 'https://d1wl257kev7hsz.cloudfront.net/%')
                AND bool_and(new_src LIKE 'https://imagedelivery.net/%'), false) AS csv_ok
FROM d1wl_before \gset
\if :csv_ok
\else
  \echo 'ERROR: before-state.csv is empty or not a before-state file from 02-migrate.sql. Aborting.'
  DO $$ BEGIN RAISE EXCEPTION 'aborted, see the ERROR lines above'; END $$;
\endif

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';

SELECT (SELECT count(*) FROM "Block" b JOIN d1wl_before r ON r.block_id = b.id AND b.src = r.new_src) AS restorable,
       (SELECT count(*) FROM "Block" b JOIN d1wl_before r ON r.block_id = b.id AND b.src = r.old_src) AS already_restored,
       (SELECT count(*) FROM d1wl_before r WHERE NOT EXISTS (SELECT 1 FROM "Block" b WHERE b.id = r.block_id)) AS block_missing,
       (SELECT count(*) FROM "Block") AS pre_total \gset

\echo
\echo '== BEFORE =='
SELECT :csv_rows AS csv_rows,
       :restorable AS restorable_now,
       :already_restored AS already_back_on_d1wl,
       :block_missing AS block_no_longer_exists,
       :csv_rows - :restorable - :already_restored - :block_missing AS skipped_changed_since;

WITH restored AS (
  UPDATE "Block" b
     SET src = r.old_src
    FROM d1wl_before r
   WHERE r.block_id = b.id AND b.src = r.new_src
  RETURNING b.id
)
SELECT count(*) AS restored_rows FROM restored \gset

SELECT count(*) AS post_total FROM "Block" \gset

\echo
\echo '== AFTER (inside the transaction) =='
SELECT :restored_rows AS rows_restored, :post_total AS blocks_total;

SELECT (:restored_rows = :restorable AND :post_total = :pre_total) AS checks_ok \gset

\echo
\if :checks_ok
  \if :commit
    COMMIT;
    \echo 'COMMITTED. Block.src is back on the d1wl URLs (revalidate the journeys again).'
  \else
    ROLLBACK;
    \echo 'ROLLED BACK (rehearsal; commit was not 1).'
  \endif
\else
  ROLLBACK;
  \echo 'CHECKS FAILED: ROLLED BACK. Nothing changed.'
\endif
