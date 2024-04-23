/*
  Warnings:

  - You are about to drop the column `seoTitle` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "seoTitle";

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

-- CreateTable
CREATE TABLE "VideoImageAlt" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoImageAlt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoStudyQuestion" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoStudyQuestion_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "VideoImageAlt_value_idx" ON "VideoImageAlt"("value");

-- CreateIndex
CREATE INDEX "VideoImageAlt_primary_idx" ON "VideoImageAlt"("primary");

-- CreateIndex
CREATE INDEX "VideoImageAlt_languageId_idx" ON "VideoImageAlt"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoImageAlt_videoId_languageId_key" ON "VideoImageAlt"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_value_idx" ON "VideoStudyQuestion"("value");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_primary_idx" ON "VideoStudyQuestion"("primary");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_languageId_idx" ON "VideoStudyQuestion"("languageId");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_order_idx" ON "VideoStudyQuestion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "VideoStudyQuestion_videoId_languageId_order_key" ON "VideoStudyQuestion"("videoId", "languageId", "order");

-- AddForeignKey
ALTER TABLE "VideoSnippet" ADD CONSTRAINT "VideoSnippet_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDescription" ADD CONSTRAINT "VideoDescription_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoImageAlt" ADD CONSTRAINT "VideoImageAlt_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoStudyQuestion" ADD CONSTRAINT "VideoStudyQuestion_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
