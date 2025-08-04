/*
  Warnings:

  - You are about to drop the column `pollOptionImageId` on the `Block` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_pollOptionImageId_fkey";

-- DropIndex
DROP INDEX "Block_pollOptionImageId_key";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "pollOptionImageId";
