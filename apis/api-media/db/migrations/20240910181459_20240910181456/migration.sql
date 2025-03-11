-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "mobileCinematicHigh" TEXT,
ADD COLUMN     "mobileCinematicLow" TEXT,
ADD COLUMN     "mobileCinematicVeryLow" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "videoStill" TEXT;

-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "dash" TEXT,
ADD COLUMN     "share" TEXT;

-- AlterTable
ALTER TABLE "VideoVariantDownload" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;
