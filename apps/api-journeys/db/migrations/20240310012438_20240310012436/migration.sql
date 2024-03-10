-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apexName" TEXT NOT NULL,
    "allowOutsideJourneys" BOOLEAN NOT NULL DEFAULT false,
    "journeyCollectionId" TEXT,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyCollection" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "JourneyCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JourneyToJourneyCollection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_name_key" ON "CustomDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_JourneyToJourneyCollection_AB_unique" ON "_JourneyToJourneyCollection"("A", "B");

-- CreateIndex
CREATE INDEX "_JourneyToJourneyCollection_B_index" ON "_JourneyToJourneyCollection"("B");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_journeyCollectionId_fkey" FOREIGN KEY ("journeyCollectionId") REFERENCES "JourneyCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollection" ADD CONSTRAINT "JourneyCollection_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourneyToJourneyCollection" ADD CONSTRAINT "_JourneyToJourneyCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourneyToJourneyCollection" ADD CONSTRAINT "_JourneyToJourneyCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "JourneyCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
