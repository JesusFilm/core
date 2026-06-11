-- CreateIndex
-- Note: For production, consider using CREATE INDEX CONCURRENTLY for Video and VideoVariant
-- tables if they have >50K rows. CONCURRENTLY cannot run inside a transaction.
CREATE INDEX "Video_updatedAt_id_idx" ON "Video"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "VideoVariant_updatedAt_id_idx" ON "VideoVariant"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "BibleBook_updatedAt_idx" ON "BibleBook"("updatedAt");

-- CreateIndex
CREATE INDEX "Keyword_updatedAt_idx" ON "Keyword"("updatedAt");
