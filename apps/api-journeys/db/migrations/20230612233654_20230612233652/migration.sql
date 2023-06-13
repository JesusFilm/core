/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Team` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserJourneyRole" AS ENUM ('inviteRequested', 'editor', 'owner');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('archived', 'deleted', 'draft', 'published', 'trashed');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('dark', 'light');

-- CreateEnum
CREATE TYPE "ThemeName" AS ENUM ('base');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('publisher');

-- CreateEnum
CREATE TYPE "VideoBlockObjectFit" AS ENUM ('fill', 'fit', 'zoomed');

-- DropIndex
DROP INDEX "Team_title_idx";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "updatedAt",
ADD COLUMN     "contactEmail" TEXT;

-- CreateTable
CREATE TABLE "UserJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "role" "UserJourneyRole" NOT NULL,
    "openedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserJourney_pkey" PRIMARY KEY ("id")
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
    "template" BOOLEAN DEFAULT false,
    "teamId" TEXT NOT NULL,
    "themeMode" "ThemeMode" DEFAULT 'light',
    "themeName" "ThemeName" DEFAULT 'base',

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
    "variant" TEXT,
    "color" TEXT,
    "size" TEXT,
    "startIconId" TEXT,
    "endIconId" TEXT,
    "action" JSONB,
    "backgroundColor" TEXT,
    "coverBlockId" TEXT,
    "fullscreen" BOOLEAN,
    "themeMode" TEXT,
    "themeName" TEXT,
    "spacing" INTEGER,
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

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserJourney_journeyId_userId_key" ON "UserJourney"("journeyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_slug_key" ON "Journey"("slug");

-- CreateIndex
CREATE INDEX "Journey_slug_idx" ON "Journey"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProfile_userId_key" ON "JourneyProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInvite_journeyId_email_idx" ON "UserInvite"("journeyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_journeyId_email_key" ON "UserInvite"("journeyId", "email");

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
