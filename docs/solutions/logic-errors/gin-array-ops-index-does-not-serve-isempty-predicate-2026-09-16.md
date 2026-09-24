---
title: 'GIN array_ops index cannot serve Prisma isEmpty:false (compiles to <>, an unsupported operator)'
date: 2026-09-16
pr: '#9534'
status: solved
severity: medium
category: logic-errors
module: api-media
problem_type: logic_error
component: database
symptoms:
  - PR justified a `@@index([availableLanguages], type: Gin)` as backing the "catalog hot path" filter `availableLanguages: { isEmpty: false }`
  - EXPLAIN shows the index is never used for that predicate, with or without it present
tags:
  - prisma
  - postgresql
  - gin-index
  - array-ops
  - operator-class
  - query-planner
  - api-media
---

# GIN array_ops index cannot serve Prisma `isEmpty: false` (compiles to `<>`, an unsupported operator)

## Context

PR #9534 (`phoebe/bot-0-issue-9523`, "fix(api-media): enforce NOT NULL default and GIN index on Video.availableLanguages") bundled two changes to `Video.availableLanguages` (a Postgres `text[]` column):

1. `@default([])` + a backfill + `SET NOT NULL` on the column.
2. `@@index([availableLanguages], type: Gin)` — a default-operator-class (`array_ops`) GIN index — justified in the migration comment as backing a "catalog hot path" filter.

This doc records the empirical verification of two premises: whether the back-dated migration timestamp causes shadow-db drift, and whether the GIN index actually serves the predicate it claims to optimize.

## Premise 1: back-dated migration (P3006 drift class)

The new migration directory was `20260821060000_video_available_languages_not_null_gin_index`, which sorts **before** three migrations already merged to `main`:

- `20260827120000_add_youtube_service_and_short_link_source_ref`
- `20260827120100_allow_youtube_service_on_nxstp_is`
- `20260901120000_add_youtube_video_metadata_source`

This is the `P3006` shadow-database drift class documented in `apis/AGENTS.md`: a migration directory name that doesn't sort after already-applied history can replay out of order or fail entirely once another branch has since merged migrations with later timestamps.

**Fix applied:** renamed the directory to `20260916194658_video_available_languages_not_null_gin_index` (a fresh timestamp, sorting after `20260901120000`). No SQL content was changed.

**Verification:** ran the manual `prisma migrate dev` invocation documented in `apis/AGENTS.md` (the non-interactive-environment workaround) against a real Postgres instance (`db:5432`, devcontainer), whose local `media` database was behind by several migrations:

```
PG_DATABASE_URL_MEDIA=postgresql://postgres:postgres@db:5432/media?schema=public bash -c \
  'pnpm exec prisma migrate dev --config libs/prisma/media/prisma.config.ts --name "$(date +"%Y%m%d%H%M%S")"'
```

Output (all pending migrations applied cleanly, in order, through the shadow database, with the renamed migration correctly last):

```
Applying migration `20260721154000_video_variant_processing_reconciliation`
Applying migration `20260827120000_add_youtube_service_and_short_link_source_ref`
Applying migration `20260827120100_allow_youtube_service_on_nxstp_is`
Applying migration `20260901120000_add_youtube_video_metadata_source`
Applying migration `20260916194658_video_available_languages_not_null_gin_index`

Your database is now in sync with your schema.
```

No `P3006` error, and no extra empty migration was generated (schema was already in sync with the renamed migration applied — `git status` showed only the rename, no new files). **Premise 1 confirmed and fixed.**

## Premise 2: does the GIN index serve the `isEmpty: false` predicate?

### Call sites

`isEmpty: false` on `availableLanguages` appears at exactly **6** call sites, all in `apis/api-media/src/schema/video/video.ts` (confirmed by grep — matches the task's claimed count):

| Line | Resolver                           | Context                                                                                                                                   |
| ---- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 426  | `Video.children` field resolver    | public children listing (`published: true, availableLanguages: { isEmpty: false }`)                                                       |
| 464  | `Video.parents` field resolver     | public parents listing                                                                                                                    |
| 566  | `Query.video` (slug lookup branch) | public single-video lookup                                                                                                                |
| 574  | `Query.video` (id lookup branch)   | public single-video lookup                                                                                                                |
| 610  | `Query.videos`                     | **the public catalog listing** — this is the "catalog hot path" the PR's migration comment references (Arclight's `/v2/media_components`) |
| 638  | `Query.videosCount`                | count variant of the same catalog listing                                                                                                 |

