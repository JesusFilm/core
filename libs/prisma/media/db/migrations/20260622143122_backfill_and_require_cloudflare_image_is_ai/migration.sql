-- Backfill historical rows: every CloudflareImage created before the `isAi`
-- column existed predates the AI-generation feature, so it is a non-AI upload.
-- Must run BEFORE `SET NOT NULL`, or the constraint fails on existing NULLs.
-- The WHERE guard keeps this statement idempotent on re-run.
UPDATE "CloudflareImage" SET "isAi" = false WHERE "isAi" IS NULL;

-- AlterTable
ALTER TABLE "CloudflareImage" ALTER COLUMN "isAi" SET DEFAULT false,
ALTER COLUMN "isAi" SET NOT NULL;
