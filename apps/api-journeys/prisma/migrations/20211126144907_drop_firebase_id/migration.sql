/*
  Warnings:

  - You are about to drop the column `firebaseId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User.firebaseId_unique";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firebaseId";
