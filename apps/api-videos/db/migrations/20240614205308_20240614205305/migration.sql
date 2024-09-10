/*
  Warnings:

  - You are about to drop the `Edition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subtitle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EditionToSubtitle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VideoVariant" DROP CONSTRAINT "VideoVariant_editionId_fkey";

-- DropForeignKey
ALTER TABLE "_EditionToSubtitle" DROP CONSTRAINT "_EditionToSubtitle_A_fkey";

-- DropForeignKey
ALTER TABLE "_EditionToSubtitle" DROP CONSTRAINT "_EditionToSubtitle_B_fkey";

-- DropTable
DROP TABLE "Edition";

-- DropTable
DROP TABLE "Subtitle";

-- DropTable
DROP TABLE "_EditionToSubtitle";

-- CreateTable
CREATE TABLE "VideoSubtitle" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "edition" TEXT,
    "vttSrc" TEXT NOT NULL,
    "srtSrc" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "VideoSubtitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoSubtitle_languageId_idx" ON "VideoSubtitle"("languageId");

-- CreateIndex
CREATE INDEX "VideoSubtitle_edition_idx" ON "VideoSubtitle"("edition");

-- CreateIndex
CREATE INDEX "VideoSubtitle_primary_idx" ON "VideoSubtitle"("primary");

-- CreateIndex
CREATE INDEX "VideoSubtitle_videoId_idx" ON "VideoSubtitle"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_videoId_edition_languageId_key" ON "VideoSubtitle"("videoId", "edition", "languageId");

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
