-- Recovered migration. Original directory was a local-only artefact never
-- committed to git; the DB has these indexes applied (verified) and the
-- schema.prisma already declares them. This file restores the migration
-- contents so `prisma migrate dev` does not flag drift.

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Action_journeyId_idx" ON "Action"("journeyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JourneyEventsExportLog_userId_idx" ON "JourneyEventsExportLog"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserInvite_senderId_idx" ON "UserInvite"("senderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserTeamInvite_receipientId_idx" ON "UserTeamInvite"("receipientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserTeamInvite_senderId_idx" ON "UserTeamInvite"("senderId");
