-- CreateIndex
CREATE INDEX "CloudflareImage_userId_isAi_createdAt_idx" ON "CloudflareImage"("userId", "isAi", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MuxVideo_userId_createdAt_idx" ON "MuxVideo"("userId", "createdAt" DESC);

-- DropIndex
DROP INDEX "CloudflareImage_userId_idx";
