/*
  Warnings:

  - You are about to drop the column `batchId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `cloudflareId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveLink` on the `Resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_batchId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "batchId",
DROP COLUMN "cloudflareId",
DROP COLUMN "googleDriveLink";

-- CreateTable
CREATE TABLE "_BatchResources" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BatchResources_AB_unique" ON "_BatchResources"("A", "B");

-- CreateIndex
CREATE INDEX "_BatchResources_B_index" ON "_BatchResources"("B");

-- AddForeignKey
ALTER TABLE "_BatchResources" ADD CONSTRAINT "_BatchResources_A_fkey" FOREIGN KEY ("A") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchResources" ADD CONSTRAINT "_BatchResources_B_fkey" FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
