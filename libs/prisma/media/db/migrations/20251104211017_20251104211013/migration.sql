-- CreateEnum
CREATE TYPE "MuxSubtitleTrackSource" AS ENUM ('uploaded', 'generated');

-- CreateEnum
CREATE TYPE "MuxSubtitleTrackStatus" AS ENUM ('processing', 'ready', 'errored');

-- CreateTable
CREATE TABLE "MuxSubtitleTrack" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "source" "MuxSubtitleTrackSource" NOT NULL,
    "status" "MuxSubtitleTrackStatus" NOT NULL,
    "bcp47" TEXT NOT NULL,
    "muxVideoId" TEXT NOT NULL,

    CONSTRAINT "MuxSubtitleTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MuxSubtitleTrack_trackId_key" ON "MuxSubtitleTrack"("trackId");

-- CreateIndex
CREATE INDEX "MuxSubtitleTrack_trackId_idx" ON "MuxSubtitleTrack"("trackId");

-- AddForeignKey
ALTER TABLE "MuxSubtitleTrack" ADD CONSTRAINT "MuxSubtitleTrack_muxVideoId_fkey" FOREIGN KEY ("muxVideoId") REFERENCES "MuxVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
