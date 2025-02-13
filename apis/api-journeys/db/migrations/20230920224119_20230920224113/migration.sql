/*
  Warnings:

  - You are about to drop the column `tagIds` on the `Journey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Journey" DROP COLUMN "tagIds";

-- CreateTable
CREATE TABLE "JourneyTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,

    CONSTRAINT "JourneyTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JourneyTag_tagId_idx" ON "JourneyTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyTag_journeyId_tagId_key" ON "JourneyTag"("journeyId", "tagId");

-- AddForeignKey
ALTER TABLE "JourneyTag" ADD CONSTRAINT "JourneyTag_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
