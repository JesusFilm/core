-- AlterTable
ALTER TABLE "UserDeleteAuditLog"
DROP COLUMN "deletedUserEmail",
DROP COLUMN "deletedUserFirstName",
DROP COLUMN "deletedUserLastName",
DROP COLUMN "callerFirstName",
DROP COLUMN "callerLastName";
