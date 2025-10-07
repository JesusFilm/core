-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_journeyVisitorJourneyId_journeyVisitorVisitorId_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_journeyId_visitorId_fkey" FOREIGN KEY ("journeyId", "visitorId") REFERENCES "JourneyVisitor"("journeyId", "visitorId") ON DELETE RESTRICT ON UPDATE CASCADE;
