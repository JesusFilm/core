-- AddForeignKey
ALTER TABLE "JourneyVisitor" ADD CONSTRAINT "JourneyVisitor_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
