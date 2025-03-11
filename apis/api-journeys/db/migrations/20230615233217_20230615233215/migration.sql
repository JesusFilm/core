/*
  Warnings:

  - You are about to drop the column `avatar1Id` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `avatar2Id` on the `Host` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Host" DROP COLUMN "avatar1Id",
DROP COLUMN "avatar2Id";
