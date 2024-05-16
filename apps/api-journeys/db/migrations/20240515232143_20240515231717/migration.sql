/*
  Warnings:

  - The values [NavigateToJourneyAction] on the enum `ButtonAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
UPDATE "Event" SET "action" = 'LinkAction' WHERE "action"::TEXT = 'NavigateToJourneyAction';
CREATE TYPE "ButtonAction_new" AS ENUM ('NavigateAction', 'NavigateToBlockAction', 'LinkAction', 'EmailAction');
ALTER TABLE "Event" ALTER COLUMN "action" TYPE "ButtonAction_new" USING ("action"::text::"ButtonAction_new");
ALTER TYPE "ButtonAction" RENAME TO "ButtonAction_old";
ALTER TYPE "ButtonAction_new" RENAME TO "ButtonAction";
DROP TYPE "ButtonAction_old";
COMMIT;
