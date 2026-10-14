-- Note: CREATE INDEX below takes a SHARE lock that blocks writes to Video
-- for the whole build (it runs without CONCURRENTLY). Same caution as
-- libs/prisma/media/db/migrations/20260324194149_20260324194147/migration.sql:
-- verify current Video row count before applying in production, and if it's
-- large, consider splitting the index creation into its own non-transactional
-- CREATE INDEX CONCURRENTLY migration (CONCURRENTLY cannot run inside a
-- transaction, so it cannot share this migration's transaction with the
-- statements below). The NOT NULL change below avoids its own full-table-scan
-- lock via the NOT VALID CHECK / VALIDATE CONSTRAINT staging pattern, so it
-- does not carry the same row-count caution.

-- Backfill any existing NULL values before the NOT NULL constraint is added,
-- so the constraint below cannot fail against current data.
UPDATE "Video" SET "availableLanguages" = ARRAY[]::TEXT[] WHERE "availableLanguages" IS NULL;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET DEFAULT ARRAY[]::TEXT[];

-- Stage the NOT NULL change through a NOT VALID check constraint so the scan
-- that proves existing rows satisfy it runs under SHARE UPDATE EXCLUSIVE
-- (concurrent reads/writes allowed) rather than under the ACCESS EXCLUSIVE
-- lock SET NOT NULL would otherwise need to hold for its own full-table scan.
-- Once validated, SET NOT NULL recognizes the equivalent validated CHECK and
-- skips its scan, so the ACCESS EXCLUSIVE lock it does take is brief.
ALTER TABLE "Video" ADD CONSTRAINT "Video_availableLanguages_not_null_check" CHECK ("availableLanguages" IS NOT NULL) NOT VALID;
ALTER TABLE "Video" VALIDATE CONSTRAINT "Video_availableLanguages_not_null_check";
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET NOT NULL;
ALTER TABLE "Video" DROP CONSTRAINT "Video_availableLanguages_not_null_check";

-- CreateIndex
-- GIN index backs the `hasSome` filter Arclight's paginated public catalog listing
-- (apps/arclight/.../_media-components/index.ts, /v2/media_components?languageIds=)
-- applies directly against this column via its own Prisma client, with no index at
-- all today. `hasSome` compiles to the `&&` (overlap) operator, which the default
-- `array_ops` GIN opclass does serve.
--
-- It does NOT back `isEmpty: false` (used at 6 call sites in
-- apis/api-media/src/schema/video/video.ts): Prisma compiles that to `<> '{}'`, an
-- operator `array_ops` has no strategy for, so the planner cannot use this index for
-- it — see docs/solutions/logic-errors/gin-array-ops-index-does-not-serve-isempty-predicate-2026-09-16.md.
CREATE INDEX "Video_availableLanguages_idx" ON "Video" USING GIN ("availableLanguages");
