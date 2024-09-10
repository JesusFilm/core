-- CreateIndex
CREATE INDEX "Video_label_idx" ON "Video"("label");

-- CreateIndex
CREATE INDEX "Video_childIds_idx" ON "Video"("childIds");

-- CreateIndex
CREATE INDEX "VideoTitle_value_idx" ON "VideoTitle"("value");

-- CreateIndex
CREATE INDEX "VideoTitle_primary_idx" ON "VideoTitle"("primary");

-- CreateIndex
CREATE INDEX "VideoTitle_languageId_idx" ON "VideoTitle"("languageId");

-- CreateIndex
CREATE INDEX "VideoVariant_languageId_idx" ON "VideoVariant"("languageId");

-- CreateIndex
CREATE INDEX "VideoVariant_videoId_idx" ON "VideoVariant"("videoId");

-- CreateIndex
CREATE INDEX "VideoVariantSubtitle_languageId_idx" ON "VideoVariantSubtitle"("languageId");

-- CreateIndex
CREATE INDEX "VideoVariantSubtitle_videoVariantId_idx" ON "VideoVariantSubtitle"("videoVariantId");
