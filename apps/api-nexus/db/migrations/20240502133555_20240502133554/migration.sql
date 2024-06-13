/*
  Warnings:

  - You are about to drop the column `channelId` on the `Batch` table. All the data in the column will be lost.
  - The `status` column on the `Channel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `sourceType` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the `BatchResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoogleDriveResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Made the column `privacy` on table `Resource` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('published', 'deleted');

-- CreateEnum
CREATE TYPE "BatchTaskStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_channelId_fkey";

-- DropForeignKey
ALTER TABLE "BatchResource" DROP CONSTRAINT "BatchResource_batchId_fkey";

-- DropForeignKey
ALTER TABLE "BatchResource" DROP CONSTRAINT "BatchResource_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleDriveResource" DROP CONSTRAINT "GoogleDriveResource_resourceId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "channelId",
ADD COLUMN     "completedTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failedTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "status",
ADD COLUMN     "status" "ChannelStatus" NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "sourceType",
ADD COLUMN     "customThumbnail" TEXT,
ADD COLUMN     "isMadeForKids" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mediaComponentId" TEXT,
ADD COLUMN     "notifySubscribers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playlistId" TEXT,
ADD COLUMN     "spokenLanguage" TEXT,
ALTER COLUMN "privacy" SET NOT NULL,
ALTER COLUMN "privacy" SET DEFAULT 'private';

-- AlterTable
ALTER TABLE "ResourceLocalization" ADD COLUMN     "audioTrackFile" TEXT,
ADD COLUMN     "captionFile" TEXT,
ADD COLUMN     "videoId" TEXT,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "keywords" DROP NOT NULL;

-- DropTable
DROP TABLE "BatchResource";

-- DropTable
DROP TABLE "GoogleDriveResource";

-- DropTable
DROP TABLE "UserRole";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SourceType";

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
CREATE TABLE "ResourceChannel" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,

    CONSTRAINT "ResourceChannel_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "BatchTask" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "task" JSONB,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "error" TEXT,
    "status" "BatchTaskStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceSource_resourceId_key" ON "ResourceSource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceLocalizationSource_reourceLocalizationId_key" ON "ResourceLocalizationSource"("reourceLocalizationId");

-- AddForeignKey
ALTER TABLE "ResourceSource" ADD CONSTRAINT "ResourceSource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceChannel" ADD CONSTRAINT "ResourceChannel_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceChannel" ADD CONSTRAINT "ResourceChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocalizationSource" ADD CONSTRAINT "ResourceLocalizationSource_reourceLocalizationId_fkey" FOREIGN KEY ("reourceLocalizationId") REFERENCES "ResourceLocalization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTask" ADD CONSTRAINT "BatchTask_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
