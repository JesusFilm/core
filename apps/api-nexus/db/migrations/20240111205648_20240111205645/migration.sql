-- CreateTable
CREATE TABLE "GoogleDriveResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "GoogleDriveResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveResource_resourceId_key" ON "GoogleDriveResource"("resourceId");

-- AddForeignKey
ALTER TABLE "GoogleDriveResource" ADD CONSTRAINT "GoogleDriveResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
