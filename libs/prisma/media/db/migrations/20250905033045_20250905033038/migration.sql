/*
  Warnings:

  - A unique constraint covering the columns `[playlistId,order]` on the table `PlaylistItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PlaylistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PlaylistItem_playlistId_videoVariantId_key";

-- AlterTable
ALTER TABLE "PlaylistItem" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_playlistId_order_key" ON "PlaylistItem"("playlistId", "order");
