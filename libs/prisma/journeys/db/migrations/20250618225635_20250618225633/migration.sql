-- CreateTable
CREATE TABLE "JourneyTheme" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryFont" TEXT,
    "secondaryFont" TEXT,
    "accentFont" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JourneyTheme_journeyId_key" ON "JourneyTheme"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyTheme_journeyId_idx" ON "JourneyTheme"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyTheme_userId_idx" ON "JourneyTheme"("userId");

-- AddForeignKey
ALTER TABLE "JourneyTheme" ADD CONSTRAINT "JourneyTheme_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
