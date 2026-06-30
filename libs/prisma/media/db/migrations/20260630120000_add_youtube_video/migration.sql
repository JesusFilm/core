-- CreateEnum
CREATE TYPE "YoutubeReviewState" AS ENUM ('LINKED', 'DISMISSED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "YoutubeReasonCode" AS ENUM ('NO_CATALOG_MATCH', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "YoutubeVideo" (
    "id" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "reviewState" "YoutubeReviewState" NOT NULL,
    "videoId" TEXT,
    "languageId" TEXT,
    "reasonCode" "YoutubeReasonCode",
    "reasonNote" TEXT,
    "youtubeTitle" TEXT,
    "youtubeDescription" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thumbnailUrl" TEXT,
    "playlists" JSONB,
    "madeForKids" BOOLEAN,
    "ageRestricted" BOOLEAN,
    "fileName" TEXT,
    "privacyStatus" TEXT,
    "publishedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "matchMethod" TEXT,
    "matchConfidence" DOUBLE PRECISION,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YoutubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideo_youtubeVideoId_key" ON "YoutubeVideo"("youtubeVideoId");

-- CreateIndex
CREATE INDEX "YoutubeVideo_channelId_idx" ON "YoutubeVideo"("channelId");

-- CreateIndex
CREATE INDEX "YoutubeVideo_reviewState_idx" ON "YoutubeVideo"("reviewState");

-- CreateIndex
CREATE INDEX "YoutubeVideo_videoId_languageId_idx" ON "YoutubeVideo"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "YoutubeVideo_updatedAt_id_idx" ON "YoutubeVideo"("updatedAt", "id");

-- AddForeignKey
ALTER TABLE "YoutubeVideo" ADD CONSTRAINT "YoutubeVideo_languageId_videoId_fkey" FOREIGN KEY ("languageId", "videoId") REFERENCES "VideoVariant"("languageId", "videoId") ON DELETE SET NULL ON UPDATE CASCADE;
