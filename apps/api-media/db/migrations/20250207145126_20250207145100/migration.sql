-- CreateEnum
CREATE TYPE "AITranslationSource" AS ENUM ('heygen');

-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "aiTranslationSource" "AITranslationSource";
