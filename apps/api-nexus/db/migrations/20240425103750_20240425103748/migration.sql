/*
  Warnings:

  - You are about to drop the column `metadata` on the `BatchTask` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `BatchTask` table. All the data in the column will be lost.
  - You are about to drop the column `sourceType` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the `GoogleDriveResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocalizedResourceFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThumbnailGoogleDriveResource` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `BatchTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `BatchTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `privacy` on table `Resource` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BatchTaskStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "GoogleDriveResource" DROP CONSTRAINT "GoogleDriveResource_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "LocalizedResourceFile" DROP CONSTRAINT "LocalizedResourceFile_localizationId_fkey";

-- DropForeignKey
ALTER TABLE "ThumbnailGoogleDriveResource" DROP CONSTRAINT "ThumbnailGoogleDriveResource_resourceId_fkey";

-- AlterTable
ALTER TABLE "BatchTask" DROP COLUMN "metadata",
DROP COLUMN "resourceId",
ADD COLUMN     "task" JSONB,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BatchTaskStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "sourceType",
ALTER COLUMN "privacy" SET NOT NULL,
ALTER COLUMN "privacy" SET DEFAULT 'private';

-- DropTable
DROP TABLE "GoogleDriveResource";

-- DropTable
DROP TABLE "LocalizedResourceFile";

-- DropTable
DROP TABLE "ThumbnailGoogleDriveResource";

-- DropEnum
DROP TYPE "BatchTaskType";

-- DropEnum
DROP TYPE "SourceType";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "ResourceSource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "videoGoogleDriveId" TEXT,
    "videoGoogleDriveRefreshToken" TEXT,
    "videoCloudFlareId" TEXT,
    "videoMimeType" TEXT,
    "thumbnailGoogleDriveId" TEXT,
    "thumbnailGoogleDriveRefreshToken" TEXT,
    "thumbnailCloudFlareId" TEXT,
    "thumbnailMimeType" TEXT,

    CONSTRAINT "ResourceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceLocalizationSource" (
    "id" TEXT NOT NULL,
    "reourceLocalizationId" TEXT NOT NULL,
    "captionGoogleDriveId" TEXT,
    "captionGoogleDriveRefreshToken" TEXT,
    "captionCloudFlareId" TEXT,
    "captionMimeType" TEXT,
    "audioTrackGoogleDriveId" TEXT,
    "audioTrackGoogleDriveRefreshToken" TEXT,
    "audioTrackCloudFlareId" TEXT,
    "audioMimeType" TEXT,

    CONSTRAINT "ResourceLocalizationSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceSource_resourceId_key" ON "ResourceSource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceLocalizationSource_reourceLocalizationId_key" ON "ResourceLocalizationSource"("reourceLocalizationId");

-- AddForeignKey
ALTER TABLE "ResourceSource" ADD CONSTRAINT "ResourceSource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocalizationSource" ADD CONSTRAINT "ResourceLocalizationSource_reourceLocalizationId_fkey" FOREIGN KEY ("reourceLocalizationId") REFERENCES "ResourceLocalization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
