-- Update NULL values with appropriate defaults
UPDATE "BibleCitation" SET "chapterEnd" = -1 WHERE "chapterEnd" IS NULL;
UPDATE "BibleCitation" SET "verseStart" = -1 WHERE "verseStart" IS NULL;
UPDATE "BibleCitation" SET "verseEnd" = -1 WHERE "verseEnd" IS NULL;

-- Make the columns required
ALTER TABLE "BibleCitation" ALTER COLUMN "chapterEnd" SET NOT NULL;
ALTER TABLE "BibleCitation" ALTER COLUMN "verseStart" SET NOT NULL;
ALTER TABLE "BibleCitation" ALTER COLUMN "verseEnd" SET NOT NULL; 