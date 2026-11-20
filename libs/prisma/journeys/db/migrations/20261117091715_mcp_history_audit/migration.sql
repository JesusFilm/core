-- CreateTable
CREATE TABLE "McpEditAudit" (
    "id" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McpEditAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpEditAudit_namespaceId_journeyId_occurredAt_idx" ON "McpEditAudit"("namespaceId", "journeyId", "occurredAt");

-- CreateIndex
CREATE INDEX "McpEditAudit_expiresAt_idx" ON "McpEditAudit"("expiresAt");
