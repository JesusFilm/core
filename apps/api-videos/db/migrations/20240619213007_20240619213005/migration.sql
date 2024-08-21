/*
  Warnings:

  - You are about to drop the column `alternateNames` on the `BibleBook` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `BibleBook` table. All the data in the column will be lost.
  - Added the required column `order` to the `BibleBook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BibleBook" DROP COLUMN "alternateNames",
DROP COLUMN "orderNumber",
ADD COLUMN     "alternateName" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL;
