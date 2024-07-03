/*
  Warnings:

  - Added the required column `videoId` to the `ResourceChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ResourceChannel" ADD COLUMN     "videoId" TEXT NOT NULL;
