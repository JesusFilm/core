/*
  Warnings:

  - You are about to drop the column `vidoId` on the `Resource` table. All the data in the column will be lost.
  - Added the required column `nexusId` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NexusStatus" AS ENUM ('deleted', 'published');

-- AlterTable
ALTER TABLE "Nexus" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "NexusStatus" NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "vidoId",
ADD COLUMN     "nexusId" TEXT NOT NULL,
ADD COLUMN     "videoId" TEXT,
ALTER COLUMN "refLink" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserNexus" ADD CONSTRAINT "UserNexus_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
