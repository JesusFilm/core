/*
  Warnings:

  - You are about to drop the column `completedTasks` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `failedTasks` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `totalTasks` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `task` on the `BatchTask` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `ResourceChannel` table. All the data in the column will be lost.
  - Added the required column `youtubeVideoId` to the `ResourceChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "completedTasks",
DROP COLUMN "failedTasks",
DROP COLUMN "progress",
DROP COLUMN "totalTasks";

-- AlterTable
ALTER TABLE "BatchTask" DROP COLUMN "task",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "resourceId" TEXT;

-- AlterTable
ALTER TABLE "ResourceChannel" DROP COLUMN "videoId",
ADD COLUMN     "youtubeVideoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BatchTask" ADD CONSTRAINT "BatchTask_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTask" ADD CONSTRAINT "BatchTask_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
