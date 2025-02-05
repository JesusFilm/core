-- CreateTable
CREATE TABLE "SeoContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "SeoContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoContent_primary_idx" ON "SeoContent"("primary");

-- CreateIndex
CREATE INDEX "SeoContent_languageId_idx" ON "SeoContent"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoContent_videoId_languageId_key" ON "SeoContent"("videoId", "languageId");

-- AddForeignKey
ALTER TABLE "SeoContent" ADD CONSTRAINT "SeoContent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
