-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "assetId" TEXT;

-- AlterTable
ALTER TABLE "VideoVariantDownload" ADD COLUMN     "assetId" TEXT;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;
