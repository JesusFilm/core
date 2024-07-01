/*
  Warnings:

  - You are about to drop the column `completedTasks` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `failedTasks` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `totalTasks` on the `Batch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "completedTasks",
DROP COLUMN "failedTasks",
DROP COLUMN "progress",
DROP COLUMN "totalTasks",
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BatchTask" ALTER COLUMN "updatedAt" DROP NOT NULL;
