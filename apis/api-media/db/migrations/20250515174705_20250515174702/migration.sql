-- CreateEnum
CREATE TYPE "DefaultPlatform" AS ENUM ('ios', 'android', 'web');

-- CreateTable
CREATE TABLE "ArclightApiKey" (
    "key" TEXT NOT NULL,
    "desc" TEXT,
    "defaultPlatform" "DefaultPlatform" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ArclightApiKey_key_key" ON "ArclightApiKey"("key");
