-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused', 'error', 'warning', 'scheduled');

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_resourceId_key" ON "Batch"("resourceId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
