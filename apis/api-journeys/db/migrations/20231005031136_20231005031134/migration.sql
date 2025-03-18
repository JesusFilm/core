/*
  Warnings:

  - You are about to drop the column `formFilledAt` on the `JourneyProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JourneyProfile" DROP COLUMN "formFilledAt",
ADD COLUMN     "onboardingFormCompletedAt" TIMESTAMP(3);
