/*
  Warnings:

  - You are about to drop the `CaptionGoogleDriveResource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CaptionGoogleDriveResource" DROP CONSTRAINT "CaptionGoogleDriveResource_resourceId_fkey";

-- DropTable
DROP TABLE "CaptionGoogleDriveResource";
