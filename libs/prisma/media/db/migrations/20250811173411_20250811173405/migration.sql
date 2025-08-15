/*
  Warnings:

  - Made the column `videoId` on table `VideoDescription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `VideoImageAlt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `VideoSnippet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `VideoStudyQuestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `VideoTitle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VideoDescription" ADD COLUMN     "crowdInId" TEXT,
ALTER COLUMN "videoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VideoImageAlt" ALTER COLUMN "videoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VideoSnippet" ALTER COLUMN "videoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VideoStudyQuestion" ALTER COLUMN "videoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VideoTitle" ADD COLUMN     "crowdInId" TEXT,
ALTER COLUMN "videoId" SET NOT NULL;
