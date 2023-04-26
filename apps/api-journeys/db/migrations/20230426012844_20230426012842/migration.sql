-- CreateEnum
CREATE TYPE "MessagePlatform" AS ENUM ('facebook', 'telegram', 'whatsApp', 'instagram', 'viber', 'vk', 'snapchat', 'skype', 'line', 'tikTok');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('star', 'prohibited', 'checkMarkSymbol', 'thumbsUp', 'thumbsDown', 'partyPopper', 'warning', 'robotFace', 'redExclamationMark', 'redQuestionMark');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('console', 'mobile', 'tablet', 'smarttv', 'wearable', 'embedded');

-- CreateEnum
CREATE TYPE "UserJourneyRole" AS ENUM ('inviteRequested', 'editor', 'owner');

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
    "extra" JSONB,
    "visitorId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "countryCode" TEXT,
    "email" TEXT,
    "lastChatStartedAt" TIMESTAMP(3),
    "lastChatPlatform" "MessagePlatform",
    "lastStepViewedAt" TEXT,
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
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "role" "UserJourneyRole" NOT NULL,
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "UserJourney_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_id_journeyId_visitorId_blockId_idx" ON "Event"("id", "journeyId", "visitorId", "blockId");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_createdAt_key" ON "Visitor"("createdAt");

-- CreateIndex
CREATE INDEX "Visitor_id_teamId_createdAt_userId_idx" ON "Visitor"("id", "teamId", "createdAt", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserJourney_journeyId_userId_key" ON "UserJourney"("journeyId", "userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
