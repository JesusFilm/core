-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "CampaignPageKind" AS ENUM ('landing', 'regionTemplate');

-- CreateEnum
CREATE TYPE "CampaignBackgroundKind" AS ENUM ('none', 'surface', 'contrast', 'primary', 'custom', 'image');

-- CreateEnum
CREATE TYPE "CampaignBackgroundOverlay" AS ENUM ('light', 'medium', 'heavy');

-- CreateEnum
CREATE TYPE "CampaignAlign" AS ENUM ('left', 'center', 'right');

-- CreateEnum
CREATE TYPE "CampaignTypographyVariant" AS ENUM ('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline');

-- CreateEnum
CREATE TYPE "CampaignButtonVariant" AS ENUM ('text', 'contained', 'outlined');

-- CreateEnum
CREATE TYPE "CampaignButtonSize" AS ENUM ('small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "CampaignChildPlacement" AS ENUM ('above', 'below');

-- CreateEnum
CREATE TYPE "CampaignMediaSide" AS ENUM ('left', 'right');

-- CreateEnum
CREATE TYPE "CampaignSwitcherVariant" AS ENUM ('cards', 'list', 'pills');

-- CreateEnum
CREATE TYPE "CampaignJourneyListDisplay" AS ENUM ('grid', 'list');

-- CreateEnum
CREATE TYPE "CampaignColumnsRatio" AS ENUM ('equal', 'wideLeft', 'wideRight');

-- CreateEnum
CREATE TYPE "CampaignRadius" AS ENUM ('square', 'slight', 'rounded', 'veryRounded');

-- CreateEnum
CREATE TYPE "CampaignButtonRadius" AS ENUM ('rounded', 'pill');

-- CreateEnum
CREATE TYPE "CampaignStringKey" AS ENUM ('allRegions', 'step1', 'step2', 'step2help', 'step3', 'step4', 'copy', 'copied', 'downloadQr', 'open', 'watch', 'openTemplate', 'youtube', 'totalVisitors', 'topCountry', 'seeAllOnWatch', 'videos');

-- CreateEnum
CREATE TYPE "CampaignTextSource" AS ENUM ('human', 'machine');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleTranslations" JSONB NOT NULL DEFAULT '{}',
    "slug" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "defaultLanguageId" TEXT NOT NULL,
    "palette" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignLanguage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CampaignLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTheme" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "themeMode" "ThemeMode" NOT NULL,
    "headerFont" TEXT,
    "bodyFont" TEXT,
    "labelFont" TEXT,
    "primaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "surfaceColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "mutedColor" TEXT NOT NULL,
    "contrastBackgroundColor" TEXT NOT NULL,
    "contrastTextColor" TEXT NOT NULL,
    "radius" "CampaignRadius" NOT NULL DEFAULT 'rounded',
    "buttonRadius" "CampaignButtonRadius" NOT NULL DEFAULT 'pill',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignPage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "kind" "CampaignPageKind" NOT NULL,

    CONSTRAINT "CampaignPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignBlock" (
    "id" TEXT NOT NULL,
    "typename" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "pageId" TEXT,
    "regionId" TEXT,
    "parentBlockId" TEXT,
    "parentOrder" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "backgroundKind" "CampaignBackgroundKind" NOT NULL DEFAULT 'none',
    "backgroundColor" TEXT,
    "coverBlockId" TEXT,
    "backgroundOverlay" "CampaignBackgroundOverlay",
    "headingColor" TEXT,
    "textColor" TEXT,
    "buttonColor" TEXT,
    "buttonTextColor" TEXT,
    "accentColor" TEXT,
    "eyebrow" TEXT,
    "eyebrowTranslations" JSONB,
    "title" TEXT,
    "titleTranslations" JSONB,
    "lede" TEXT,
    "ledeTranslations" JSONB,
    "bullets" TEXT,
    "bulletsTranslations" JSONB,
    "content" TEXT,
    "contentTranslations" JSONB,
    "intro" TEXT,
    "introTranslations" JSONB,
    "label" TEXT,
    "labelTranslations" JSONB,
    "alt" TEXT,
    "altTranslations" JSONB,
    "description" TEXT,
    "descriptionTranslations" JSONB,
    "align" "CampaignAlign",
    "mediaSide" "CampaignMediaSide",
    "mediaBlockId" TEXT,
    "logoBlockId" TEXT,
    "switcherVariant" "CampaignSwitcherVariant",
    "display" "CampaignJourneyListDisplay",
    "showMap" BOOLEAN,
    "ratio" "CampaignColumnsRatio",
    "typographyVariant" "CampaignTypographyVariant",
    "buttonVariant" "CampaignButtonVariant",
    "buttonSize" "CampaignButtonSize",
    "color" TEXT,
    "labelColor" TEXT,
    "placement" "CampaignChildPlacement",
    "source" "VideoBlockSource",
    "videoId" TEXT,
    "videoVariantLanguageId" TEXT,
    "image" TEXT,
    "duration" INTEGER,
    "src" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "journeyId" TEXT,

    CONSTRAINT "CampaignBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAction" (
    "campaignBlockId" TEXT NOT NULL,
    "blockId" TEXT,
    "regionId" TEXT,
    "url" TEXT,
    "target" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignAction_pkey" PRIMARY KEY ("campaignBlockId")
);

-- CreateTable
CREATE TABLE "CampaignRegion" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTranslations" JSONB NOT NULL DEFAULT '{}',
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "listed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRegionLanguage" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "journeyId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "qrCodeId" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CampaignRegionLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRegionCountry" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CampaignRegionCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignString" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "key" "CampaignStringKey" NOT NULL,
    "value" TEXT NOT NULL,
    "valueTranslations" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "CampaignString_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE INDEX "Campaign_teamId_createdAt_idx" ON "Campaign"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CampaignLanguage_campaignId_idx" ON "CampaignLanguage"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignLanguage_campaignId_languageId_key" ON "CampaignLanguage"("campaignId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTheme_campaignId_key" ON "CampaignTheme"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignPage_campaignId_kind_key" ON "CampaignPage"("campaignId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignBlock_coverBlockId_key" ON "CampaignBlock"("coverBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignBlock_mediaBlockId_key" ON "CampaignBlock"("mediaBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignBlock_logoBlockId_key" ON "CampaignBlock"("logoBlockId");

-- CreateIndex
CREATE INDEX "CampaignBlock_campaignId_idx" ON "CampaignBlock"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignBlock_pageId_idx" ON "CampaignBlock"("pageId");

-- CreateIndex
CREATE INDEX "CampaignBlock_regionId_idx" ON "CampaignBlock"("regionId");

-- CreateIndex
CREATE INDEX "CampaignBlock_parentBlockId_idx" ON "CampaignBlock"("parentBlockId");

-- CreateIndex
CREATE INDEX "CampaignBlock_parentOrder_idx" ON "CampaignBlock"("parentOrder" ASC);

-- CreateIndex
CREATE INDEX "CampaignBlock_typename_idx" ON "CampaignBlock"("typename");

-- CreateIndex
CREATE INDEX "CampaignAction_blockId_idx" ON "CampaignAction"("blockId");

-- CreateIndex
CREATE INDEX "CampaignAction_regionId_idx" ON "CampaignAction"("regionId");

-- CreateIndex
CREATE INDEX "CampaignRegion_campaignId_idx" ON "CampaignRegion"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRegion_campaignId_slug_key" ON "CampaignRegion"("campaignId", "slug");

-- CreateIndex
CREATE INDEX "CampaignRegionLanguage_journeyId_idx" ON "CampaignRegionLanguage"("journeyId");

-- CreateIndex
CREATE INDEX "CampaignRegionLanguage_qrCodeId_idx" ON "CampaignRegionLanguage"("qrCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRegionLanguage_regionId_languageId_key" ON "CampaignRegionLanguage"("regionId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRegionCountry_regionId_countryId_key" ON "CampaignRegionCountry"("regionId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignString_campaignId_key_key" ON "CampaignString"("campaignId", "key");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLanguage" ADD CONSTRAINT "CampaignLanguage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTheme" ADD CONSTRAINT "CampaignTheme_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPage" ADD CONSTRAINT "CampaignPage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CampaignPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "CampaignRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "CampaignBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_coverBlockId_fkey" FOREIGN KEY ("coverBlockId") REFERENCES "CampaignBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_mediaBlockId_fkey" FOREIGN KEY ("mediaBlockId") REFERENCES "CampaignBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBlock" ADD CONSTRAINT "CampaignBlock_logoBlockId_fkey" FOREIGN KEY ("logoBlockId") REFERENCES "CampaignBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAction" ADD CONSTRAINT "CampaignAction_campaignBlockId_fkey" FOREIGN KEY ("campaignBlockId") REFERENCES "CampaignBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAction" ADD CONSTRAINT "CampaignAction_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "CampaignBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAction" ADD CONSTRAINT "CampaignAction_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "CampaignRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegion" ADD CONSTRAINT "CampaignRegion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegionLanguage" ADD CONSTRAINT "CampaignRegionLanguage_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "CampaignRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegionLanguage" ADD CONSTRAINT "CampaignRegionLanguage_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegionLanguage" ADD CONSTRAINT "CampaignRegionLanguage_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegionCountry" ADD CONSTRAINT "CampaignRegionCountry_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "CampaignRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignString" ADD CONSTRAINT "CampaignString_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
