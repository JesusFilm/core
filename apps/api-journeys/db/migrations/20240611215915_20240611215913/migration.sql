-- AlterTable
ALTER TABLE "EventEmailNotifications" ADD COLUMN     "userJourneyId" TEXT,
ADD COLUMN     "userTeamId" TEXT;

-- AddForeignKey
ALTER TABLE "EventEmailNotifications" ADD CONSTRAINT "EventEmailNotifications_userTeamId_fkey" FOREIGN KEY ("userTeamId") REFERENCES "UserTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEmailNotifications" ADD CONSTRAINT "EventEmailNotifications_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;
