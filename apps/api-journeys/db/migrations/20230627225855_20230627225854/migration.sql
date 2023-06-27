-- CreateTable
CREATE TABLE "UserTeamInvite" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserTeamRole" NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTeamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTeamInvite_email_idx" ON "UserTeamInvite"("email");

-- AddForeignKey
ALTER TABLE "UserTeamInvite" ADD CONSTRAINT "UserTeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
