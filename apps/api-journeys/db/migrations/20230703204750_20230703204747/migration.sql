-- DropForeignKey
ALTER TABLE "ChatButton" DROP CONSTRAINT "ChatButton_journeyId_fkey";

-- AddForeignKey
ALTER TABLE "ChatButton" ADD CONSTRAINT "ChatButton_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
