/*
  Warnings:

  - A unique constraint covering the columns `[pollOptionImageBlockId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "pollOptionImageBlockId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Block_pollOptionImageBlockId_key" ON "Block"("pollOptionImageBlockId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_pollOptionImageBlockId_fkey" FOREIGN KEY ("pollOptionImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
