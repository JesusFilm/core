-- CreateIndex
CREATE INDEX "Event_journeyId_typename_createdAt_idx" ON "Event"("journeyId", "typename", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserJourney_userId_role_journeyId_idx" ON "UserJourney"("userId", "role", "journeyId");

-- CreateIndex
CREATE INDEX "UserTeam_userId_role_teamId_idx" ON "UserTeam"("userId", "role", "teamId");
