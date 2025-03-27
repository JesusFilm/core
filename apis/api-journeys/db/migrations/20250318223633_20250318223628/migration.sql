-- CreateTable
CREATE TABLE "JourneyEventsExportLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "eventsFilter" TEXT[],
    "dateRangeStart" TIMESTAMP(3),
    "dateRangeEnd" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyEventsExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JourneyEventsExportLog_journeyId_idx" ON "JourneyEventsExportLog"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyEventsExportLog_createdAt_idx" ON "JourneyEventsExportLog"("createdAt");

-- AddForeignKey
ALTER TABLE "JourneyEventsExportLog" ADD CONSTRAINT "JourneyEventsExportLog_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
