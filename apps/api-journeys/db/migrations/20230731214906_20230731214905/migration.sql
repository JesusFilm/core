/*
  Warnings:

  - You are about to drop the column `lastActiveTeam` on the `JourneyProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JourneyProfile" DROP COLUMN "lastActiveTeam",
ADD COLUMN     "lastActiveTeamId" TEXT;
