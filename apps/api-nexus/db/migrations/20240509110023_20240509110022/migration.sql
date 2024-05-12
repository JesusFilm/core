/*
  Warnings:

  - You are about to drop the column `nexusId` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `nexusId` to the `UserNexus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "nexusId";

-- AlterTable
ALTER TABLE "UserNexus" ADD COLUMN     "nexusId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Nexus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "NexusStatus" NOT NULL DEFAULT 'created',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Nexus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserNexus" ADD CONSTRAINT "UserNexus_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
