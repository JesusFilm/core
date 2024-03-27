/*
  Warnings:

  - You are about to drop the column `channelId` on the `Batch` table. All the data in the column will be lost.
  - The `status` column on the `Channel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BatchResource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('deleted', 'published');

-- CreateEnum
CREATE TYPE "BatchTaskType" AS ENUM ('video_upload', 'caption_processing', 'localization');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_channelId_fkey";

-- DropForeignKey
ALTER TABLE "BatchResource" DROP CONSTRAINT "BatchResource_batchId_fkey";

-- DropForeignKey
ALTER TABLE "BatchResource" DROP CONSTRAINT "BatchResource_resourceId_fkey";

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
ALTER TABLE "GoogleDriveResource" ADD COLUMN     "cloudFlareId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "customThumbnail" TEXT,
ADD COLUMN     "isMadeForKids" TEXT,
ADD COLUMN     "mediaComponentId" TEXT,
ADD COLUMN     "notifySubscribers" TEXT,
ADD COLUMN     "playlistId" TEXT,
ADD COLUMN     "spokenLanguage" TEXT;

-- AlterTable
ALTER TABLE "ResourceLocalization" ADD COLUMN     "audioTrackFile" TEXT,
ADD COLUMN     "captionFile" TEXT,
ADD COLUMN     "videoId" TEXT,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "keywords" DROP NOT NULL;

-- DropTable
DROP TABLE "BatchResource";

-- CreateTable
CREATE TABLE "ResourceYoutubeChannel" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,

    CONSTRAINT "ResourceYoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThumbnailGoogleDriveResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "cloudFlareId" TEXT NOT NULL DEFAULT '',
    "mimeType" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "ThumbnailGoogleDriveResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalizedResourceFile" (
    "id" TEXT NOT NULL,
    "localizationId" TEXT NOT NULL,
    "captionDriveId" TEXT NOT NULL,
    "captionFileCloudFlareId" TEXT NOT NULL DEFAULT '',
    "audioDriveId" TEXT NOT NULL,
    "audioFileCloudFlareId" TEXT NOT NULL DEFAULT '',
    "captionMimeType" TEXT NOT NULL,
    "audioMimeType" TEXT NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "LocalizedResourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchTask" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" "BatchTaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThumbnailGoogleDriveResource_resourceId_key" ON "ThumbnailGoogleDriveResource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "LocalizedResourceFile_localizationId_key" ON "LocalizedResourceFile"("localizationId");

-- AddForeignKey
ALTER TABLE "ResourceYoutubeChannel" ADD CONSTRAINT "ResourceYoutubeChannel_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceYoutubeChannel" ADD CONSTRAINT "ResourceYoutubeChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThumbnailGoogleDriveResource" ADD CONSTRAINT "ThumbnailGoogleDriveResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalizedResourceFile" ADD CONSTRAINT "LocalizedResourceFile_localizationId_fkey" FOREIGN KEY ("localizationId") REFERENCES "ResourceLocalization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTask" ADD CONSTRAINT "BatchTask_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
