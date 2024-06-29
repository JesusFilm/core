/*
  Warnings:

  - You are about to drop the column `editionId` on the `VideoVariant` table. All the data in the column will be lost.
  - Made the column `edition` on table `VideoSubtitle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VideoSubtitle" ALTER COLUMN "edition" SET NOT NULL,
ALTER COLUMN "edition" SET DEFAULT 'base',
ALTER COLUMN "vttSrc" DROP NOT NULL,
ALTER COLUMN "srtSrc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VideoVariant" DROP COLUMN "editionId",
ADD COLUMN     "edition" TEXT NOT NULL DEFAULT 'base';
