-- CreateTable
CREATE TABLE "EventEmailNotifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventEmailNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventEmailNotifications_userId_idx" ON "EventEmailNotifications"("userId");

-- CreateIndex
CREATE INDEX "EventEmailNotifications_journeyId_idx" ON "EventEmailNotifications"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "EventEmailNotifications_userId_journeyId_key" ON "EventEmailNotifications"("userId", "journeyId");
