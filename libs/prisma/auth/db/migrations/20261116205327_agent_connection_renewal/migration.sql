-- AlterTable
ALTER TABLE "ConsentReview" ADD COLUMN     "connectionId" TEXT,
ADD COLUMN     "connectionVersion" INTEGER;

-- CreateTable
CREATE TABLE "AgentRenewalReview" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "connectionVersion" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "previewExpiresAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRenewalReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentRenewalReview_validUntil_idx" ON "AgentRenewalReview"("validUntil");
