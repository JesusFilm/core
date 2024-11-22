/*
  Warnings:

  - A unique constraint covering the columns `[uploadId]` on the table `MuxVideo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_uploadId_key" ON "MuxVideo"("uploadId");
