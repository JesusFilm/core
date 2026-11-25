-- AlterTable
ALTER TABLE "McpMediaJob" ADD COLUMN     "dispatchedAt" TIMESTAMP(3),
ADD COLUMN     "generationPrompt" TEXT;

-- CreateIndex
CREATE INDEX "McpMediaJob_userId_kind_dispatchedAt_idx" ON "McpMediaJob"("userId", "kind", "dispatchedAt");
