-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "muxVideoId" TEXT;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_muxVideoId_fkey" FOREIGN KEY ("muxVideoId") REFERENCES "MuxVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
