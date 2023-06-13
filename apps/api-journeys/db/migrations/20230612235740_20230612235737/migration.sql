/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_blockId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "blockId" DROP NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_id_fkey" FOREIGN KEY ("id") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
