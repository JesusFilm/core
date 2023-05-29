/*
  Warnings:

  - You are about to drop the column `lastEmailAction` on the `JourneyVisitor` table. All the data in the column will be lost.
  - You are about to drop the column `lastEmailAction` on the `Visitor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JourneyVisitor" DROP COLUMN "lastEmailAction";

-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "lastEmailAction";
