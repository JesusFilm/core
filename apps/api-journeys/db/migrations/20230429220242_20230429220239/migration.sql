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

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProfile_userId_key" ON "JourneyProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInvite_journeyId_email_idx" ON "UserInvite"("journeyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_journeyId_email_key" ON "UserInvite"("journeyId", "email");

-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
