-- CreateEnum
CREATE TYPE "ChatPlatform" AS ENUM ('facebook', 'whatsApp', 'viber', 'telegram', 'line', 'vk', 'instagram', 'mail', 'snapchat', 'weChat', 'chat', 'website', 'default');

-- CreateTable
CREATE TABLE "ChatWidgets" (
    "id" TEXT NOT NULL,
    "chatLink" TEXT NOT NULL,
    "chatPlatform" "ChatPlatform" NOT NULL,
    "journeyId" TEXT NOT NULL,

    CONSTRAINT "ChatWidgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatWidgets_journeyId_idx" ON "ChatWidgets"("journeyId");
