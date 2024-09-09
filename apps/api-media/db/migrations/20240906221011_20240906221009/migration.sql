/*
  Warnings:

  - You are about to drop the `VideoVariantSubtitle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VideoVariantSubtitle" DROP CONSTRAINT "VideoVariantSubtitle_videoVariantId_fkey";

-- DropTable
DROP TABLE "VideoVariantSubtitle";
