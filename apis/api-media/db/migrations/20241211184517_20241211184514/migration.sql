-- AlterTable
ALTER TABLE "BibleCitation" ALTER COLUMN "verseStart" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "lengthInMilliseconds" INTEGER;
