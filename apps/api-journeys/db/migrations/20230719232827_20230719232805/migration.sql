/*
  Warnings:

  - The values [guest] on the enum `UserTeamRole` will be removed. If these variants are still used in the database, this will fail.

*/
DELETE FROM "UserTeam" WHERE "role" = 'guest';

-- AlterEnum
BEGIN;
CREATE TYPE "UserTeamRole_new" AS ENUM ('manager', 'member');
ALTER TABLE "UserTeam" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "UserTeam" ALTER COLUMN "role" TYPE "UserTeamRole_new" USING ("role"::text::"UserTeamRole_new");
ALTER TYPE "UserTeamRole" RENAME TO "UserTeamRole_old";
ALTER TYPE "UserTeamRole_new" RENAME TO "UserTeamRole";
DROP TYPE "UserTeamRole_old";
ALTER TABLE "UserTeam" ALTER COLUMN "role" SET DEFAULT 'member';
COMMIT;

-- AlterTable
ALTER TABLE "UserTeam" ALTER COLUMN "role" SET DEFAULT 'member';
