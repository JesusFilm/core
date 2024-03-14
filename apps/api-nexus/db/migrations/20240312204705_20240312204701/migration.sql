/*
  Warnings:

  - You are about to drop the column `mimeType` on the `LocalizedResourceFile` table. All the data in the column will be lost.
  - Added the required column `audioMimeType` to the `LocalizedResourceFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `captionMimeType` to the `LocalizedResourceFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoogleDriveResource" ADD COLUMN     "cloudFlareId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "LocalizedResourceFile" DROP COLUMN "mimeType",
ADD COLUMN     "audioFileCloudFlareId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "audioMimeType" TEXT NOT NULL,
ADD COLUMN     "captionFileCloudFlareId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "captionMimeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ThumbnailGoogleDriveResource" ADD COLUMN     "cloudFlareId" TEXT NOT NULL DEFAULT '';
