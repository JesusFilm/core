-- CreateTable
CREATE TABLE "McpEditNamespace" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "clientId" TEXT,
    "retiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McpEditNamespace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpEditOperation" (
    "id" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "grantVersion" INTEGER NOT NULL,
    "revision" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "resultExpiresAt" TIMESTAMP(3) NOT NULL,
    "result" JSONB,

    CONSTRAINT "McpEditOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpEditHistory" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McpEditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpEditEffect" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "McpEditEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpEditExecution" (
    "id" TEXT NOT NULL,
    "executorId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "operationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "McpEditExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpEditOperation_namespaceId_journeyId_completedAt_idx" ON "McpEditOperation"("namespaceId", "journeyId", "completedAt");

-- CreateIndex
CREATE INDEX "McpEditOperation_resultExpiresAt_idx" ON "McpEditOperation"("resultExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "McpEditOperation_namespaceId_idempotencyKey_key" ON "McpEditOperation"("namespaceId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "McpEditHistory_operationId_key" ON "McpEditHistory"("operationId");

-- CreateIndex
CREATE INDEX "McpEditHistory_namespaceId_journeyId_createdAt_idx" ON "McpEditHistory"("namespaceId", "journeyId", "createdAt");

-- CreateIndex
CREATE INDEX "McpEditEffect_status_createdAt_idx" ON "McpEditEffect"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "McpEditEffect_operationId_kind_key" ON "McpEditEffect"("operationId", "kind");

-- CreateIndex
CREATE INDEX "McpEditExecution_reportedAt_createdAt_idx" ON "McpEditExecution"("reportedAt", "createdAt");

-- CreateIndex
CREATE INDEX "McpEditExecution_connectionId_idx" ON "McpEditExecution"("connectionId");

-- AddForeignKey
ALTER TABLE "McpEditOperation" ADD CONSTRAINT "McpEditOperation_namespaceId_fkey" FOREIGN KEY ("namespaceId") REFERENCES "McpEditNamespace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McpEditHistory" ADD CONSTRAINT "McpEditHistory_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "McpEditOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McpEditEffect" ADD CONSTRAINT "McpEditEffect_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "McpEditOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
