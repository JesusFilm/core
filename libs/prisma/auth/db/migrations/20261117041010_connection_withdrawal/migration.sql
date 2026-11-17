-- CreateTable
CREATE TABLE "AgentAccessReview" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "connectionVersion" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "journeyIds" TEXT[],
    "validUntil" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "AgentAccessReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionChange" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "expectedVersion" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "journeyIds" TEXT[],
    "gateGeneration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ConnectionChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionHistoryPurge" (
    "connectionId" TEXT NOT NULL,
    "changeId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ConnectionHistoryPurge_pkey" PRIMARY KEY ("connectionId")
);

-- CreateTable
CREATE TABLE "ReadExecutor" (
    "id" TEXT NOT NULL,
    "executor" TEXT NOT NULL,
    "fencedAt" TIMESTAMP(3),

    CONSTRAINT "ReadExecutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentAccessReview_validUntil_idx" ON "AgentAccessReview"("validUntil");

-- CreateIndex
CREATE INDEX "ConnectionChange_status_idx" ON "ConnectionChange"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionChange_connectionId_expectedVersion_key" ON "ConnectionChange"("connectionId", "expectedVersion");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionHistoryPurge_changeId_key" ON "ConnectionHistoryPurge"("changeId");
