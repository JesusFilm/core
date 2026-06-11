-- AlterTable
ALTER TABLE "Country" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Language_updatedAt_idx" ON "Language"("updatedAt");

-- CreateIndex
CREATE INDEX "Country_updatedAt_idx" ON "Country"("updatedAt");
