-- CreateEnum
CREATE TYPE "ShortLinkNotFound" AS ENUM ('lostPage', 'fallback', 'passthrough');

-- CreateEnum
CREATE TYPE "ShortLinkAssetClass" AS ENUM ('standard', 'permanent', 'videoEmbedded');

-- CreateEnum
CREATE TYPE "ShortLinkStatus" AS ENUM ('active', 'paused', 'retired');

-- CreateEnum
CREATE TYPE "ShortLinkPlacement" AS ENUM ('description', 'endScreen', 'card', 'communityPost', 'inVideoQr', 'other');

-- CreateEnum
CREATE TYPE "ShortLinkHealth" AS ENUM ('ok', 'notFound', 'serverError', 'timeout', 'dns', 'tls', 'redirectLoop', 'unknown');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaRole" ADD VALUE 'shortLinkEditor';
ALTER TYPE "MediaRole" ADD VALUE 'shortLinkAdmin';

-- AlterTable
ALTER TABLE "ShortLink" ADD COLUMN     "assetClass" "ShortLinkAssetClass" NOT NULL DEFAULT 'standard',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "edgePublishedAt" TIMESTAMP(3),
ADD COLUMN     "fallbackTo" TEXT,
ADD COLUMN     "healthCheckedAt" TIMESTAMP(3),
ADD COLUMN     "healthStatus" "ShortLinkHealth",
ADD COLUMN     "language" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "placement" "ShortLinkPlacement",
ADD COLUMN     "redirectStatus" INTEGER,
ADD COLUMN     "status" "ShortLinkStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoId" TEXT,
ADD COLUMN     "youtubeVideoId" TEXT;

-- AlterTable
ALTER TABLE "ShortLinkDomain" ADD COLUMN     "autoFailover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "edgePublishedAt" TIMESTAMP(3),
ADD COLUMN     "fallbackTo" TEXT,
ADD COLUMN     "notFound" "ShortLinkNotFound" NOT NULL DEFAULT 'lostPage',
ADD COLUMN     "passthroughOrigin" TEXT,
ADD COLUMN     "redirectStatus" INTEGER NOT NULL DEFAULT 307,
ADD COLUMN     "reservedPaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "slugAllowedChars" TEXT NOT NULL DEFAULT 'A-Za-z0-9_-',
ADD COLUMN     "slugCaseSensitive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slugMaxLength" INTEGER NOT NULL DEFAULT 64,
ADD COLUMN     "slugMinLength" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ShortLinkCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortLinkCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLinkDestinationHistory" (
    "id" TEXT NOT NULL,
    "shortLinkId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "ShortLinkDestinationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShortLinkToShortLinkCampaign" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShortLinkToShortLinkCampaign_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ShortLinkCampaign_name_idx" ON "ShortLinkCampaign"("name");

-- CreateIndex
CREATE INDEX "ShortLinkDestinationHistory_shortLinkId_changedAt_idx" ON "ShortLinkDestinationHistory"("shortLinkId", "changedAt");

-- CreateIndex
CREATE INDEX "_ShortLinkToShortLinkCampaign_B_index" ON "_ShortLinkToShortLinkCampaign"("B");

-- CreateIndex
CREATE INDEX "ShortLink_domainId_status_deletedAt_idx" ON "ShortLink"("domainId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "ShortLink_videoId_idx" ON "ShortLink"("videoId");

-- CreateIndex
CREATE INDEX "ShortLink_youtubeVideoId_idx" ON "ShortLink"("youtubeVideoId");

-- AddForeignKey
ALTER TABLE "ShortLink" ADD CONSTRAINT "ShortLink_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortLinkDestinationHistory" ADD CONSTRAINT "ShortLinkDestinationHistory_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShortLinkToShortLinkCampaign" ADD CONSTRAINT "_ShortLinkToShortLinkCampaign_A_fkey" FOREIGN KEY ("A") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShortLinkToShortLinkCampaign" ADD CONSTRAINT "_ShortLinkToShortLinkCampaign_B_fkey" FOREIGN KEY ("B") REFERENCES "ShortLinkCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
