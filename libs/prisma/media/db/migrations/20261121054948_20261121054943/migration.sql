-- AlterTable
ALTER TABLE "McpMediaChunk" ADD COLUMN     "executionId" TEXT,
ADD COLUMN     "stored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "McpMediaExecution" ADD COLUMN     "staging" JSONB;
