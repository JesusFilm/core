-- This migration was applied directly to the database and is being baselined locally.
-- It adds composite updatedAt+id indexes for efficient cursor-based pagination.
CREATE INDEX IF NOT EXISTS "CloudflareImage_updatedAt_id_idx" ON "CloudflareImage"("updatedAt", "id");
DROP INDEX IF EXISTS "Keyword_updatedAt_idx";
CREATE INDEX IF NOT EXISTS "Keyword_updatedAt_id_idx" ON "Keyword"("updatedAt", "id");
CREATE INDEX IF NOT EXISTS "VideoEdition_updatedAt_id_idx" ON "VideoEdition"("updatedAt", "id");
CREATE INDEX IF NOT EXISTS "VideoOrigin_updatedAt_id_idx" ON "VideoOrigin"("updatedAt", "id");
CREATE INDEX IF NOT EXISTS "VideoSubtitle_updatedAt_id_idx" ON "VideoSubtitle"("updatedAt", "id");
CREATE INDEX IF NOT EXISTS "VideoVariantDownload_updatedAt_id_idx" ON "VideoVariantDownload"("updatedAt", "id");
