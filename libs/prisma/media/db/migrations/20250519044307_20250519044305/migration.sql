-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "originId" TEXT;

-- CreateTable
CREATE TABLE "VideoOrigin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "VideoOrigin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_originId_idx" ON "Video"("originId");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_originId_fkey" FOREIGN KEY ("originId") REFERENCES "VideoOrigin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
