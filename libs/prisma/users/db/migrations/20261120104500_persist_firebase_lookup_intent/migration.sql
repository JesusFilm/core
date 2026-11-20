-- AlterTable
ALTER TABLE "UserDeleteAuditLog" ADD COLUMN     "firebaseCleanupEmail" TEXT,
ADD COLUMN     "firebaseEmailLookupPending" BOOLEAN NOT NULL DEFAULT false;
