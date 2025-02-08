/*
  Warnings:

  - You are about to drop the column `apiToken` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `formSlug` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingFormCompletedAt` on the `JourneyProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "apiToken",
DROP COLUMN "formSlug",
DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "JourneyProfile" DROP COLUMN "onboardingFormCompletedAt";
