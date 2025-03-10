-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "toJourneyId" TEXT NOT NULL,
    "toBlockId" TEXT,
    "shortLinkId" TEXT NOT NULL,
    "color" TEXT DEFAULT '#000000',
    "backgroundColor" TEXT DEFAULT '#FFFFFF',

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
