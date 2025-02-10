/*
  Warnings:

  - Made the column `name` on table `VideoEdition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `VideoEdition` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VideoEdition" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "videoId" SET NOT NULL;
