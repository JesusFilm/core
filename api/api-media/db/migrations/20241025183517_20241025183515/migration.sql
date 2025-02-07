-- CreateTable
CREATE TABLE "CloudflareR2" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "userId" TEXT NOT NULL,
    "publicUrl" TEXT,
    "videoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudflareR2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CloudflareR2_videoId_idx" ON "CloudflareR2"("videoId");

-- CreateIndex
CREATE INDEX "CloudflareR2_userId_idx" ON "CloudflareR2"("userId");

-- AddForeignKey
ALTER TABLE "CloudflareR2" ADD CONSTRAINT "CloudflareR2_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
