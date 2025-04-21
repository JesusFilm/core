-- AlterEnum
ALTER TYPE "ButtonAction" ADD VALUE 'ChatAction';

-- AlterTable
ALTER TABLE "JourneyVisitor" ADD COLUMN     "lastChatAction" TEXT;

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "lastChatAction" TEXT;
