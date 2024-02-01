-- CreateEnum
CREATE TYPE "ChatButtonType" AS ENUM ('link', 'code');

-- AlterTable
ALTER TABLE "ChatButton" ADD COLUMN     "code" TEXT,
ADD COLUMN     "type" "ChatButtonType" DEFAULT 'link';
