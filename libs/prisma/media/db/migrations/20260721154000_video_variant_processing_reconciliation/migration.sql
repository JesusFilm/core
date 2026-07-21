CREATE TYPE "VideoVariantReconciliationStatus" AS ENUM (
  'processing',
  'degraded',
  'complete',
  'failed'
);

CREATE TABLE "VideoVariantReconciliation" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "status" "VideoVariantReconciliationStatus" NOT NULL DEFAULT 'processing',
  "videoId" TEXT NOT NULL,
  "edition" TEXT NOT NULL DEFAULT 'base',
  "languageId" TEXT NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "processingStages" JSONB NOT NULL DEFAULT '{}',
  "videoVariantId" TEXT,
  "errorMessage" TEXT,
  "retryAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VideoVariantReconciliation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VideoVariantReconciliation_videoVariantId_key"
  ON "VideoVariantReconciliation"("videoVariantId");
CREATE INDEX "VideoVariantReconciliation_status_idx"
  ON "VideoVariantReconciliation"("status");
CREATE INDEX "VideoVariantReconciliation_videoId_languageId_edition_idx"
  ON "VideoVariantReconciliation"("videoId", "languageId", "edition");
CREATE INDEX "VideoVariantReconciliation_status_updatedAt_idx"
  ON "VideoVariantReconciliation"("status", "updatedAt");

ALTER TABLE "VideoVariantReconciliation"
  ADD CONSTRAINT "VideoVariantReconciliation_videoId_fkey"
  FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoVariantReconciliation"
  ADD CONSTRAINT "VideoVariantReconciliation_videoVariantId_fkey"
  FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
