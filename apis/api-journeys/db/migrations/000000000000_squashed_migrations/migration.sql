-- CreateEnum
CREATE TYPE "MessagePlatform" AS ENUM ('facebook', 'telegram', 'whatsApp', 'instagram', 'kakaoTalk', 'viber', 'vk', 'snapchat', 'skype', 'line', 'tikTok', 'custom', 'globe2', 'globe3', 'messageText1', 'messageText2', 'send1', 'send2', 'messageChat2', 'messageCircle', 'messageNotifyCircle', 'messageNotifySquare', 'messageSquare', 'mail1', 'linkExternal', 'home3', 'home4', 'helpCircleContained', 'helpSquareContained', 'shieldCheck', 'menu1', 'checkBroken', 'checkContained', 'settings');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('star', 'prohibited', 'checkMarkSymbol', 'thumbsUp', 'thumbsDown', 'partyPopper', 'warning', 'robotFace', 'redExclamationMark', 'redQuestionMark');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('console', 'mobile', 'tablet', 'smarttv', 'wearable', 'embedded');

-- CreateEnum
CREATE TYPE "ButtonAction" AS ENUM ('NavigateToBlockAction', 'LinkAction', 'EmailAction');

-- CreateEnum
CREATE TYPE "VideoBlockSource" AS ENUM ('cloudflare', 'internal', 'youTube', 'mux');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('growthSpaces');

-- CreateEnum
CREATE TYPE "TextResponseType" AS ENUM ('freeForm', 'name', 'email', 'phone');

-- CreateEnum
CREATE TYPE "UserTeamRole" AS ENUM ('manager', 'member');

-- CreateEnum
CREATE TYPE "UserJourneyRole" AS ENUM ('inviteRequested', 'editor', 'owner');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('archived', 'deleted', 'draft', 'published', 'trashed');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('dark', 'light');

-- CreateEnum
CREATE TYPE "ThemeName" AS ENUM ('base');

-- CreateEnum
CREATE TYPE "JourneyMenuButtonIcon" AS ENUM ('menu1', 'equals', 'home3', 'home4', 'more', 'ellipsis', 'grid1', 'chevronDown');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('publisher');

-- CreateEnum
CREATE TYPE "VideoBlockObjectFit" AS ENUM ('fill', 'fit', 'zoomed');

