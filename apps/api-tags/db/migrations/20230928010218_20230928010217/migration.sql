-- CreateEnum
CREATE TYPE "Service" AS ENUM ('apiJourneys', 'apiLanguages', 'apiMedia', 'apiTags', 'apiUsers', 'apiVideos');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "service" "Service";
