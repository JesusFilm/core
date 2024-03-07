-- CreateTable
CREATE TABLE "CaptionGoogleDriveResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "CaptionGoogleDriveResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaptionGoogleDriveResource_resourceId_key" ON "CaptionGoogleDriveResource"("resourceId");

-- AddForeignKey
ALTER TABLE "CaptionGoogleDriveResource" ADD CONSTRAINT "CaptionGoogleDriveResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
