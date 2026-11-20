-- CreateTable
CREATE TABLE "PermissionChange" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "intentHash" TEXT NOT NULL,
    "gateIds" TEXT[],
    "gates" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "outcome" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PermissionChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetiredAccount" (
    "userId" TEXT NOT NULL,
    "retiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetiredAccount_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "PermissionChange_status_idx" ON "PermissionChange"("status");
