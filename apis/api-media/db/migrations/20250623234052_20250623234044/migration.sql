-- Update existing records with NULL values to empty arrays
UPDATE "Video" 
SET "restrictDownloadPlatforms" = ARRAY[]::"Platform"[]
WHERE "restrictDownloadPlatforms" IS NULL;

UPDATE "Video" 
SET "restrictViewPlatforms" = ARRAY[]::"Platform"[]
WHERE "restrictViewPlatforms" IS NULL;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "restrictDownloadPlatforms" SET DEFAULT ARRAY[]::"Platform"[],
ALTER COLUMN "restrictViewPlatforms" SET DEFAULT ARRAY[]::"Platform"[];
