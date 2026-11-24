-- The section lede is now the section description: move every value and its
-- translations into the existing description columns (no section ever had a
-- description before), then drop the lede columns.
UPDATE "CampaignBlock"
SET "description" = COALESCE("description", "lede"),
    "descriptionTranslations" = COALESCE("descriptionTranslations", "ledeTranslations")
WHERE "lede" IS NOT NULL OR "ledeTranslations" IS NOT NULL;

-- AlterTable
ALTER TABLE "CampaignBlock" DROP COLUMN "lede",
DROP COLUMN "ledeTranslations",
ADD COLUMN     "minHeight" INTEGER,
ADD COLUMN     "focalLeft" INTEGER DEFAULT 50,
ADD COLUMN     "focalTop" INTEGER DEFAULT 50,
ADD COLUMN     "scale" INTEGER;
