-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Integration_userId_idx" ON "Integration"("userId");
