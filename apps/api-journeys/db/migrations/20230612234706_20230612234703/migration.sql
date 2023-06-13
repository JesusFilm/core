/*
  Warnings:

  - You are about to drop the column `action` on the `Block` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "action",
ADD COLUMN     "actionId" TEXT;

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "parentBlockId" TEXT,
    "gtmEventName" TEXT,
    "blockId" TEXT,
    "journeyId" TEXT,
    "url" TEXT,
    "target" TEXT,
    "email" TEXT,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
