-- CreateEnum
CREATE TYPE "ChatPlatform" AS ENUM ('facebook', 'telegram', 'whatsApp', 'instagram', 'viber', 'vk', 'snapchat', 'skype', 'line', 'tikTok');

-- CreateTable
CREATE TABLE "ChatButton" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "link" TEXT,
    "platform" "ChatPlatform",

    CONSTRAINT "ChatButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatButton_journeyId_idx" ON "ChatButton"("journeyId");
