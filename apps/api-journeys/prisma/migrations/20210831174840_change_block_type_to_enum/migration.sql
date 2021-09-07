/*
  Warnings:

  - The `blockType` column on the `Block` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('StepBlock', 'VideoBlock', 'RadioQuestionBlock', 'RadioOptionBlock');

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "blockType",
ADD COLUMN     "blockType" "BlockType" NOT NULL DEFAULT E'StepBlock';
