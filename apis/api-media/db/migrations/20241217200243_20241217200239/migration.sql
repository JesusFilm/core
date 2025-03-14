/*
  Warnings:

  - A unique constraint covering the columns `[name,videoId]` on the table `VideoEdition` will be added. If there are existing duplicate values, this will fail.
  - Made the column `videoId` on table `VideoVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "VideoSubtitle" DROP CONSTRAINT "VideoSubtitle_edition_fkey";

-- DropForeignKey
ALTER TABLE "VideoVariant" DROP CONSTRAINT "VideoVariant_edition_fkey";

-- AlterTable
ALTER TABLE "VideoVariant" ALTER COLUMN "videoId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VideoEdition_name_videoId_key" ON "VideoEdition"("name", "videoId");

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_edition_videoId_fkey" FOREIGN KEY ("edition", "videoId") REFERENCES "VideoEdition"("name", "videoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_edition_videoId_fkey" FOREIGN KEY ("edition", "videoId") REFERENCES "VideoEdition"("name", "videoId") ON DELETE RESTRICT ON UPDATE CASCADE;
