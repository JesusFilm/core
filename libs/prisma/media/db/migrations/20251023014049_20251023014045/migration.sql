-- CreateEnum
CREATE TYPE "MuxSubtitleTrackSource" AS ENUM ('uploaded', 'generated');

-- CreateTable
CREATE TABLE "MuxSubtitleTrack" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "source" "MuxSubtitleTrackSource" NOT NULL,
    "readyToStream" BOOLEAN NOT NULL DEFAULT false,
    "languageCode" TEXT NOT NULL,
    "muxLanguageName" TEXT,
    "muxVideoId" TEXT NOT NULL,

    CONSTRAINT "MuxSubtitleTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MuxSubtitleTrack_trackId_key" ON "MuxSubtitleTrack"("trackId");

-- CreateIndex
CREATE INDEX "MuxSubtitleTrack_trackId_idx" ON "MuxSubtitleTrack"("trackId");

-- AddForeignKey
ALTER TABLE "MuxSubtitleTrack" ADD CONSTRAINT "MuxSubtitleTrack_muxVideoId_fkey" FOREIGN KEY ("muxVideoId") REFERENCES "MuxVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
