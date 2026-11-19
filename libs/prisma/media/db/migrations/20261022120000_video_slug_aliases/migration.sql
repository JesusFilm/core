-- CreateTable
CREATE TABLE "VideoSlug" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoSlug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoSlug_value_key" ON "VideoSlug"("value");

-- CreateIndex
CREATE INDEX "VideoSlug_videoId_idx" ON "VideoSlug"("videoId");

-- AddForeignKey
ALTER TABLE "VideoSlug" ADD CONSTRAINT "VideoSlug_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
