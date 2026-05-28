-- AlterTable
ALTER TABLE "UserDeleteAuditLog"
ADD COLUMN "deletedUserFirebaseUid" TEXT,
ADD COLUMN "completedAt" TIMESTAMP(3);
