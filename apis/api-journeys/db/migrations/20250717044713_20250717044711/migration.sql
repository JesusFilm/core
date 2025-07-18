-- AlterEnum
ALTER TYPE "ButtonAction" ADD VALUE 'PhoneAction';

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "phone" TEXT;
