-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('draft', 'published');

-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "status" "JourneyStatus" NOT NULL DEFAULT E'draft';
