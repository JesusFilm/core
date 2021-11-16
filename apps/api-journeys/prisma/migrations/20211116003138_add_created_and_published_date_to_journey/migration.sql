/*
  Warnings:

  - You are about to drop the column `published` on the `Journey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Journey" DROP COLUMN "published",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "publishedAt" TIMESTAMP(3);
