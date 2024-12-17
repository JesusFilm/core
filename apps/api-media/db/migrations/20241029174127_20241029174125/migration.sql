-- CreateTable
CREATE TABLE "MuxVideo" (
    "id" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "downloadable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readyToStream" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MuxVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MuxVideo_userId_idx" ON "MuxVideo"("userId");
