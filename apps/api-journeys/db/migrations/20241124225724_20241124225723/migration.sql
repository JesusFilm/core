-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "toJourneyId" TEXT NOT NULL,
    "toBlockId" TEXT,
    "shortLinkId" TEXT NOT NULL,
    "customDomain" TEXT,
    "color" TEXT DEFAULT '#000000',
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "qrCodeImageBlockId" TEXT,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_qrCodeImageBlockId_key" ON "QrCode"("qrCodeImageBlockId");

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_qrCodeImageBlockId_fkey" FOREIGN KEY ("qrCodeImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
