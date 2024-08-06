/*
  Warnings:

  - You are about to drop the column `nexusId` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `nexusId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `nexusId` on the `UserNexus` table. All the data in the column will be lost.
  - You are about to drop the `Nexus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_nexusId_fkey";

-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_nexusId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_nexusId_fkey";

-- DropForeignKey
ALTER TABLE "UserNexus" DROP CONSTRAINT "UserNexus_nexusId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "nexusId";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "nexusId";

-- AlterTable
ALTER TABLE "UserNexus" DROP COLUMN "nexusId";

-- DropTable
DROP TABLE "Nexus";
