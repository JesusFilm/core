-- CreateTable
CREATE TABLE "YoutubeChannelAnalyticsDay" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER,
    "estimatedMinutesWatched" INTEGER,
    "averageViewDuration" INTEGER,
    "subscribersGained" INTEGER,
    "subscribersLost" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YoutubeChannelAnalyticsDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YoutubeChannelAnalyticsDay_fetchedAt_idx" ON "YoutubeChannelAnalyticsDay"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeChannelAnalyticsDay_channelId_day_key" ON "YoutubeChannelAnalyticsDay"("channelId", "day");
