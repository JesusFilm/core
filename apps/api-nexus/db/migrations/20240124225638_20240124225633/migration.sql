/*
  Warnings:

  - You are about to drop the column `resourceId` on the `Batch` table. All the data in the column will be lost.
  - Added the required column `nexusId` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_resourceId_fkey";

-- DropIndex
DROP INDEX "Batch_resourceId_key";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "resourceId",
ADD COLUMN     "nexusId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "batchId" TEXT;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
