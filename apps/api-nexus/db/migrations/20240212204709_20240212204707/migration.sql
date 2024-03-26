/*
  Warnings:

  - You are about to drop the `_BatchResources` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BatchResources" DROP CONSTRAINT "_BatchResources_A_fkey";

-- DropForeignKey
ALTER TABLE "_BatchResources" DROP CONSTRAINT "_BatchResources_B_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_BatchResources";

-- CreateTable
CREATE TABLE "BatchResource" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "BatchResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchResource_batchId_resourceId_key" ON "BatchResource"("batchId", "resourceId");

-- AddForeignKey
ALTER TABLE "BatchResource" ADD CONSTRAINT "BatchResource_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchResource" ADD CONSTRAINT "BatchResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
