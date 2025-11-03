-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('arclight', 'watch');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "restrictDownloadPlatforms" "Platform"[];
