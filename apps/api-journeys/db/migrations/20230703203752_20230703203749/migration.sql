-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_blockId_fkey";

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
