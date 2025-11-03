/*
  Warnings:

  - You are about to drop the column `accentFont` on the `JourneyTheme` table. All the data in the column will be lost.
  - You are about to drop the column `primaryFont` on the `JourneyTheme` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryFont` on the `JourneyTheme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JourneyTheme" DROP COLUMN "accentFont",
DROP COLUMN "primaryFont",
DROP COLUMN "secondaryFont",
ADD COLUMN     "bodyFont" TEXT,
ADD COLUMN     "headerFont" TEXT,
ADD COLUMN     "labelFont" TEXT;
