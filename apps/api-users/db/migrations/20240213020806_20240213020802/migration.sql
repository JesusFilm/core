/*
  Warnings:

  - You are about to drop the column `emailPreferencesId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EmailPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_emailPreferencesId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailPreferencesId";

-- DropTable
DROP TABLE "EmailPreferences";
