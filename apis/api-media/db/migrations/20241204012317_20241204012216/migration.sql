-- DropForeignKey
ALTER TABLE "VideoSubtitle" DROP CONSTRAINT "VideoSubtitle_videoId_fkey";

-- AlterTable
ALTER TABLE "VideoEdition" ADD COLUMN     "videoId" TEXT;

-- AddForeignKey
ALTER TABLE "VideoEdition" ADD CONSTRAINT "VideoEdition_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
