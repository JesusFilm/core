-- CreateEnum
CREATE TYPE "MessagePlatform" AS ENUM ('facebook', 'telegram', 'whatsApp', 'instagram', 'viber', 'vk', 'snapchat', 'skype', 'line', 'tikTok');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('star', 'prohibited', 'checkMarkSymbol', 'thumbsUp', 'thumbsDown', 'partyPopper', 'warning', 'robotFace', 'redExclamationMark', 'redQuestionMark');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('console', 'mobile', 'tablet', 'smarttv', 'wearable', 'embedded');

-- CreateEnum
CREATE TYPE "ButtonAction" AS ENUM ('NavigateAction', 'NavigateToBlockAction', 'NavigateToJourneyAction', 'LinkAction');

-- CreateEnum
CREATE TYPE "VideoBlockSource" AS ENUM ('internal', 'youTube');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "typename" TEXT NOT NULL,
    "journeyId" TEXT,
    "blockId" TEXT,
    "stepId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT,
    "value" TEXT,
    "visitorId" TEXT NOT NULL,
    "action" "ButtonAction",
    "actionValue" TEXT,
    "messagePlatform" "MessagePlatform",
    "languageId" TEXT,
    "radioOptionBlockId" TEXT,
    "email" TEXT,
    "nextStepId" TEXT,
    "position" DOUBLE PRECISION,
    "source" "VideoBlockSource",
    "progress" INTEGER,
    "userId" TEXT,
    "journeyVisitorJourneyId" TEXT,
    "journeyVisitorVisitorId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "countryCode" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT,
    "lastChatStartedAt" TIMESTAMP(3),
    "lastChatPlatform" "MessagePlatform",
    "lastStepViewedAt" TIMESTAMP(3),
    "lastLinkAction" TEXT,
    "lastTextResponse" TEXT,
    "lastRadioQuestion" TEXT,
    "lastRadioOptionSubmission" TEXT,
    "messagePlatform" "MessagePlatform",
    "messagePlatformId" TEXT,
    "name" TEXT,
    "notes" TEXT,
    "status" "VisitorStatus",
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" JSONB,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyVisitor" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "countryCode" TEXT,
    "lastChatStartedAt" TIMESTAMP(3),
    "lastChatPlatform" "MessagePlatform",
    "lastStepViewedAt" TIMESTAMP(3),
    "lastLinkAction" TEXT,
    "lastTextResponse" TEXT,
    "lastRadioQuestion" TEXT,
    "lastRadioOptionSubmission" TEXT,
    "activityCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JourneyVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_id_journeyId_visitorId_blockId_userId_idx" ON "Event"("id", "journeyId", "visitorId", "blockId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_createdAt_key" ON "Visitor"("createdAt");

-- CreateIndex
CREATE INDEX "Visitor_id_teamId_createdAt_userId_idx" ON "Visitor"("id", "teamId", "createdAt", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyVisitor_createdAt_key" ON "JourneyVisitor"("createdAt");

-- CreateIndex
CREATE INDEX "JourneyVisitor_journeyId_visitorId_createdAt_idx" ON "JourneyVisitor"("journeyId", "visitorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyVisitor_journeyId_visitorId_key" ON "JourneyVisitor"("journeyId", "visitorId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_journeyVisitorJourneyId_journeyVisitorVisitorId_fkey" FOREIGN KEY ("journeyVisitorJourneyId", "journeyVisitorVisitorId") REFERENCES "JourneyVisitor"("journeyId", "visitorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyVisitor" ADD CONSTRAINT "JourneyVisitor_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
