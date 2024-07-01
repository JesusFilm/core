/*
  Warnings:

  - You are about to drop the column `youtubeId` on the `ResourceChannel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Batch" ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ResourceChannel" DROP COLUMN "youtubeId";
