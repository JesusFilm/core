-- Per NES-1556: bound the ACCESS EXCLUSIVE lock so the migration aborts cleanly
-- under load instead of queueing behind long selects/writes on the Block table.
SET LOCAL lock_timeout = '3s';

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "expandChatByDefault" BOOLEAN,
ADD COLUMN     "showAssistant" BOOLEAN;
