/*
  Warnings:

  - A unique constraint covering the columns `[vttAssetId]` on the table `VideoSubtitle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[srtAssetId]` on the table `VideoSubtitle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assetId]` on the table `VideoVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assetId]` on the table `VideoVariantDownload` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "VideoSubtitle" ADD COLUMN     "srtAssetId" TEXT,
ADD COLUMN     "srtVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "vttAssetId" TEXT,
ADD COLUMN     "vttVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "assetId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "VideoVariantDownload" ADD COLUMN     "assetId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_vttAssetId_key" ON "VideoSubtitle"("vttAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_srtAssetId_key" ON "VideoSubtitle"("srtAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_assetId_key" ON "VideoVariant"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantDownload_assetId_key" ON "VideoVariantDownload"("assetId");

-- AddForeignKey
-- ALTER TABLE "MuxVideo" ADD CONSTRAINT "MuxVideo_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_srtAssetId_fkey" FOREIGN KEY ("srtAssetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_vttAssetId_fkey" FOREIGN KEY ("vttAssetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;
