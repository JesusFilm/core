/*
  Warnings:

  - A unique constraint covering the columns `[playbackId]` on the table `MuxVideo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uploadId]` on the table `MuxVideo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assetId]` on the table `MuxVideo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MuxVideo" ADD COLUMN     "assetId" TEXT,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "playbackId" TEXT,
ADD COLUMN     "uploadId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_playbackId_key" ON "MuxVideo"("playbackId");

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_uploadId_key" ON "MuxVideo"("uploadId");

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_assetId_key" ON "MuxVideo"("assetId");

-- CreateIndex
CREATE INDEX "MuxVideo_assetId_idx" ON "MuxVideo"("assetId");
