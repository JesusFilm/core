-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "avatar1Id" TEXT,
    "avatar2Id" TEXT,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
