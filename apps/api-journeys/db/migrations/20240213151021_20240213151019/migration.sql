-- CreateTable
CREATE TABLE "EmailPreference" (
    "email" TEXT NOT NULL,
    "unsubscribeAll" BOOLEAN NOT NULL,
    "teamInvite" BOOLEAN NOT NULL,
    "teamRemoved" BOOLEAN NOT NULL,
    "teamInviteAccepted" BOOLEAN NOT NULL,
    "journeyEditInvite" BOOLEAN NOT NULL,
    "journeyRequestApproved" BOOLEAN NOT NULL,
    "journeyAccessRequest" BOOLEAN NOT NULL,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("email")
);
