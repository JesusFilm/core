/*
  Warnings:

  - A unique constraint covering the columns `[creatorImageBlockId]` on the table `Journey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "creatorDescription" TEXT,
ADD COLUMN     "creatorImageBlockId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Journey_creatorImageBlockId_key" ON "Journey"("creatorImageBlockId");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_creatorImageBlockId_fkey" FOREIGN KEY ("creatorImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
