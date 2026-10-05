-- DropIndex
DROP INDEX "Keyword_updatedAt_idx";

-- CreateIndex
CREATE INDEX "CloudflareImage_updatedAt_id_idx" ON "CloudflareImage"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "Keyword_updatedAt_id_idx" ON "Keyword"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "VideoEdition_updatedAt_id_idx" ON "VideoEdition"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "VideoOrigin_updatedAt_id_idx" ON "VideoOrigin"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "VideoSubtitle_updatedAt_id_idx" ON "VideoSubtitle"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "VideoVariantDownload_updatedAt_id_idx" ON "VideoVariantDownload"("updatedAt", "id");
