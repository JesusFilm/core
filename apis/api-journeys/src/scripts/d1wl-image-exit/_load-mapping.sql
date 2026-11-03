-- Shared by 01-dry-run.sql and 02-migrate.sql (pulled in with \ir, which
-- resolves relative to this file). Not meant to be run on its own.
--
-- Reads ./mapping.csv from psql's working directory (client side, via \copy,
-- so no file ever has to exist on the database host), validates it, and
-- defines the temp tables/views the other scripts query. Everything created
-- here is session-local (pg_temp) and disappears when psql exits; nothing in
-- the database schema is touched.

\set ON_ERROR_STOP on
\pset pager off
\pset null '(null)'

\echo
\echo '== Target =='
SELECT current_database() AS database,
       current_schema()   AS schema,
       current_user       AS db_user,
       now()              AS server_time;

SELECT to_regclass('"Block"')   IS NOT NULL
   AND to_regclass('"Journey"') IS NOT NULL AS has_tables \gset
\if :has_tables
\else
  \echo 'ERROR: "Block"/"Journey" not found in the current schema. Wrong database, or'
  \echo '       the URL carried a non-public ?schema= that was stripped. Aborting.'
  DO $$ BEGIN RAISE EXCEPTION 'aborted, see the ERROR lines above'; END $$;
\endif

-- ---------------------------------------------------------------------------
-- Mapping: one row per d1wl URL that appears in Block.src.
-- Matching is exact string equality on the whole URL (host + key + any query
-- string). A URL variant that is not listed is reported as UNMAPPED, never
-- guessed at.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE d1wl_map (
  d1wl_url       text PRIMARY KEY,
  cloudflare_url text NOT NULL
);

\copy d1wl_map (d1wl_url, cloudflare_url) FROM 'mapping.csv' WITH (FORMAT csv, HEADER true)

SELECT count(*) AS map_rows,
       coalesce(
         count(*) > 0
         AND bool_and(d1wl_url ~ '^https://d1wl257kev7hsz\.cloudfront\.net/[A-Za-z0-9._~%/?=&,+-]+$')
         AND bool_and(cloudflare_url ~ '^https://imagedelivery\.net/[A-Za-z0-9_-]+/[A-Za-z0-9._-]+/[A-Za-z0-9._~%/?=&,+-]+$'),
         false
       ) AS map_ok
FROM d1wl_map \gset

\echo
\echo '== Mapping (mapping.csv) =='
SELECT d1wl_url, cloudflare_url FROM d1wl_map ORDER BY d1wl_url;

\if :map_ok
\else
  \echo 'ERROR: mapping.csv is empty or has a row that is not'
  \echo '       https://d1wl257kev7hsz.cloudfront.net/<key>  ->  https://imagedelivery.net/<account>/<image-id>/<variant>'
  \echo '       (placeholders such as <KEY> are rejected). Aborting.'
  DO $$ BEGIN RAISE EXCEPTION 'aborted, see the ERROR lines above'; END $$;
\endif

-- ---------------------------------------------------------------------------
-- Views, evaluated lazily so they always reflect the current transaction.
-- "live" = a published journey that is not deleted, trashed or archived.
-- ---------------------------------------------------------------------------

-- Every Block whose src is exactly a mapped d1wl URL (soft-deleted blocks
-- included on purpose: they can be restored or duplicated, and the bucket
-- cannot be deleted while they still point at it).
CREATE TEMP VIEW d1wl_affected AS
SELECT b.id            AS block_id,
       b."journeyId"   AS journey_id,
       b.typename      AS typename,
       b.src           AS old_src,
       m.cloudflare_url AS new_src,
       b."deletedAt"   AS block_deleted_at
FROM "Block" b
JOIN d1wl_map m ON m.d1wl_url = b.src;

-- Any Block.src that still mentions the d1wl host but is not an exact
-- mapping key (other key, http://, query-string variant, upper-case host...).
CREATE TEMP VIEW d1wl_unmapped AS
SELECT b.id AS block_id, b."journeyId" AS journey_id, b.typename, b.src
FROM "Block" b
WHERE b.src ILIKE '%d1wl257kev7hsz.cloudfront.net%'
  AND NOT EXISTS (SELECT 1 FROM d1wl_map m WHERE m.d1wl_url = b.src);

-- One row per journey that has at least one affected block.
CREATE TEMP VIEW d1wl_journeys AS
SELECT j.id                  AS journey_id,
       j.slug                AS slug,
       j."teamId"            AS team_id,
       j.status::text        AS status,
       coalesce(j.template, false) AS is_template,
       (j.status = 'published'
          AND j."deletedAt" IS NULL
          AND j."trashedAt" IS NULL
          AND j."archivedAt" IS NULL) AS is_live,
       j."deletedAt"         AS deleted_at,
       count(*)              AS affected_blocks,
       coalesce(bool_or(j."primaryImageBlockId" = a.block_id), false) AS is_primary_image,
       coalesce(bool_or(j."creatorImageBlockId" = a.block_id), false) AS is_creator_image,
       coalesce(bool_or(j."logoImageBlockId"    = a.block_id), false) AS is_logo_image,
       (SELECT string_agg(cd.name, ';' ORDER BY cd.name)
          FROM "CustomDomain" cd
         WHERE cd."teamId" = j."teamId" AND cd."campaignId" IS NULL) AS team_custom_domains
FROM d1wl_affected a
JOIN "Journey" j ON j.id = a.journey_id
GROUP BY j.id;

-- Pages to re-render after the UPDATE: each live journey on /home/<slug>
-- (empty hostname) and on each of its team's custom domains.
CREATE TEMP VIEW d1wl_revalidate AS
SELECT slug, '' AS hostname FROM d1wl_journeys WHERE is_live
UNION ALL
SELECT j.slug, cd.name
FROM d1wl_journeys j
JOIN "CustomDomain" cd ON cd."teamId" = j.team_id AND cd."campaignId" IS NULL
WHERE j.is_live;
