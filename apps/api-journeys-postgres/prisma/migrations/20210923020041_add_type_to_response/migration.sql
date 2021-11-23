/*
  Warnings:

  - Added the required column `type` to the `Response` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('RadioQuestionResponse', 'SignupResponse', 'VideoResponse');

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "type" "ResponseType" NOT NULL;
