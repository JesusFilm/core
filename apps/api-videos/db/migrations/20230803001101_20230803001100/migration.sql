/*
  Warnings:

  - You are about to drop the column `subtitle` on the `VideoVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VideoVariant" DROP COLUMN "subtitle";

-- CreateTable
CREATE TABLE "VideoVariantSubtitle" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "languageId" TEXT NOT NULL,
    "videoVariantId" TEXT NOT NULL,

    CONSTRAINT "VideoVariantSubtitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantSubtitle_videoVariantId_languageId_key" ON "VideoVariantSubtitle"("videoVariantId", "languageId");

-- AddForeignKey
ALTER TABLE "VideoVariantSubtitle" ADD CONSTRAINT "VideoVariantSubtitle_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
