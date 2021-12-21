/*
  Warnings:

  - The required column `id` was added to the `UserJourney` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "UserJourney" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserJourney_pkey" PRIMARY KEY ("id");
