/*
  Warnings:

  - The values [globe01] on the enum `JourneyMenuButtonIcon` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JourneyMenuButtonIcon_new" AS ENUM ('menu1', 'equals', 'home3', 'home4', 'more', 'ellipsis', 'grid1', 'chevronDown');
ALTER TABLE "Journey" ALTER COLUMN "menuButtonIcon" TYPE "JourneyMenuButtonIcon_new" USING ("menuButtonIcon"::text::"JourneyMenuButtonIcon_new");
ALTER TYPE "JourneyMenuButtonIcon" RENAME TO "JourneyMenuButtonIcon_old";
ALTER TYPE "JourneyMenuButtonIcon_new" RENAME TO "JourneyMenuButtonIcon";
DROP TYPE "JourneyMenuButtonIcon_old";
COMMIT;
