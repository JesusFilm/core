-- AlterEnum
ALTER TYPE "ButtonAction" ADD VALUE 'ChatAction';

-- AlterTable
ALTER TABLE "Action" ADD COLUMN "chatUrl" TEXT;
