-- The GIN index for this column ships as its own follow-up migration
-- (20261014120003_video_available_languages_gin_index), and validating the
-- NOT NULL constraint added below ships two migrations later
-- (20261014120002_video_available_languages_validate_not_null), both for the
-- same reason: Postgres holds every lock a transaction acquires until
-- COMMIT, so anything that only needs a lighter lock has to run in its own
-- transaction, after this one's ACCESS EXCLUSIVE lock has already been
-- released at COMMIT — not appended to this transaction.

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET DEFAULT ARRAY[]::TEXT[];

-- Add the NOT NULL constraint as NOT VALID: this only adds the catalog
-- entry (ACCESS EXCLUSIVE, but brief — no table scan) without validating
-- existing rows. It still enforces immediately against every write that
-- commits after this one, so this statement — not the backfill — is what
-- has to run first: adding it ahead of the backfill (in
-- 20261014120001_video_available_languages_backfill_not_null) closes the
-- window where a concurrent insert could otherwise commit a NULL row after
-- the backfill's snapshot but before a constraint existed to reject it,
-- which would then fail the VALIDATE CONSTRAINT two migrations later.
-- Validation of pre-existing rows runs in that later migration instead, so
-- that scan doesn't inherit the ACCESS EXCLUSIVE lock this transaction
-- already holds from SET DEFAULT above.
ALTER TABLE "Video" ADD CONSTRAINT "Video_availableLanguages_not_null_check" CHECK ("availableLanguages" IS NOT NULL) NOT VALID;
