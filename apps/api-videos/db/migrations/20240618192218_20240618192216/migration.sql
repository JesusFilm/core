/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VideoKeyword` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Keyword" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "VideoKeyword" DROP COLUMN "updatedAt";
