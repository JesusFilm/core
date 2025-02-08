-- CreateEnum
CREATE TYPE "ImageAspectRatio" AS ENUM ('hd', 'banner');

-- AlterTable
ALTER TABLE "CloudflareImage" ADD COLUMN     "aspectRatio" "ImageAspectRatio",
ADD COLUMN     "videoId" TEXT;

-- AddForeignKey
ALTER TABLE "CloudflareImage" ADD CONSTRAINT "CloudflareImage_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
