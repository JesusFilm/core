/*
  Warnings:

  - Added the required column `expiresAt` to the `McpEditHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "McpEditHistory" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
