-- AlterTable
ALTER TABLE "CloudflareImage" ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "MuxVideo" ADD COLUMN     "teamId" TEXT;

-- CreateIndex
CREATE INDEX "CloudflareImage_userId_createdAt_idx" ON "CloudflareImage"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CloudflareImage_teamId_createdAt_idx" ON "CloudflareImage"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MuxVideo_teamId_createdAt_idx" ON "MuxVideo"("teamId", "createdAt" DESC);