(Two other `isEmpty: false` occurrences exist in the codebase — `childIds: { isEmpty: false }` in `apis/api-media/src/scripts/audit-parent-variants.ts:29` and `apis/api-media/src/workers/videoChildren/service/service.ts:29` — but those filter a different column, not `availableLanguages`, and are out of scope for this index.)

### What Prisma actually compiles `isEmpty: false` into

Instrumented the real generated Prisma client (`@prisma/adapter-pg`, Prisma 7) with query-event logging and ran the exact predicate shape used by `Query.videos`/`Query.videosCount`:

```ts
await prisma.video.findMany({
  where: { published: true, availableLanguages: { isEmpty: false } },
  take: 5
})
```

Logged SQL:

```sql
SELECT ...
FROM "public"."Video"
WHERE ("public"."Video"."published" = $1 AND "public"."Video"."availableLanguages" <> '{}')
ORDER BY "public"."Video"."id" ASC LIMIT $2 OFFSET $3
```

and for `count`:

```sql
SELECT COUNT(*) AS "_count$_all" FROM (
  SELECT "public"."Video"."id" FROM "public"."Video"
  WHERE ("public"."Video"."published" = $1 AND "public"."Video"."availableLanguages" <> '{}')
  OFFSET $2
) AS "sub"
```

Confirmed: Prisma compiles `isEmpty: false` on an array column to `<> '{}'` — a **negated array equality**. This is exactly the hypothesis under test. Postgres's default GIN `array_ops` operator class only provides strategies for `@>`, `<@`, `&&`, and `=` — there is no `<>` (or `NOT`-anything) strategy in that opclass, so the planner has no way to use a GIN `array_ops` index to answer this predicate.

### EXPLAIN evidence

Built a 100,000-row synthetic reproduction (`gin_test_video`: `id text PRIMARY KEY, published boolean, "availableLanguages" text[]`), ~2% empty arrays (98,021 non-empty / 1,979 empty — mirrors the ~1.2% empty ratio observed in the real local `media.Video` table), realistic cardinality (up to 8 languages drawn from a 500-value pool per row).

**Without the GIN index** — plain count on the predicate:

```
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM gin_test_video WHERE "availableLanguages" <> '{}';

 Aggregate  (cost=3105.97..3105.98 rows=1 width=8) (actual time=14.619..14.620 rows=1 loops=1)
   Buffers: shared hit=1611
   ->  Seq Scan on gin_test_video  (cost=0.00..2861.00 rows=97987 width=0) (actual time=0.006..11.284 rows=98021 loops=1)
         Filter: ("availableLanguages" <> '{}'::text[])
         Rows Removed by Filter: 1979
         Buffers: shared hit=1611
 Execution Time: 14.657 ms
```

**With the GIN `array_ops` index present** (`CREATE INDEX ... USING GIN ("availableLanguages")`, exactly as the PR defines it) — identical predicate:

```
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM gin_test_video WHERE "availableLanguages" <> '{}';

 Aggregate  (cost=3106.18..3106.19 rows=1 width=8) (actual time=10.583..10.584 rows=1 loops=1)
   Buffers: shared hit=1611
   ->  Seq Scan on gin_test_video  (cost=0.00..2861.00 rows=98073 width=0) (actual time=0.005..7.934 rows=98021 loops=1)
         Filter: ("availableLanguages" <> '{}'::text[])
         Rows Removed by Filter: 1979
         Buffers: shared hit=1611
 Execution Time: 10.614 ms
```

Identical plan shape (`Seq Scan` + `Filter:`, not `Index Cond:`) whether the index exists or not — the planner never considers it.

**Same catalog-style query** (`published = true AND availableLanguages <> '{}' ORDER BY id LIMIT 100 OFFSET 5000`), with the index present, for completeness:

