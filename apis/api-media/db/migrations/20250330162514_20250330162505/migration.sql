/*
  Warnings:

  - A unique constraint covering the columns `[videoId,bibleBookId,chapterStart,chapterEnd,verseStart,verseEnd]` on the table `BibleCitation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `chapterEnd` on table `BibleCitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verseStart` on table `BibleCitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verseEnd` on table `BibleCitation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BibleCitation" ALTER COLUMN "chapterStart" SET DEFAULT -1,
ALTER COLUMN "chapterEnd" SET NOT NULL,
ALTER COLUMN "chapterEnd" SET DEFAULT -1,
ALTER COLUMN "verseStart" SET NOT NULL,
ALTER COLUMN "verseStart" SET DEFAULT -1,
ALTER COLUMN "verseEnd" SET NOT NULL,
ALTER COLUMN "verseEnd" SET DEFAULT -1;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BibleCitation_order_idx" ON "BibleCitation"("order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BibleCitation_videoId_bibleBookId_chapterStart_chapterEnd_v_key" ON "BibleCitation"("videoId", "bibleBookId", "chapterStart", "chapterEnd", "verseStart", "verseEnd");
