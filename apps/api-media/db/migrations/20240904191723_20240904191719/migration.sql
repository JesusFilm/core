-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "dash" TEXT;

-- AlterTable
ALTER TABLE "VideoVariantDownload" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;
