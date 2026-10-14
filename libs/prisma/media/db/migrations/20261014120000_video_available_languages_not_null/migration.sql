-- The GIN index for this column ships as its own follow-up migration
-- (20261014120001_video_available_languages_gin_index) rather than in this
-- transaction. Postgres holds every lock a transaction acquires until COMMIT,
-- so if CREATE INDEX shared this transaction, it would run under the
-- ACCESS EXCLUSIVE lock the ALTER TABLE statements below already hold for the
-- rest of the transaction — blocking all reads and writes against Video for
-- the full index build, not just writes. Splitting lets this migration's
-- locks release at COMMIT before the index build's own (weaker) lock begins.

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
