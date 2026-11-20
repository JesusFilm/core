-- AlterTable
ALTER TABLE "McpEditExecution" ADD COLUMN     "failureCode" TEXT,
ADD COLUMN     "requestHash" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "responseExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "McpReadExecution" ADD COLUMN     "failureCode" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "responseExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "McpEditExecution_requestId_key" ON "McpEditExecution"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "McpReadExecution_requestId_key" ON "McpReadExecution"("requestId");
