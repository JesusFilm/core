-- CreateEnum
CREATE TYPE "VideoVariantProcessingStatus" AS ENUM ('degraded', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "VideoVariantUploadCanonicalSource" AS ENUM ('upload', 'backfill');

-- AlterTable
-- canonicalVideoVariantId mirrors videoVariantId but is only ever set on the
-- one canonical record for that Variant. A plain unique index on a nullable
-- column allows unlimited NULLs (every non-canonical attempt row) while still
-- enforcing at most one canonical row per Variant.
ALTER TABLE "VideoVariantUpload" ADD COLUMN     "canonicalVideoVariantId" TEXT,
ADD COLUMN     "canonicalSource" "VideoVariantUploadCanonicalSource",
ADD COLUMN     "processingStatus" "VideoVariantProcessingStatus",
ADD COLUMN     "processingStages" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantUpload_canonicalVideoVariantId_key" ON "VideoVariantUpload"("canonicalVideoVariantId");

-- CreateIndex
CREATE INDEX "VideoVariantUpload_processingStatus_idx" ON "VideoVariantUpload"("processingStatus");
