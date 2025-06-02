-- AlterTable
ALTER TABLE "AudioPreview" ADD COLUMN     "bitrate" INTEGER NOT NULL DEFAULT 128,
ADD COLUMN     "codec" TEXT NOT NULL DEFAULT 'aac';

-- AlterTable
ALTER TABLE "CountryLanguage" ADD COLUMN     "primary" BOOLEAN NOT NULL DEFAULT false;
