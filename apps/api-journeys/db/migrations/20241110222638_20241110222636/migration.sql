-- CreateIndex
CREATE INDEX "Event_journeyId_visitorId_typename_createdAt_idx" ON "Event"("journeyId", "visitorId", "typename", "createdAt" DESC);
