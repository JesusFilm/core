/*
  Warnings:

  - A unique constraint covering the columns `[playbackId]` on the table `MuxVideo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assetId]` on the table `MuxVideo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_playbackId_key" ON "MuxVideo"("playbackId");

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_assetId_key" ON "MuxVideo"("assetId");

-- CreateIndex
CREATE INDEX "MuxVideo_assetId_idx" ON "MuxVideo"("assetId");
