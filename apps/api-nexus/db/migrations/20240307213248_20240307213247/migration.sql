-- CreateTable
CREATE TABLE "ThumbnailGoogleDriveResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "ThumbnailGoogleDriveResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThumbnailGoogleDriveResource_resourceId_key" ON "ThumbnailGoogleDriveResource"("resourceId");

-- AddForeignKey
ALTER TABLE "ThumbnailGoogleDriveResource" ADD CONSTRAINT "ThumbnailGoogleDriveResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
