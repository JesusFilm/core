-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_journeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JourneyEventsExportLog" DROP CONSTRAINT "JourneyEventsExportLog_journeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JourneyTag" DROP CONSTRAINT "JourneyTag_journeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QrCode" DROP CONSTRAINT "QrCode_journeyId_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyTag" ADD CONSTRAINT "JourneyTag_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEventsExportLog" ADD CONSTRAINT "JourneyEventsExportLog_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
