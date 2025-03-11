/*
  Warnings:

  - You are about to drop the column `prevStepId` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "prevStepId",
ADD COLUMN     "previousStepId" TEXT;
