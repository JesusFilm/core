-- CreateTable
CREATE TABLE "CloudflareImage" (
    "id" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CloudflareImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudflareVideo" (
    "id" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readyToStream" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CloudflareVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CloudflareImage_userId_idx" ON "CloudflareImage"("userId");

-- CreateIndex
CREATE INDEX "CloudflareVideo_userId_idx" ON "CloudflareVideo"("userId");
