/*
  Warnings:

  - You are about to drop the column `audioTrackGoogleDriveRefreshToken` on the `ResourceLocalizationSource` table. All the data in the column will be lost.
  - You are about to drop the column `captionGoogleDriveRefreshToken` on the `ResourceLocalizationSource` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailGoogleDriveRefreshToken` on the `ResourceSource` table. All the data in the column will be lost.
  - You are about to drop the column `videoGoogleDriveRefreshToken` on the `ResourceSource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResourceLocalizationSource" DROP COLUMN "audioTrackGoogleDriveRefreshToken",
DROP COLUMN "captionGoogleDriveRefreshToken";

-- AlterTable
ALTER TABLE "ResourceSource" DROP COLUMN "thumbnailGoogleDriveRefreshToken",
DROP COLUMN "videoGoogleDriveRefreshToken";
