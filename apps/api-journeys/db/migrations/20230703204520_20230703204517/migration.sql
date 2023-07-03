-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_journeyId_fkey";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
