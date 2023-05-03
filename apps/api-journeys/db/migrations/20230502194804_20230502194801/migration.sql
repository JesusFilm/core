/*
  Warnings:

  - The `lastStepViewedAt` column on the `Visitor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `visitorId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_visitorId_fkey";

-- DropIndex
DROP INDEX "Event_id_journeyId_visitorId_blockId_idx";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "visitorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "lastStepViewedAt",
ADD COLUMN     "lastStepViewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Event_id_journeyId_visitorId_blockId_userId_idx" ON "Event"("id", "journeyId", "visitorId", "blockId", "userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
