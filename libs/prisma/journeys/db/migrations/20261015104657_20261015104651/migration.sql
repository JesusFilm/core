-- DropForeignKey
ALTER TABLE "CampaignRegionLanguage" DROP CONSTRAINT "CampaignRegionLanguage_journeyId_fkey";

-- AlterTable
ALTER TABLE "CampaignBlock" ALTER COLUMN "mediaSide" SET DEFAULT 'right',
ALTER COLUMN "switcherVariant" SET DEFAULT 'cards',
ALTER COLUMN "display" SET DEFAULT 'grid',
ALTER COLUMN "showMap" SET DEFAULT false,
ALTER COLUMN "ratio" SET DEFAULT 'equal',
ALTER COLUMN "placement" SET DEFAULT 'below';

-- DropEnum
DROP TYPE "CampaignTextSource";

-- AddForeignKey
ALTER TABLE "CampaignRegionLanguage" ADD CONSTRAINT "CampaignRegionLanguage_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
