-- CreateEnum
CREATE TYPE "ThemeName" AS ENUM ('default');

-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "theme" "ThemeName" NOT NULL DEFAULT E'default';
