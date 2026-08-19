-- Back the Prisma client's existing non-null `availableLanguages: String[]`
-- type with an actual database constraint, and add a GIN index so the
-- existing hasSome/isEmpty array filters (videos/videosCount, and
-- Arclight's direct-Prisma /v2/media_components listing) aren't doing an
-- unindexed array scan.

UPDATE "Video" SET "availableLanguages" = '{}' WHERE "availableLanguages" IS NULL;

ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET DEFAULT '{}';
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET NOT NULL;

CREATE INDEX "Video_availableLanguages_idx" ON "Video" USING GIN ("availableLanguages");
