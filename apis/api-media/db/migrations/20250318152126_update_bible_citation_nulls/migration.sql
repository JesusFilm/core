/*
  Warnings:
  - A unique constraint covering the columns `[videoId,bibleBookId,chapterStart,chapterEnd,verseStart,verseEnd]` on the table `BibleCitation` will be added. If there are existing duplicate values, this will fail.
*/
-- CreateIndex
CREATE INDEX IF NOT EXISTS "BibleCitation_order_idx" ON "BibleCitation"("order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BibleCitation_videoId_bibleBookId_chapterStart_chapterEnd_v_key" 
ON "BibleCitation"("videoId", "bibleBookId", "chapterStart", "chapterEnd", "verseStart", "verseEnd");