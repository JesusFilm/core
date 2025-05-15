-- CreateEnum
CREATE TYPE "DefaultPlatform" AS ENUM ('ios', 'android', 'web');

-- CreateTable
CREATE TABLE "ArclightApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "desc" TEXT,
    "defaultPlatform" "DefaultPlatform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArclightApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArclightApiKey_key_key" ON "ArclightApiKey"("key");
