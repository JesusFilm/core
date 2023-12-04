-- CreateTable
CREATE TABLE "Nexus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nexus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNexus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nexusId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserNexus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "nexusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "refLink" TEXT NOT NULL,
    "vidoId" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
