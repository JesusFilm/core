-- AlterTable
ALTER TABLE "CustomDomain" ADD COLUMN     "campaignId" TEXT;

-- CreateIndex
CREATE INDEX "CustomDomain_campaignId_idx" ON "CustomDomain"("campaignId");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
