-- CreateTable
CREATE TABLE "UserMediaProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageInterestIds" TEXT[],
    "countryInterestIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMediaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserMediaProfileToVideo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserMediaProfileToVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserMediaProfileToVideo_B_index" ON "_UserMediaProfileToVideo"("B");

-- AddForeignKey
ALTER TABLE "_UserMediaProfileToVideo" ADD CONSTRAINT "_UserMediaProfileToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "UserMediaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMediaProfileToVideo" ADD CONSTRAINT "_UserMediaProfileToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
