-- CreateEnum
CREATE TYPE "Service" AS ENUM ('journeys', 'watch');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "service" "Service";
