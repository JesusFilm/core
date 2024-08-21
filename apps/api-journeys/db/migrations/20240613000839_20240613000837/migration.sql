/*
  Warnings:

  - You are about to drop the `EventEmailNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventEmailNotifications" DROP CONSTRAINT "EventEmailNotifications_userJourneyId_fkey";

-- DropForeignKey
ALTER TABLE "EventEmailNotifications" DROP CONSTRAINT "EventEmailNotifications_userTeamId_fkey";

-- DropTable
DROP TABLE "EventEmailNotifications";

-- CreateTable
CREATE TABLE "JourneyNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userTeamId" TEXT,
    "userJourneyId" TEXT,
    "visitorInteractionEmail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JourneyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotification_userJourneyId_key" ON "JourneyNotification"("userJourneyId");

-- CreateIndex
CREATE INDEX "JourneyNotification_userId_idx" ON "JourneyNotification"("userId");

-- CreateIndex
CREATE INDEX "JourneyNotification_journeyId_idx" ON "JourneyNotification"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotification_userId_journeyId_key" ON "JourneyNotification"("userId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotification_userId_journeyId_userTeamId_key" ON "JourneyNotification"("userId", "journeyId", "userTeamId");

-- AddForeignKey
ALTER TABLE "JourneyNotification" ADD CONSTRAINT "JourneyNotification_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyNotification" ADD CONSTRAINT "JourneyNotification_userTeamId_fkey" FOREIGN KEY ("userTeamId") REFERENCES "UserTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyNotification" ADD CONSTRAINT "JourneyNotification_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;
