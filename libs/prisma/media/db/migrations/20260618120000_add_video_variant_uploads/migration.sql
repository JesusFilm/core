-- CreateEnum
CREATE TYPE "VideoVariantUploadStatus" AS ENUM ('created', 'r2Prepared', 'r2Uploaded', 'muxCreated', 'muxReady', 'variantCreated', 'failed');

-- CreateTable
CREATE TABLE "VideoVariantUpload" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceKey" TEXT,
    "status" "VideoVariantUploadStatus" NOT NULL DEFAULT 'created',
    "videoId" TEXT NOT NULL,
    "edition" TEXT NOT NULL DEFAULT 'base',
    "languageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "originalFilename" TEXT,
    "contentType" TEXT,
    "contentLength" BIGINT,
    "duration" INTEGER,
    "durationMs" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "r2AssetId" TEXT,
    "muxVideoId" TEXT,
    "videoVariantId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoVariantUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoVariantUpload_status_idx" ON "VideoVariantUpload"("status");

-- CreateIndex
CREATE INDEX "VideoVariantUpload_videoId_languageId_edition_idx" ON "VideoVariantUpload"("videoId", "languageId", "edition");

-- CreateIndex
CREATE INDEX "VideoVariantUpload_r2AssetId_idx" ON "VideoVariantUpload"("r2AssetId");

-- CreateIndex
CREATE INDEX "VideoVariantUpload_muxVideoId_idx" ON "VideoVariantUpload"("muxVideoId");

-- CreateIndex
CREATE INDEX "VideoVariantUpload_videoVariantId_idx" ON "VideoVariantUpload"("videoVariantId");

-- AddForeignKey
ALTER TABLE "VideoVariantUpload" ADD CONSTRAINT "VideoVariantUpload_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantUpload" ADD CONSTRAINT "VideoVariantUpload_r2AssetId_fkey" FOREIGN KEY ("r2AssetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantUpload" ADD CONSTRAINT "VideoVariantUpload_muxVideoId_fkey" FOREIGN KEY ("muxVideoId") REFERENCES "MuxVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantUpload" ADD CONSTRAINT "VideoVariantUpload_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
