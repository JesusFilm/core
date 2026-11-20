-- AlterTable
ALTER TABLE "UserDeleteAuditLog" ADD COLUMN     "retiredFirebaseUids" TEXT[] DEFAULT ARRAY[]::TEXT[];