```
 Limit  (cost=410.54..418.74 rows=100 width=9) (actual time=0.731..0.747 rows=100 loops=1)
   Buffers: shared hit=1156
   ->  Index Scan using gin_test_video_pkey on gin_test_video  (cost=0.42..7638.61 rows=93121 width=9) (actual time=0.005..0.632 rows=5100 loops=1)
         Filter: (published AND ("availableLanguages" <> '{}'::text[]))
         Rows Removed by Filter: 383
         Buffers: shared hit=1156
```

Ordering/pagination is served by the primary key index; the array predicate is still just a post-filter — the GIN index is untouched.

**Forced-off control** (`SET enable_seqscan = off; SET enable_indexscan = off;`, to see whether the planner is even _capable_ of routing through the GIN index for `<>` when all cheaper paths are penalized):

```
 Aggregate  (cost=10000003106.18..10000003106.19 rows=1 width=8) (actual time=54.176..54.177 rows=1 loops=1)
   ->  Seq Scan on gin_test_video  (cost=10000000000.00..10000002861.00 rows=98073 width=0) (actual time=40.645..51.129 rows=98021 loops=1)
         Filter: ("availableLanguages" <> '{}'::text[])
 Execution Time: 125.688 ms
```

Even with both `Seq Scan` and plain `Index Scan` disabled, Postgres falls back to a (heavily cost-penalized) `Seq Scan` rather than a `Bitmap Index Scan` on the GIN index — because `array_ops` genuinely has no strategy for `<>`. This isn't the planner declining a viable option; the option doesn't exist.

**Sanity check** — a predicate the GIN `array_ops` opclass _does_ support (`&&`, overlap), same index, same table:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM gin_test_video WHERE "availableLanguages" && ARRAY['lang_1'];
```

```
 Aggregate  (cost=1125.93..1125.94 rows=1 width=8) (actual time=0.007..0.007 rows=1 loops=1)
   ->  Bitmap Heap Scan on gin_test_video  (cost=59.88..1124.68 rows=500 width=0) (actual time=0.006..0.006 rows=0 loops=1)
         Recheck Cond: ("availableLanguages" && '{lang_1}'::text[])
         ->  Bitmap Index Scan on gin_test_video_availablelanguages_idx  (cost=0.00..59.75 rows=500 width=0) (actual time=0.005..0.005 rows=0 loops=1)
               Index Cond: ("availableLanguages" && '{lang_1}'::text[])
```

Here the index _is_ used (`Index Cond:`, `Bitmap Index Scan`) — confirming the index and adapter setup are working correctly, and isolating the failure specifically to the `<>`/`isEmpty` predicate, not to some setup problem.

## Verdict

`@@index([availableLanguages], type: Gin)` with the default `array_ops` operator class **does not and cannot** serve the `isEmpty: false` predicate used at all 6 real call sites (Prisma compiles it to `<> '{}'`, which `array_ops` has no strategy for). The index only accelerates `@>`/`<@`/`&&`/`=` predicates, none of which appear anywhere in the current api-media codebase against this column. As written, the index adds write overhead (GIN indexes are relatively expensive to maintain on insert/update) and storage cost with zero read benefit for the stated justification.

**Recommendation: rescope the PR.** Keep the `@default([])` + backfill + `SET NOT NULL` change (independently sound — makes the column's non-null invariant explicit and matches how it's already used) and **drop the GIN index** entirely, since no current query pattern benefits from it. If a genuine containment/overlap use case emerges later (e.g. "videos available in language X"), that would justify re-adding a GIN `array_ops` index at that time — but that's a different, currently-hypothetical predicate, not the one this PR cited.

## Files

- `libs/prisma/media/db/schema.prisma` — `Video.availableLanguages` field + index
- `libs/prisma/media/db/migrations/20260916194658_video_available_languages_not_null_gin_index/migration.sql` (renamed from `20260821060000_...`)
- `apis/api-media/src/schema/video/video.ts` — 6 call sites (lines 426, 464, 566, 574, 610, 638)
