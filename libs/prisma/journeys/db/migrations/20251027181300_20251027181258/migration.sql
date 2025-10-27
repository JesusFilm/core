-- CreateTable
CREATE TABLE "GoogleSheetsSync" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "folderId" TEXT,
    "appendMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetsSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleSheetsSync_teamId_idx" ON "GoogleSheetsSync"("teamId");

-- CreateIndex
CREATE INDEX "GoogleSheetsSync_journeyId_idx" ON "GoogleSheetsSync"("journeyId");

-- CreateIndex
CREATE INDEX "GoogleSheetsSync_integrationId_idx" ON "GoogleSheetsSync"("integrationId");

-- AddForeignKey
ALTER TABLE "GoogleSheetsSync" ADD CONSTRAINT "GoogleSheetsSync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSheetsSync" ADD CONSTRAINT "GoogleSheetsSync_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSheetsSync" ADD CONSTRAINT "GoogleSheetsSync_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
