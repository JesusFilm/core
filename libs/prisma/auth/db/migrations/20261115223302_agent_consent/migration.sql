-- CreateTable
CREATE TABLE "AuthEnvironment" (
    "id" TEXT NOT NULL,
    "binding" TEXT NOT NULL,

    CONSTRAINT "AuthEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthArtifact" (
    "model" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "grantId" TEXT,
    "userCode" TEXT,
    "uid" TEXT,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "OAuthArtifact_pkey" PRIMARY KEY ("model","id")
);

-- CreateTable
CREATE TABLE "AgentConnection" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "journeyIds" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "firebaseAuthTime" INTEGER NOT NULL,
    "firebaseCreatedAt" TEXT NOT NULL,

    CONSTRAINT "AgentConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentReview" (
    "interactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "csrfHash" TEXT NOT NULL,
    "reviewHash" TEXT,
    "mode" TEXT,
    "duration" TEXT,
    "journeyIds" TEXT[],
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "generation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ConsentReview_pkey" PRIMARY KEY ("interactionId")
);

-- CreateTable
CREATE TABLE "AuthorizationGate" (
    "id" TEXT NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 0,
    "open" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AuthorizationGate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAudit" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "journeyIds" TEXT[],

    CONSTRAINT "SecurityAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OAuthArtifact_grantId_idx" ON "OAuthArtifact"("grantId");

-- CreateIndex
CREATE INDEX "OAuthArtifact_model_userCode_idx" ON "OAuthArtifact"("model", "userCode");

-- CreateIndex
CREATE INDEX "OAuthArtifact_model_uid_idx" ON "OAuthArtifact"("model", "uid");

-- CreateIndex
CREATE INDEX "OAuthArtifact_expiresAt_idx" ON "OAuthArtifact"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentConnection_grantId_key" ON "AgentConnection"("grantId");

-- CreateIndex
CREATE INDEX "AgentConnection_userId_clientId_idx" ON "AgentConnection"("userId", "clientId");

-- CreateIndex
CREATE INDEX "AgentConnection_expiresAt_idx" ON "AgentConnection"("expiresAt");

-- CreateIndex
CREATE INDEX "SecurityAudit_expiresAt_idx" ON "SecurityAudit"("expiresAt");
