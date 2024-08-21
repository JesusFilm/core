-- CreateEnum
CREATE TYPE "BibleCitationType" AS ENUM ('keyword', 'citation');

-- CreateTable
CREATE TABLE "BibleCitation" (
    "id" TEXT NOT NULL,
    "type" "BibleCitationType" NOT NULL,
    "bibleBookId" TEXT NOT NULL,
    "chapStart" INTEGER NOT NULL,
    "chapEnd" INTEGER,
    "verseStart" INTEGER NOT NULL,
    "verseEnd" INTEGER,
    "verseGroupParentId" INTEGER NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "BibleCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleBook" (
    "id" TEXT NOT NULL,
    "osisId" TEXT NOT NULL,
    "alternateNames" TEXT NOT NULL,
    "paratextAbbreviation" TEXT NOT NULL,
    "isNewTestament" BOOLEAN NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "BibleBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleBookName" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "bibleBookId" TEXT NOT NULL,

    CONSTRAINT "BibleBookName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BibleBookName_value_idx" ON "BibleBookName"("value");

-- CreateIndex
CREATE INDEX "BibleBookName_primary_idx" ON "BibleBookName"("primary");

-- CreateIndex
CREATE INDEX "BibleBookName_languageId_idx" ON "BibleBookName"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "BibleBookName_bibleBookId_languageId_key" ON "BibleBookName"("bibleBookId", "languageId");

-- AddForeignKey
ALTER TABLE "BibleCitation" ADD CONSTRAINT "BibleCitation_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleCitation" ADD CONSTRAINT "BibleCitation_bibleBookId_fkey" FOREIGN KEY ("bibleBookId") REFERENCES "BibleBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleBookName" ADD CONSTRAINT "BibleBookName_bibleBookId_fkey" FOREIGN KEY ("bibleBookId") REFERENCES "BibleBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