-- CreateTable
CREATE TABLE "ChatButton" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "link" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" "MessagePlatform",

    CONSTRAINT "ChatButton_pkey" PRIMARY KEY ("id")
);

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
    "previousStepId" TEXT,
    "position" DOUBLE PRECISION,
    "source" "VideoBlockSource",
    "progress" INTEGER,
    "userId" TEXT,
    "journeyVisitorJourneyId" TEXT,
    "journeyVisitorVisitorId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "phone" TEXT,
    "status" "VisitorStatus",
    "referrer" TEXT,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "src1" TEXT,
    "src2" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyVisitor" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "lastChatStartedAt" TIMESTAMP(3),
    "lastChatPlatform" "MessagePlatform",
    "lastStepViewedAt" TIMESTAMP(3),
    "lastLinkAction" TEXT,
    "lastTextResponse" TEXT,
    "lastRadioQuestion" TEXT,
    "lastRadioOptionSubmission" TEXT,
    "activityCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publicTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plausibleToken" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "accessId" TEXT,
    "accessSecretPart" TEXT,
    "accessSecretCipherText" TEXT,
    "accessSecretIv" TEXT,
    "accessSecretTag" TEXT,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTeam" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserTeamRole" NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTeamInvite" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receipientId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTeamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "UserJourneyRole" NOT NULL,
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "UserJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,

    CONSTRAINT "JourneyTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "trashedAt" TIMESTAMP(3),
    "featuredAt" TIMESTAMP(3),
    "status" "JourneyStatus" NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "primaryImageBlockId" TEXT,
    "creatorImageBlockId" TEXT,
    "creatorDescription" TEXT,
    "template" BOOLEAN DEFAULT false,
    "teamId" TEXT NOT NULL,
    "hostId" TEXT,
    "themeMode" "ThemeMode" DEFAULT 'light',
    "themeName" "ThemeName" DEFAULT 'base',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "strategySlug" TEXT,
    "plausibleToken" TEXT,
    "website" BOOLEAN DEFAULT false,
    "showShareButton" BOOLEAN DEFAULT false,
    "showLikeButton" BOOLEAN DEFAULT false,
    "showDislikeButton" BOOLEAN DEFAULT false,
    "displayTitle" TEXT,
    "showHosts" BOOLEAN DEFAULT true,
    "showChatButtons" BOOLEAN DEFAULT true,
    "showReactionButtons" BOOLEAN DEFAULT false,
    "showLogo" BOOLEAN DEFAULT false,
    "showMenu" BOOLEAN DEFAULT false,
    "showDisplayTitle" BOOLEAN DEFAULT true,
    "logoImageBlockId" TEXT,
    "menuStepBlockId" TEXT,
    "menuButtonIcon" "JourneyMenuButtonIcon",

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "Role"[],

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acceptedTermsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveTeamId" TEXT,
    "journeyFlowBackButtonClicked" BOOLEAN,
    "plausibleJourneyFlowViewed" BOOLEAN,
    "plausibleDashboardViewed" BOOLEAN,

    CONSTRAINT "JourneyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvite" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "typename" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "parentBlockId" TEXT,
    "parentOrder" INTEGER,
    "label" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN DEFAULT false,
    "variant" TEXT,
    "color" TEXT,
    "size" TEXT,
    "startIconId" TEXT,
    "endIconId" TEXT,
    "backgroundColor" TEXT,
    "coverBlockId" TEXT,
    "fullscreen" BOOLEAN,
    "themeMode" TEXT,
    "themeName" TEXT,
    "spacing" INTEGER,
    "gap" INTEGER,
    "direction" TEXT,
    "justifyContent" TEXT,
    "alignItems" TEXT,
    "xl" INTEGER,
    "lg" INTEGER,
    "sm" INTEGER,
    "name" TEXT,
    "src" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "blurhash" TEXT,
    "submitIconId" TEXT,
    "submitLabel" TEXT,
    "submitEnabled" BOOLEAN DEFAULT true,
    "nextBlockId" TEXT,
    "locked" BOOLEAN,
    "hint" TEXT,
    "minRows" INTEGER,
    "content" TEXT,
    "align" TEXT,
    "startAt" INTEGER,
    "endAt" INTEGER,
    "muted" BOOLEAN,
    "autoplay" BOOLEAN,
    "posterBlockId" TEXT,
    "fullsize" BOOLEAN,
    "videoId" TEXT,
    "videoVariantLanguageId" TEXT,
    "source" "VideoBlockSource",
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "duration" INTEGER,
    "objectFit" "VideoBlockObjectFit",
    "triggerStart" INTEGER,
    "x" INTEGER,
    "y" INTEGER,
    "routeId" TEXT,
    "integrationId" TEXT,
    "type" "TextResponseType",
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "focalTop" INTEGER DEFAULT 50,
    "focalLeft" INTEGER DEFAULT 50,
    "scale" INTEGER,
    "slug" TEXT,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "parentBlockId" TEXT NOT NULL,
    "gtmEventName" TEXT,
    "blockId" TEXT,
    "journeyId" TEXT,
    "url" TEXT,
    "target" TEXT,
    "email" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("parentBlockId")
);

