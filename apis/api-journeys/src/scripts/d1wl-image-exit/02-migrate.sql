-- Rewrite Block.src from d1wl CloudFront URLs to Cloudflare Images URLs.
--
-- ROLLBACK BY DEFAULT. Nothing is kept unless you pass  -v commit=1.
--   psql "$PSQL_URL" -X -f <path>/02-migrate.sql              # rehearsal: updates, checks, rolls back
--   psql "$PSQL_URL" -X -v commit=1 -f <path>/02-migrate.sql  # the real thing
--
-- Inside one transaction it: counts before, writes before-state.csv (the
-- exact rows about to change, for 03-revert.sql; a rehearsal writes
-- before-state.rehearsal.csv instead), runs the UPDATE, counts
-- after, then COMMITs only if commit=1 AND every check passed; otherwise it
-- ROLLBACKs. Only Block.src is written. Block.updatedAt is deliberately left
-- alone so the revert is exact and nothing sorts differently in the admin.

\set ON_ERROR_STOP on

\if :{?commit}
\else
  \set commit 0
\endif

-- before-state.csv is the only input 03-revert.sql has. Refuse to run for real
-- if one is already here, so a second run can never overwrite a good one.
\set before_exists `test -e before-state.csv && echo 1 || echo 0`
\if :commit
  \if :before_exists
    \echo 'ERROR: before-state.csv already exists in this directory.'
    \echo '  If a previous run COMMITTED, it is your revert input: keep it and do not re-run.'
    \echo '  If that run rolled back, move the file aside and run again (a fresh directory is simplest).'
    DO $$ BEGIN RAISE EXCEPTION 'aborted, see the ERROR lines above'; END $$;
  \endif
\endif

\ir _load-mapping.sql

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';

-- ---- before ---------------------------------------------------------------
SELECT (SELECT count(*) FROM d1wl_affected)                                       AS pre_mapped,
       (SELECT count(*) FROM d1wl_unmapped)                                       AS pre_unmapped,
       (SELECT count(*) FROM "Block")                                             AS pre_total,
       (SELECT count(*) FROM "Block" WHERE src IN (SELECT cloudflare_url FROM d1wl_map)) AS pre_already_new,
       (SELECT count(DISTINCT journey_id) FROM d1wl_affected)                     AS pre_journeys \gset

\echo
\echo '== BEFORE =='
SELECT :pre_mapped AS blocks_to_rewrite,
       :pre_journeys AS journeys,
       :pre_unmapped AS unmapped_d1wl_blocks,
       :pre_already_new AS blocks_already_on_cloudflare_urls,
       :pre_total AS blocks_total;

-- Nothing to do (already migrated, or the mapping matches nothing): stop before
-- writing any file.
SELECT (:pre_mapped > 0) AS has_work \gset
\if :has_work
\else
  ROLLBACK;
  \echo 'Nothing to rewrite: no Block.src matches mapping.csv. Nothing changed, no file written.'
  \quit
\endif

-- A real run never gets past unmapped d1wl rows (the checks below would roll it
-- back anyway); stop here so no before-state.csv is left behind for nothing.
SELECT (:pre_unmapped = 0) AS no_unmapped \gset
\if :commit
  \if :no_unmapped
  \else
    ROLLBACK;
    \echo 'REFUSING to commit: Block.src values still mention d1wl but are not in mapping.csv'
    \echo '(run 01-dry-run.sql to list them, add them to mapping.csv). Nothing changed, no file written.'
    DO $$ BEGIN RAISE EXCEPTION 'aborted, see the ERROR lines above'; END $$;
  \endif
\endif

-- Exact snapshot of what is about to change; 03-revert.sql reads before-state.csv.
-- A rehearsal writes a different file so it can never shadow the real one.
\if :commit
  \copy (SELECT * FROM d1wl_affected ORDER BY block_id) TO 'before-state.csv' WITH (FORMAT csv, HEADER true)
  \echo 'wrote before-state.csv'
\else
  \copy (SELECT * FROM d1wl_affected ORDER BY block_id) TO 'before-state.rehearsal.csv' WITH (FORMAT csv, HEADER true)
  \echo 'wrote before-state.rehearsal.csv (rehearsal)'
\endif

-- ---- update ---------------------------------------------------------------
WITH updated AS (
  UPDATE "Block" b
     SET src = m.cloudflare_url
    FROM d1wl_map m
   WHERE b.src = m.d1wl_url
  RETURNING b.id
)
SELECT count(*) AS updated_rows FROM updated \gset

-- ---- after (still inside the transaction) ---------------------------------
SELECT (SELECT count(*) FROM d1wl_affected)                                       AS post_mapped_left,
       (SELECT count(*) FROM d1wl_unmapped)                                       AS post_unmapped,
       (SELECT count(*) FROM "Block")                                             AS post_total,
       (SELECT count(*) FROM "Block" WHERE src IN (SELECT cloudflare_url FROM d1wl_map)) AS post_on_cloudflare \gset

\echo
\echo '== AFTER (inside the transaction) =='
SELECT :updated_rows AS rows_updated,
       :post_mapped_left AS d1wl_mapped_left,
       :post_unmapped AS unmapped_d1wl_blocks,
       :post_on_cloudflare AS blocks_on_cloudflare_urls,
       :post_total AS blocks_total;

-- ---- checks ---------------------------------------------------------------
-- Refuses to commit unless: something was there to do, exactly the counted
-- rows changed, no d1wl row is left (mapped or unmapped), and the table
-- neither gained nor lost rows.
SELECT (    :pre_mapped > 0
        AND :updated_rows = :pre_mapped
        AND :pre_unmapped = 0
        AND :post_mapped_left = 0
        AND :post_unmapped = 0
        AND :post_total = :pre_total
        AND :post_on_cloudflare = :pre_already_new + :updated_rows) AS checks_ok \gset

\echo
\if :checks_ok
  \echo 'CHECKS PASSED.'
\else
  \echo 'CHECKS FAILED: rolling back no matter what commit= says.'
  \echo '  (unmapped d1wl rows, 0 rows to do, or counts moved under us; see BEFORE/AFTER above)'
\endif

\if :checks_ok
  \if :commit
    COMMIT;
    \echo 'COMMITTED. Keep before-state.csv: it is the only revert input.'
  \else
    ROLLBACK;
    \echo 'ROLLED BACK (rehearsal; commit was not 1). Re-run with -v commit=1 to keep it.'
  \endif
\else
  ROLLBACK;
  \echo 'ROLLED BACK. Nothing changed.'
\endif

-- ---- verification outside the transaction ---------------------------------
-- After a COMMIT this must read 0 / 0; after a ROLLBACK it shows the untouched state.
\echo
\echo '== STATE NOW (outside the transaction) =='
SELECT (SELECT count(*) FROM d1wl_affected) AS d1wl_mapped_remaining,
       (SELECT count(*) FROM d1wl_unmapped) AS d1wl_unmapped_remaining;
