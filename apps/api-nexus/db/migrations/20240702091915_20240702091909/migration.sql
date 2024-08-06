/*
  Warnings:

  - You are about to drop the column `thumbnailGoogleDriveId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `videoGoogleDriveId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `audioTrackGoogleDriveId` on the `ResourceLocalization` table. All the data in the column will be lost.
  - You are about to drop the column `captionGoogleDriveId` on the `ResourceLocalization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "thumbnailGoogleDriveId",
DROP COLUMN "videoGoogleDriveId";

-- AlterTable
ALTER TABLE "ResourceLocalization" DROP COLUMN "audioTrackGoogleDriveId",
DROP COLUMN "captionGoogleDriveId";
