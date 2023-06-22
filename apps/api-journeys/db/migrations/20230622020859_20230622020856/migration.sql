/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Team` table. All the data in the column will be lost.
  - Made the column `parentBlockId` on table `Action` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_id_fkey";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
DROP COLUMN "id",
ALTER COLUMN "parentBlockId" SET NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("parentBlockId");

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "contactEmail";

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
