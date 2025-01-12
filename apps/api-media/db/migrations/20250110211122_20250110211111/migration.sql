/*
  Warnings:

  - You are about to drop the column `image` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `mobileCinematicHigh` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `mobileCinematicLow` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `mobileCinematicVeryLow` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `videoStill` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "image",
DROP COLUMN "mobileCinematicHigh",
DROP COLUMN "mobileCinematicLow",
DROP COLUMN "mobileCinematicVeryLow",
DROP COLUMN "thumbnail",
DROP COLUMN "videoStill";
