-- CreateTable
CREATE TABLE "McpMediaMutation" (
    "id" TEXT NOT NULL,
    "intentHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "McpMediaMutation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpMediaMutation_intentHash_status_idx" ON "McpMediaMutation"("intentHash", "status");

-- CreateIndex
CREATE INDEX "McpMediaMutation_reportedAt_idx" ON "McpMediaMutation"("reportedAt");
