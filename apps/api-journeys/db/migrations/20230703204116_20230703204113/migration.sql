-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_parentBlockId_fkey";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
