-- DropForeignKey
ALTER TABLE "GoogleSheetsSync" DROP CONSTRAINT "GoogleSheetsSync_integrationId_fkey";

-- AlterTable
ALTER TABLE "GoogleSheetsSync" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ALTER COLUMN "integrationId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "GoogleSheetsSync_deletedAt_idx" ON "GoogleSheetsSync"("deletedAt");

-- AddForeignKey
ALTER TABLE "GoogleSheetsSync" ADD CONSTRAINT "GoogleSheetsSync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
