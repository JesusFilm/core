-- CreateEnum
CREATE TYPE "Services" AS ENUM ('nextSteps', 'watch', 'app', 'partners');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "services" "Services"[] DEFAULT ARRAY['nextSteps', 'watch', 'app', 'partners']::"Services"[];
