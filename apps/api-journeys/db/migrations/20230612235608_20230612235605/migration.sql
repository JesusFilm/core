/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `actionId` on the `Block` table. All the data in the column will be lost.
  - Made the column `blockId` on table `Action` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_actionId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
DROP COLUMN "id",
ALTER COLUMN "blockId" SET NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("blockId");

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "actionId";

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
