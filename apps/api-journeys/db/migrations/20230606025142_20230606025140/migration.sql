-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "avatar1Id" TEXT,
    "avatar2Id" TEXT,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);
