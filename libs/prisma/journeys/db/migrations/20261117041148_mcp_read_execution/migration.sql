-- CreateTable
CREATE TABLE "McpReadExecution" (
    "id" TEXT NOT NULL,
    "executorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "McpReadExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpReadExecution_reportedAt_createdAt_idx" ON "McpReadExecution"("reportedAt", "createdAt");
