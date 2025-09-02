/*
  Warnings:

  - A unique constraint covering the columns `[pollOptionImageId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "gridView" BOOLEAN,
ADD COLUMN     "pollOptionImageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Block_pollOptionImageId_key" ON "Block"("pollOptionImageId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_pollOptionImageId_fkey" FOREIGN KEY ("pollOptionImageId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
