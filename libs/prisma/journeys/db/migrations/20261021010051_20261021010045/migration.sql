-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_toJourneyId_fkey" FOREIGN KEY ("toJourneyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
