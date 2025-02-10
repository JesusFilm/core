-- DropIndex
DROP INDEX "JourneyVisitor_journeyId_visitorId_createdAt_idx";

-- DropIndex
DROP INDEX "Visitor_id_teamId_createdAt_userId_idx";

-- CreateIndex
CREATE INDEX "JourneyVisitor_journeyId_visitorId_createdAt_lastChatStarte_idx" ON "JourneyVisitor"("journeyId", "visitorId", "createdAt", "lastChatStartedAt", "lastRadioQuestion", "lastTextResponse", "activityCount", "duration");

-- CreateIndex
CREATE INDEX "Visitor_id_teamId_createdAt_userId_status_countryCode_idx" ON "Visitor"("id", "teamId", "createdAt", "userId", "status", "countryCode");
