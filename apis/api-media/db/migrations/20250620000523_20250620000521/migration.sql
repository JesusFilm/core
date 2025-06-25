-- AlterEnum
ALTER TYPE "Platform" ADD VALUE 'journeys';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "restrictViewPlatforms" "Platform"[];
