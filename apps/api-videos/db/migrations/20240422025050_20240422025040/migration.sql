/*
  Warnings:

  - You are about to drop the column `description` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `snippet` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "description",
DROP COLUMN "seoTitle",
DROP COLUMN "snippet";

-- CreateTable
CREATE TABLE "VideoSnippet" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoDescription" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoDescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoSnippet_value_idx" ON "VideoSnippet"("value");

-- CreateIndex
CREATE INDEX "VideoSnippet_primary_idx" ON "VideoSnippet"("primary");

-- CreateIndex
CREATE INDEX "VideoSnippet_languageId_idx" ON "VideoSnippet"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSnippet_videoId_languageId_key" ON "VideoSnippet"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "VideoDescription_value_idx" ON "VideoDescription"("value");

-- CreateIndex
CREATE INDEX "VideoDescription_primary_idx" ON "VideoDescription"("primary");

-- CreateIndex
CREATE INDEX "VideoDescription_languageId_idx" ON "VideoDescription"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoDescription_videoId_languageId_key" ON "VideoDescription"("videoId", "languageId");

-- AddForeignKey
ALTER TABLE "VideoSnippet" ADD CONSTRAINT "VideoSnippet_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDescription" ADD CONSTRAINT "VideoDescription_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
