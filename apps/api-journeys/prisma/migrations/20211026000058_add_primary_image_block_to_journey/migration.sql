/*
  Warnings:

  - A unique constraint covering the columns `[primaryImageBlockId]` on the table `Journey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "description" TEXT,
ADD COLUMN     "primaryImageBlockId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Journey_primaryImageBlockId_unique" ON "Journey"("primaryImageBlockId");

-- AddForeignKey
ALTER TABLE "Journey" ADD FOREIGN KEY ("primaryImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
