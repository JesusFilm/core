-- DropIndex
DROP INDEX "Event_id_journeyId_visitorId_blockId_userId_idx";

-- DropIndex
DROP INDEX "JourneyVisitor_journeyId_visitorId_createdAt_lastChatStarte_idx";

-- DropIndex
DROP INDEX "UserInvite_journeyId_email_idx";

-- DropIndex
DROP INDEX "Visitor_id_teamId_createdAt_userId_status_countryCode_idx";

-- CreateIndex
CREATE INDEX "Action_parentBlockId_idx" ON "Action"("parentBlockId");

-- CreateIndex
CREATE INDEX "Block_journeyId_idx" ON "Block"("journeyId");

-- CreateIndex
CREATE INDEX "Block_parentOrder_idx" ON "Block"("parentOrder" ASC);

-- CreateIndex
CREATE INDEX "Block_typename_idx" ON "Block"("typename");

-- CreateIndex
CREATE INDEX "Event_journeyId_idx" ON "Event"("journeyId");

-- CreateIndex
CREATE INDEX "Event_visitorId_idx" ON "Event"("visitorId");

-- CreateIndex
CREATE INDEX "Event_blockId_idx" ON "Event"("blockId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Host_teamId_idx" ON "Host"("teamId");

-- CreateIndex
CREATE INDEX "JourneyProfile_userId_idx" ON "JourneyProfile"("userId");

-- CreateIndex
CREATE INDEX "JourneyVisitor_createdAt_idx" ON "JourneyVisitor"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "JourneyVisitor_journeyId_idx" ON "JourneyVisitor"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyVisitor_visitorId_idx" ON "JourneyVisitor"("visitorId");

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastChatStartedAt_idx" ON "JourneyVisitor"("lastChatStartedAt");

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastRadioQuestion_idx" ON "JourneyVisitor"("lastRadioQuestion");

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastTextResponse_idx" ON "JourneyVisitor"("lastTextResponse");

-- CreateIndex
CREATE INDEX "JourneyVisitor_activityCount_idx" ON "JourneyVisitor"("activityCount" DESC);

-- CreateIndex
CREATE INDEX "JourneyVisitor_duration_idx" ON "JourneyVisitor"("duration" DESC);

-- CreateIndex
CREATE INDEX "UserInvite_email_acceptedAt_removedAt_idx" ON "UserInvite"("email", "acceptedAt", "removedAt");

-- CreateIndex
CREATE INDEX "UserJourney_journeyId_idx" ON "UserJourney"("journeyId");

-- CreateIndex
CREATE INDEX "UserJourney_role_idx" ON "UserJourney"("role");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserTeam_role_idx" ON "UserTeam"("role");

-- CreateIndex
CREATE INDEX "UserTeam_teamId_idx" ON "UserTeam"("teamId");

-- CreateIndex
CREATE INDEX "UserTeamInvite_email_acceptedAt_removedAt_idx" ON "UserTeamInvite"("email", "acceptedAt", "removedAt");

-- CreateIndex
CREATE INDEX "UserTeamInvite_teamId_idx" ON "UserTeamInvite"("teamId");

-- CreateIndex
CREATE INDEX "Visitor_teamId_idx" ON "Visitor"("teamId");

-- CreateIndex
CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Visitor_userId_idx" ON "Visitor"("userId");

-- CreateIndex
CREATE INDEX "Visitor_status_idx" ON "Visitor"("status");

-- CreateIndex
CREATE INDEX "Visitor_countryCode_idx" ON "Visitor"("countryCode");
