-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "CampaignJourneyRole" AS ENUM ('share', 'template');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eyebrow" TEXT,
    "tagline" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "backgroundImageSrc" TEXT,
    "backgroundImageAlt" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "statsFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMedia" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "TemplateGalleryPageMediaType" NOT NULL,
    "embedUrl" TEXT,
    "muxVideoId" TEXT,
    "muxPlaybackId" TEXT,
    "muxName" TEXT,
    "muxDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignJourney" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "role" "CampaignJourneyRole" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CampaignJourney_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE INDEX "Campaign_teamId_createdAt_idx" ON "Campaign"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMedia_campaignId_key" ON "CampaignMedia"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignJourney_campaignId_journeyId_key" ON "CampaignJourney"("campaignId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignJourney_campaignId_role_order_key" ON "CampaignJourney"("campaignId", "role", "order");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMedia" ADD CONSTRAINT "CampaignMedia_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignJourney" ADD CONSTRAINT "CampaignJourney_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignJourney" ADD CONSTRAINT "CampaignJourney_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
