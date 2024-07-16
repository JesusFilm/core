/*
  Warnings:

  - You are about to drop the column `chapEnd` on the `BibleCitation` table. All the data in the column will be lost.
  - You are about to drop the column `chapStart` on the `BibleCitation` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `BibleCitation` table. All the data in the column will be lost.
  - You are about to drop the column `verseGroupParentId` on the `BibleCitation` table. All the data in the column will be lost.
  - You are about to drop the column `editionId` on the `VideoVariant` table. All the data in the column will be lost.
  - Added the required column `chapterStart` to the `BibleCitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `BibleCitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `osisId` to the `BibleCitation` table without a default value. This is not possible if the table is not empty.
  - Made the column `edition` on table `VideoSubtitle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BibleCitation" DROP COLUMN "chapEnd",
DROP COLUMN "chapStart",
DROP COLUMN "type",
DROP COLUMN "verseGroupParentId",
ADD COLUMN     "chapterEnd" INTEGER,
ADD COLUMN     "chapterStart" INTEGER NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "osisId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VideoSubtitle" ALTER COLUMN "edition" SET NOT NULL,
ALTER COLUMN "edition" SET DEFAULT 'base',
ALTER COLUMN "vttSrc" DROP NOT NULL,
ALTER COLUMN "srtSrc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VideoVariant" DROP COLUMN "editionId",
ADD COLUMN     "edition" TEXT NOT NULL DEFAULT 'base';

-- DropEnum
DROP TYPE "BibleCitationType";

-- CreateTable
CREATE TABLE "ImportTimes" (
    "modelName" TEXT NOT NULL,
    "lastImport" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportTimes_pkey" PRIMARY KEY ("modelName")
);

-- CreateIndex
CREATE INDEX "VideoVariantDownload_videoVariantId_idx" ON "VideoVariantDownload"("videoVariantId");
