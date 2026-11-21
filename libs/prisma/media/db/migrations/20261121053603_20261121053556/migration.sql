-- CreateTable
CREATE TABLE "McpMediaUser" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "McpMediaUser_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "McpMediaJob" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'waiting_for_file',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferDeadline" TIMESTAMP(3) NOT NULL,
    "transferCompletedAt" TIMESTAMP(3),
    "file" JSONB,
    "receivedBytes" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "providerId" TEXT NOT NULL,
    "dispatchReceiptId" TEXT,
    "completedAt" TIMESTAMP(3),
    "resultExpiresAt" TIMESTAMP(3),
    "privatePurgedAt" TIMESTAMP(3),

    CONSTRAINT "McpMediaJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpMediaChunk" (
    "jobId" TEXT NOT NULL,
    "offset" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,

    CONSTRAINT "McpMediaChunk_pkey" PRIMARY KEY ("jobId","offset")
);

-- CreateTable
CREATE TABLE "McpMediaExecution" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "McpMediaExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McpMediaJob_providerId_key" ON "McpMediaJob"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "McpMediaJob_dispatchReceiptId_key" ON "McpMediaJob"("dispatchReceiptId");

-- CreateIndex
CREATE INDEX "McpMediaJob_userId_active_idx" ON "McpMediaJob"("userId", "active");

-- CreateIndex
CREATE INDEX "McpMediaJob_state_transferDeadline_idx" ON "McpMediaJob"("state", "transferDeadline");

-- CreateIndex
CREATE INDEX "McpMediaJob_resultExpiresAt_idx" ON "McpMediaJob"("resultExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "McpMediaJob_connectionId_key_key" ON "McpMediaJob"("connectionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "McpMediaChunk_objectKey_key" ON "McpMediaChunk"("objectKey");

-- CreateIndex
CREATE INDEX "McpMediaExecution_reportedAt_idx" ON "McpMediaExecution"("reportedAt");

-- AddForeignKey
ALTER TABLE "McpMediaChunk" ADD CONSTRAINT "McpMediaChunk_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "McpMediaJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
