-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VideoToKeyword" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Keyword_value_idx" ON "Keyword"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_value_languageId_key" ON "Keyword"("value", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "_VideoToKeyword_AB_unique" ON "_VideoToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_VideoToKeyword_B_index" ON "_VideoToKeyword"("B");

-- AddForeignKey
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
