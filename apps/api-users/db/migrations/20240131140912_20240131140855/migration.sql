-- CreateTable
CREATE TABLE "EmailPreferences" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "teamInvites" BOOLEAN NOT NULL DEFAULT true,
    "journeyNotifications" BOOLEAN NOT NULL DEFAULT true,
    "thirdCategory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmailPreferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailPreferences" ADD CONSTRAINT "EmailPreferences_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
