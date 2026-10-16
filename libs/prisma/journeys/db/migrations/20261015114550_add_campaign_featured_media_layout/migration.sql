-- CreateEnum
CREATE TYPE "CampaignFeaturedMediaLayout" AS ENUM ('sideBySide', 'stacked');

-- AlterTable
ALTER TABLE "CampaignBlock" ADD COLUMN     "layout" "CampaignFeaturedMediaLayout";
