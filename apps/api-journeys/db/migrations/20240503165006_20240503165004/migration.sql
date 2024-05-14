/*
  Warnings:

  - The `platform` column on the `ChatButton` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable

ALTER TABLE "ChatButton" ALTER COLUMN "platform" TYPE "MessagePlatform" USING platform::text::"MessagePlatform";

-- DropEnum
DROP TYPE "ChatPlatform";