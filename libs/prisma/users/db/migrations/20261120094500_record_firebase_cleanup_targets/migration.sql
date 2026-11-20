-- AlterTable
ALTER TABLE "UserDeleteAuditLog" ADD COLUMN     "firebaseCleanupUids" TEXT[] DEFAULT ARRAY[]::TEXT[];
