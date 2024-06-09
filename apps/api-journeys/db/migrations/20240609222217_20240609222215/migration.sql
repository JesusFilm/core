/*
  Warnings:

  - You are about to drop the column `plausibleToken` on the `Journey` table. All the data in the column will be lost.
  - You are about to drop the column `plausibleToken` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Journey" DROP COLUMN "plausibleToken";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "plausibleToken";
