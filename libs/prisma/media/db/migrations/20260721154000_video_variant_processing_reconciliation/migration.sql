CREATE TYPE "VideoVariantUploadStatus" AS ENUM (
  'created',
  'r2Prepared',
  'r2Uploaded',
  'muxCreated',
  'muxReady',
  'variantCreated',
  'processing',
  'degraded',
  'complete',
  'failed'
);

CREATE TABLE "VideoVariantUpload" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "sourceKey" TEXT,
  "status" "VideoVariantUploadStatus" NOT NULL DEFAULT 'created',
  "canonical" BOOLEAN NOT NULL DEFAULT false,
  "videoId" TEXT NOT NULL,
  "edition" TEXT NOT NULL DEFAULT 'base',
  "languageId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "processingStages" JSONB NOT NULL DEFAULT '{}',
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
  "retryAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VideoVariantUpload_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VideoVariantUpload_status_idx" ON "VideoVariantUpload"("status");
CREATE INDEX "VideoVariantUpload_videoId_languageId_edition_idx" ON "VideoVariantUpload"("videoId", "languageId", "edition");
CREATE INDEX "VideoVariantUpload_r2AssetId_idx" ON "VideoVariantUpload"("r2AssetId");
CREATE INDEX "VideoVariantUpload_muxVideoId_idx" ON "VideoVariantUpload"("muxVideoId");
CREATE INDEX "VideoVariantUpload_videoVariantId_idx" ON "VideoVariantUpload"("videoVariantId");
CREATE INDEX "VideoVariantUpload_canonical_status_updatedAt_idx" ON "VideoVariantUpload"("canonical", "status", "updatedAt");
CREATE UNIQUE INDEX "VideoVariantUpload_one_canonical_per_variant_idx"
  ON "VideoVariantUpload"("videoVariantId")
  WHERE "canonical" = true AND "videoVariantId" IS NOT NULL;

ALTER TABLE "VideoVariantUpload"
  ADD CONSTRAINT "VideoVariantUpload_videoId_fkey"
  FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoVariantUpload"
  ADD CONSTRAINT "VideoVariantUpload_r2AssetId_fkey"
  FOREIGN KEY ("r2AssetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VideoVariantUpload"
  ADD CONSTRAINT "VideoVariantUpload_muxVideoId_fkey"
  FOREIGN KEY ("muxVideoId") REFERENCES "MuxVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VideoVariantUpload"
  ADD CONSTRAINT "VideoVariantUpload_videoVariantId_fkey"
  FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
