/*
  Warnings:

  - A unique constraint covering the columns `[videoId,name]` on the table `VideoEdition` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `videoId` to the `VideoEdition` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `VideoEdition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `VideoVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "VideoSubtitle" DROP CONSTRAINT "VideoSubtitle_edition_fkey";

-- DropForeignKey
ALTER TABLE "VideoSubtitle" DROP CONSTRAINT "VideoSubtitle_videoId_fkey";

-- DropForeignKey
ALTER TABLE "VideoVariant" DROP CONSTRAINT "VideoVariant_edition_fkey";

-- AlterTable
ALTER TABLE "VideoEdition" ADD COLUMN     "videoId" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "VideoVariant" ALTER COLUMN "videoId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VideoEdition_videoId_name_key" ON "VideoEdition"("videoId", "name");

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_videoId_edition_fkey" FOREIGN KEY ("videoId", "edition") REFERENCES "VideoEdition"("videoId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEdition" ADD CONSTRAINT "VideoEdition_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoId_edition_fkey" FOREIGN KEY ("videoId", "edition") REFERENCES "VideoEdition"("videoId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;
