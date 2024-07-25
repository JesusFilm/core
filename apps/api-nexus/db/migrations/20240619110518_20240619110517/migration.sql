/*
  Warnings:

  - You are about to drop the `ResourceLocalizationSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceSource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResourceLocalizationSource" DROP CONSTRAINT "ResourceLocalizationSource_reourceLocalizationId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceSource" DROP CONSTRAINT "ResourceSource_resourceId_fkey";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "thumbnailGoogleDriveId" TEXT,
ADD COLUMN     "thumbnailMimeType" TEXT,
ADD COLUMN     "videoGoogleDriveId" TEXT,
ADD COLUMN     "videoMimeType" TEXT;

-- AlterTable
ALTER TABLE "ResourceLocalization" ADD COLUMN     "audioTrackGoogleDriveId" TEXT,
ADD COLUMN     "audioTrackMimeType" TEXT,
ADD COLUMN     "captionGoogleDriveId" TEXT,
ADD COLUMN     "captionMimeType" TEXT;

-- DropTable
DROP TABLE "ResourceLocalizationSource";

-- DropTable
DROP TABLE "ResourceSource";
