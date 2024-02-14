/*
  Warnings:

  - You are about to drop the `EmailPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "EmailPreference";

-- CreateTable
CREATE TABLE "JourneysEmailPreference" (
    "email" TEXT NOT NULL,
    "unsubscribeAll" BOOLEAN NOT NULL,
    "teamInvite" BOOLEAN NOT NULL,
    "teamRemoved" BOOLEAN NOT NULL,
    "teamInviteAccepted" BOOLEAN NOT NULL,
    "journeyEditInvite" BOOLEAN NOT NULL,
    "journeyRequestApproved" BOOLEAN NOT NULL,
    "journeyAccessRequest" BOOLEAN NOT NULL,

    CONSTRAINT "JourneysEmailPreference_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "JourneysEmailPreference_email_key" ON "JourneysEmailPreference"("email");

-- CreateIndex
CREATE INDEX "JourneysEmailPreference_email_idx" ON "JourneysEmailPreference"("email");
