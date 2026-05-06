-- CreateTable
CREATE TABLE "UserDeleteAuditLog" (
    "id" TEXT NOT NULL,
    "deletedUserId" TEXT NOT NULL,
    "deletedUserEmail" TEXT,
    "deletedUserFirstName" TEXT NOT NULL,
    "deletedUserLastName" TEXT,
    "callerUserId" TEXT NOT NULL,
    "callerEmail" TEXT,
    "callerFirstName" TEXT NOT NULL,
    "callerLastName" TEXT,
    "deletedJourneyIds" TEXT[],
    "deletedTeamIds" TEXT[],
    "deletedUserJourneyIds" TEXT[],
    "deletedUserTeamIds" TEXT[],
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDeleteAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDeleteAuditLog_deletedUserId_idx" ON "UserDeleteAuditLog"("deletedUserId");

-- CreateIndex
CREATE INDEX "UserDeleteAuditLog_callerUserId_idx" ON "UserDeleteAuditLog"("callerUserId");

-- CreateIndex
CREATE INDEX "UserDeleteAuditLog_createdAt_idx" ON "UserDeleteAuditLog"("createdAt");
