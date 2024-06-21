-- CreateTable
CREATE TABLE "AudioPreview" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioPreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudioPreview_languageId_idx" ON "AudioPreview"("languageId");

-- AddForeignKey
ALTER TABLE "AudioPreview" ADD CONSTRAINT "AudioPreview_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
