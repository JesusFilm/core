-- CreateTable
CREATE TABLE "McpPermissionExecution" (
    "id" TEXT NOT NULL,
    "gateIds" TEXT[],
    "intentHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "McpPermissionExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpPermissionExecution_reportedAt_id_idx" ON "McpPermissionExecution"("reportedAt", "id");
