/*
  Warnings:

  - A unique constraint covering the columns `[videoId,languageId]` on the table `VideoStudyQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "VideoStudyQuestion_videoId_languageId_order_key";

-- CreateIndex
CREATE UNIQUE INDEX "VideoStudyQuestion_videoId_languageId_key" ON "VideoStudyQuestion"("videoId", "languageId");
