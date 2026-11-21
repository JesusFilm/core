-- CreateTable
CREATE TABLE "McpMediaCancellation" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "outcome" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "resultExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McpMediaCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpMediaCancellation_resultExpiresAt_idx" ON "McpMediaCancellation"("resultExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "McpMediaCancellation_connectionId_key_key" ON "McpMediaCancellation"("connectionId", "key");
