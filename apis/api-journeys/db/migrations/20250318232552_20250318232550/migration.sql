-- AlterEnum
ALTER TYPE "TextResponseType" ADD VALUE 'phone';

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "placeholder" TEXT,
ADD COLUMN     "required" BOOLEAN DEFAULT false;
