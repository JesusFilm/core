/*
  Warnings:

  - You are about to drop the `Nexus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserNexus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserNexus" DROP CONSTRAINT "UserNexus_nexusId_fkey";

-- DropTable
DROP TABLE "Nexus";

-- DropTable
DROP TABLE "UserNexus";

-- DropEnum
DROP TYPE "NexusStatus";
