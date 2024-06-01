-- CreateTable
CREATE TABLE "UserJourneyNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserJourneyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserJourneyNotification_userId_idx" ON "UserJourneyNotification"("userId");

-- CreateIndex
CREATE INDEX "UserJourneyNotification_journeyId_idx" ON "UserJourneyNotification"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserJourneyNotification_userId_journeyId_key" ON "UserJourneyNotification"("userId", "journeyId");
