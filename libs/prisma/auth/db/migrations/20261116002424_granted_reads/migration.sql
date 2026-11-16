-- CreateTable
CREATE TABLE "ReadPermit" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "grantVersion" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "executor" TEXT NOT NULL,
    "executorId" TEXT NOT NULL,
    "journeyIds" TEXT[],
    "gates" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "preparedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "outputHash" TEXT,

    CONSTRAINT "ReadPermit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadPermit_connectionId_status_idx" ON "ReadPermit"("connectionId", "status");

-- CreateIndex
CREATE INDEX "ReadPermit_requestId_stage_idx" ON "ReadPermit"("requestId", "stage");

-- CreateIndex
CREATE INDEX "ReadPermit_status_settledAt_idx" ON "ReadPermit"("status", "settledAt");

-- CreateIndex
CREATE INDEX "ReadPermit_status_preparedAt_idx" ON "ReadPermit"("status", "preparedAt");
