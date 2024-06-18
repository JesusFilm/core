-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoKeyword" (
    "videoId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoKeyword_pkey" PRIMARY KEY ("videoId","keywordId")
);

-- CreateIndex
CREATE INDEX "value_idx" ON "VideoKeyword"("value");

-- CreateIndex
CREATE INDEX "languageId_idx" ON "VideoKeyword"("languageId");

-- AddForeignKey
ALTER TABLE "VideoKeyword" ADD CONSTRAINT "VideoKeyword_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoKeyword" ADD CONSTRAINT "VideoKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
