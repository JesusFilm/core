/*
  Warnings:

  - You are about to drop the column `channelId` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the `BatchResource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BatchTaskType" AS ENUM ('video_upload', 'caption_processing', 'localization');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_channelId_fkey";

-- DropForeignKey
ALTER TABLE "BatchResource" DROP CONSTRAINT "BatchResource_batchId_fkey";

-- DropForeignKey
ALTER TABLE "BatchResource" DROP CONSTRAINT "BatchResource_resourceId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "channelId",
ADD COLUMN     "completedTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failedTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "BatchResource";

-- CreateTable
CREATE TABLE "BatchTask" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" "BatchTaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BatchTask" ADD CONSTRAINT "BatchTask_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
