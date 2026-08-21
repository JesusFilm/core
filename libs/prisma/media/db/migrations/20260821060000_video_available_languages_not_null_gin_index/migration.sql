-- Backfill any existing NULL values before the NOT NULL constraint is added,
-- so the constraint below cannot fail against current data.
UPDATE "Video" SET "availableLanguages" = ARRAY[]::TEXT[] WHERE "availableLanguages" IS NULL;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET NOT NULL;

-- CreateIndex
-- GIN index backs the `hasSome`/`isEmpty` filter usage on this column, most notably
-- Arclight's paginated public catalog listing (/v2/media_components), which filters
-- on this column today with no index at all.
CREATE INDEX "Video_availableLanguages_idx" ON "Video" USING GIN ("availableLanguages");
