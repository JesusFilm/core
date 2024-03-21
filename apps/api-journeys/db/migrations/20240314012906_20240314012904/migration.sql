-- DropForeignKey
ALTER TABLE "JourneyCollectionJourneys" DROP CONSTRAINT "JourneyCollectionJourneys_journeyCollectionId_fkey";

-- DropForeignKey
ALTER TABLE "JourneyCollectionJourneys" DROP CONSTRAINT "JourneyCollectionJourneys_journeyId_fkey";

-- AddForeignKey
ALTER TABLE "JourneyCollectionJourneys" ADD CONSTRAINT "JourneyCollectionJourneys_journeyCollectionId_fkey" FOREIGN KEY ("journeyCollectionId") REFERENCES "JourneyCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollectionJourneys" ADD CONSTRAINT "JourneyCollectionJourneys_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
