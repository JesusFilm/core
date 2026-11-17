/*
  Warnings:

  - Added the required column `actorCreatedAt` to the `McpPermissionExecution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actorId` to the `McpPermissionExecution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intent` to the `McpPermissionExecution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "McpPermissionExecution" ADD COLUMN     "actorCreatedAt" TEXT NOT NULL,
ADD COLUMN     "actorId" TEXT NOT NULL,
ADD COLUMN     "intent" JSONB NOT NULL;
