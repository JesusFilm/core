/*
  Warnings:

  - You are about to drop the column `block_type` on the `Block` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "block_type",
ADD COLUMN     "blockType" TEXT NOT NULL DEFAULT E'StepBlock';