-- CreateTable
CREATE TABLE "JourneysEmailPreference" (
    "email" TEXT NOT NULL,
    "unsubscribeAll" BOOLEAN NOT NULL DEFAULT false,
    "accountNotifications" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JourneysEmailPreference_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "JourneyNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userTeamId" TEXT,
    "userJourneyId" TEXT,
    "visitorInteractionEmail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JourneyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apexName" TEXT NOT NULL,
    "journeyCollectionId" TEXT,
    "routeAllTeamJourneys" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyCollection" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT,

    CONSTRAINT "JourneyCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyCollectionJourneys" (
    "id" TEXT NOT NULL,
    "journeyCollectionId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "JourneyCollectionJourneys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "toJourneyId" TEXT NOT NULL,
    "toBlockId" TEXT,
    "shortLinkId" TEXT NOT NULL,
    "color" TEXT DEFAULT '#000000',
    "backgroundColor" TEXT DEFAULT '#FFFFFF',

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyEventsExportLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "eventsFilter" TEXT[],
    "dateRangeStart" TIMESTAMP(3),
    "dateRangeEnd" TIMESTAMP(3),

    CONSTRAINT "JourneyEventsExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatButton_journeyId_idx" ON "ChatButton"("journeyId");

-- CreateIndex
CREATE INDEX "Event_journeyId_idx" ON "Event"("journeyId");

-- CreateIndex
CREATE INDEX "Event_visitorId_idx" ON "Event"("visitorId");

-- CreateIndex
CREATE INDEX "Event_blockId_idx" ON "Event"("blockId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_journeyId_visitorId_typename_createdAt_idx" ON "Event"("journeyId", "visitorId", "typename", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Visitor_teamId_idx" ON "Visitor"("teamId");

-- CreateIndex
CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Visitor_userId_idx" ON "Visitor"("userId");

-- CreateIndex
CREATE INDEX "Visitor_status_idx" ON "Visitor"("status");

-- CreateIndex
CREATE INDEX "Visitor_countryCode_idx" ON "Visitor"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_teamId_userId_key" ON "Visitor"("teamId", "userId");

-- CreateIndex
CREATE INDEX "Host_teamId_idx" ON "Host"("teamId");

-- CreateIndex
CREATE INDEX "JourneyVisitor_createdAt_idx" ON "JourneyVisitor"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "JourneyVisitor_journeyId_idx" ON "JourneyVisitor"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyVisitor_visitorId_idx" ON "JourneyVisitor"("visitorId");

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastChatStartedAt_idx" ON "JourneyVisitor"("lastChatStartedAt");

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastRadioQuestion_idx" ON "JourneyVisitor"("lastRadioQuestion");

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastTextResponse_idx" ON "JourneyVisitor"("lastTextResponse");

-- CreateIndex
CREATE INDEX "JourneyVisitor_activityCount_idx" ON "JourneyVisitor"("activityCount" DESC);

-- CreateIndex
CREATE INDEX "JourneyVisitor_duration_idx" ON "JourneyVisitor"("duration" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "JourneyVisitor_journeyId_visitorId_key" ON "JourneyVisitor"("journeyId", "visitorId");

-- CreateIndex
CREATE INDEX "Team_title_idx" ON "Team"("title");

-- CreateIndex
CREATE INDEX "Integration_teamId_idx" ON "Integration"("teamId");

-- CreateIndex
CREATE INDEX "UserTeam_role_idx" ON "UserTeam"("role");

-- CreateIndex
CREATE INDEX "UserTeam_teamId_idx" ON "UserTeam"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTeam_teamId_userId_key" ON "UserTeam"("teamId", "userId");

-- CreateIndex
CREATE INDEX "UserTeamInvite_email_acceptedAt_removedAt_idx" ON "UserTeamInvite"("email", "acceptedAt", "removedAt");

-- CreateIndex
CREATE INDEX "UserTeamInvite_email_idx" ON "UserTeamInvite"("email");

-- CreateIndex
CREATE INDEX "UserTeamInvite_teamId_idx" ON "UserTeamInvite"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTeamInvite_teamId_email_key" ON "UserTeamInvite"("teamId", "email");

-- CreateIndex
CREATE INDEX "UserJourney_journeyId_idx" ON "UserJourney"("journeyId");

-- CreateIndex
CREATE INDEX "UserJourney_role_idx" ON "UserJourney"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserJourney_journeyId_userId_key" ON "UserJourney"("journeyId", "userId");

-- CreateIndex
CREATE INDEX "JourneyTag_tagId_idx" ON "JourneyTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyTag_journeyId_tagId_key" ON "JourneyTag"("journeyId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_slug_key" ON "Journey"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_primaryImageBlockId_key" ON "Journey"("primaryImageBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_creatorImageBlockId_key" ON "Journey"("creatorImageBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_logoImageBlockId_key" ON "Journey"("logoImageBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_menuStepBlockId_key" ON "Journey"("menuStepBlockId");

-- CreateIndex
CREATE INDEX "Journey_title_idx" ON "Journey"("title");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_key" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProfile_userId_key" ON "JourneyProfile"("userId");

-- CreateIndex
CREATE INDEX "JourneyProfile_userId_idx" ON "JourneyProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInvite_email_acceptedAt_removedAt_idx" ON "UserInvite"("email", "acceptedAt", "removedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_journeyId_email_key" ON "UserInvite"("journeyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Block_coverBlockId_key" ON "Block"("coverBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_posterBlockId_key" ON "Block"("posterBlockId");

-- CreateIndex
CREATE INDEX "Block_journeyId_idx" ON "Block"("journeyId");

-- CreateIndex
CREATE INDEX "Block_parentOrder_idx" ON "Block"("parentOrder" ASC);

-- CreateIndex
CREATE INDEX "Block_typename_idx" ON "Block"("typename");

-- CreateIndex
CREATE UNIQUE INDEX "Block_slug_journeyId_key" ON "Block"("slug", "journeyId");

-- CreateIndex
CREATE INDEX "Action_parentBlockId_idx" ON "Action"("parentBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneysEmailPreference_email_key" ON "JourneysEmailPreference"("email");

-- CreateIndex
CREATE INDEX "JourneysEmailPreference_email_idx" ON "JourneysEmailPreference"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotification_userJourneyId_key" ON "JourneyNotification"("userJourneyId");

-- CreateIndex
CREATE INDEX "JourneyNotification_userId_idx" ON "JourneyNotification"("userId");

-- CreateIndex
CREATE INDEX "JourneyNotification_journeyId_idx" ON "JourneyNotification"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotification_userId_journeyId_key" ON "JourneyNotification"("userId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotification_userId_journeyId_userTeamId_key" ON "JourneyNotification"("userId", "journeyId", "userTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_name_key" ON "CustomDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyCollectionJourneys_journeyCollectionId_journeyId_key" ON "JourneyCollectionJourneys"("journeyCollectionId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyCollectionJourneys_journeyCollectionId_order_key" ON "JourneyCollectionJourneys"("journeyCollectionId", "order");

-- CreateIndex
CREATE INDEX "JourneyEventsExportLog_journeyId_idx" ON "JourneyEventsExportLog"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyEventsExportLog_createdAt_idx" ON "JourneyEventsExportLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatButton" ADD CONSTRAINT "ChatButton_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_journeyVisitorJourneyId_journeyVisitorVisitorId_fkey" FOREIGN KEY ("journeyVisitorJourneyId", "journeyVisitorVisitorId") REFERENCES "JourneyVisitor"("journeyId", "visitorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyVisitor" ADD CONSTRAINT "JourneyVisitor_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyVisitor" ADD CONSTRAINT "JourneyVisitor_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeamInvite" ADD CONSTRAINT "UserTeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyTag" ADD CONSTRAINT "JourneyTag_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_primaryImageBlockId_fkey" FOREIGN KEY ("primaryImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_creatorImageBlockId_fkey" FOREIGN KEY ("creatorImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_logoImageBlockId_fkey" FOREIGN KEY ("logoImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_menuStepBlockId_fkey" FOREIGN KEY ("menuStepBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_posterBlockId_fkey" FOREIGN KEY ("posterBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_coverBlockId_fkey" FOREIGN KEY ("coverBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_nextBlockId_fkey" FOREIGN KEY ("nextBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyNotification" ADD CONSTRAINT "JourneyNotification_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyNotification" ADD CONSTRAINT "JourneyNotification_userTeamId_fkey" FOREIGN KEY ("userTeamId") REFERENCES "UserTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyNotification" ADD CONSTRAINT "JourneyNotification_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_journeyCollectionId_fkey" FOREIGN KEY ("journeyCollectionId") REFERENCES "JourneyCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollection" ADD CONSTRAINT "JourneyCollection_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollectionJourneys" ADD CONSTRAINT "JourneyCollectionJourneys_journeyCollectionId_fkey" FOREIGN KEY ("journeyCollectionId") REFERENCES "JourneyCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollectionJourneys" ADD CONSTRAINT "JourneyCollectionJourneys_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEventsExportLog" ADD CONSTRAINT "JourneyEventsExportLog_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

