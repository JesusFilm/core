-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('growthSpace');

-- CreateEnum
CREATE TYPE "TextResponseType" AS ENUM ('freeForm', 'name', 'email');

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "routeId" TEXT,
ADD COLUMN     "type" "TextResponseType";

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "accessId" TEXT,
    "accessSecret" TEXT,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_teamId_idx" ON "Integration"("teamId");

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
