/*
  Warnings:

  - You are about to drop the column `spokenLanguage` on the `Resource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "spokenLanguage",
ADD COLUMN     "language" TEXT;
