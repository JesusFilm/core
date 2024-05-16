/*
  Warnings:

  - The values [published] on the enum `NexusStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('publisher');

-- AlterEnum
ALTER TYPE "ChannelStatus" ADD VALUE 'created';

-- AlterEnum
BEGIN;
CREATE TYPE "NexusStatus_new" AS ENUM ('created', 'deleted');
ALTER TABLE "Nexus" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Nexus" ALTER COLUMN "status" TYPE "NexusStatus_new" USING ("status"::text::"NexusStatus_new");
ALTER TYPE "NexusStatus" RENAME TO "NexusStatus_old";
ALTER TYPE "NexusStatus_new" RENAME TO "NexusStatus";
DROP TYPE "NexusStatus_old";
ALTER TABLE "Nexus" ALTER COLUMN "status" SET DEFAULT 'created';
COMMIT;

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_nexusId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelYoutube" DROP CONSTRAINT "ChannelYoutube_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceChannel" DROP CONSTRAINT "ResourceChannel_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceChannel" DROP CONSTRAINT "ResourceChannel_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceLocalization" DROP CONSTRAINT "ResourceLocalization_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceLocalizationSource" DROP CONSTRAINT "ResourceLocalizationSource_reourceLocalizationId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceSource" DROP CONSTRAINT "ResourceSource_resourceId_fkey";

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "status" SET DEFAULT 'created';

-- AlterTable
ALTER TABLE "Nexus" ALTER COLUMN "status" SET DEFAULT 'created';

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "Role"[],

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_key" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- AddForeignKey
ALTER TABLE "ChannelYoutube" ADD CONSTRAINT "ChannelYoutube_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceSource" ADD CONSTRAINT "ResourceSource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceChannel" ADD CONSTRAINT "ResourceChannel_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceChannel" ADD CONSTRAINT "ResourceChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocalization" ADD CONSTRAINT "ResourceLocalization_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocalizationSource" ADD CONSTRAINT "ResourceLocalizationSource_reourceLocalizationId_fkey" FOREIGN KEY ("reourceLocalizationId") REFERENCES "ResourceLocalization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
