-- CreateEnum
CREATE TYPE "UserJourneyRole" AS ENUM ('owner', 'editor', 'inviteRequested');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJourney" (
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "role" "UserJourneyRole" NOT NULL DEFAULT E'inviteRequested'
);

-- CreateIndex
CREATE UNIQUE INDEX "uniqueUserJourney" ON "UserJourney"("userId", "journeyId");

-- AddForeignKey
ALTER TABLE "UserJourney" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
