/*
  Warnings:
  - Made the column `chapterEnd` on table `BibleCitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verseStart` on table `BibleCitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verseEnd` on table `BibleCitation` required. This step will fail if there are existing NULL values in that column.
*/
-- AlterTable
ALTER TABLE "BibleCitation" ALTER COLUMN "chapterEnd" SET NOT NULL,
ALTER COLUMN "verseStart" SET NOT NULL,
ALTER COLUMN "verseEnd" SET NOT NULL;