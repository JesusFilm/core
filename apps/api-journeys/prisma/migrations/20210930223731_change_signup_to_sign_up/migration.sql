/*
  Warnings:

  - The values [SignupBlock] on the enum `BlockType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SignupResponse] on the enum `ResponseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BlockType_new" AS ENUM ('ButtonBlock', 'CardBlock', 'RadioOptionBlock', 'RadioQuestionBlock', 'SignUpBlock', 'StepBlock', 'TypographyBlock', 'VideoBlock');
ALTER TABLE "Block" ALTER COLUMN "blockType" DROP DEFAULT;
ALTER TABLE "Block" ALTER COLUMN "blockType" TYPE "BlockType_new" USING ("blockType"::text::"BlockType_new");
ALTER TYPE "BlockType" RENAME TO "BlockType_old";
ALTER TYPE "BlockType_new" RENAME TO "BlockType";
DROP TYPE "BlockType_old";
ALTER TABLE "Block" ALTER COLUMN "blockType" SET DEFAULT 'StepBlock';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ResponseType_new" AS ENUM ('RadioQuestionResponse', 'SignUpResponse', 'VideoResponse');
ALTER TABLE "Response" ALTER COLUMN "type" TYPE "ResponseType_new" USING ("type"::text::"ResponseType_new");
ALTER TYPE "ResponseType" RENAME TO "ResponseType_old";
ALTER TYPE "ResponseType_new" RENAME TO "ResponseType";
DROP TYPE "ResponseType_old";
COMMIT;
