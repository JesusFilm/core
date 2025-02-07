-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apexName" TEXT NOT NULL,
    "journeyCollectionId" TEXT,
    "routeAllTeamJourneys" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyCollection" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT,

    CONSTRAINT "JourneyCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyCollectionJourneys" (
    "id" TEXT NOT NULL,
    "journeyCollectionId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "JourneyCollectionJourneys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_name_key" ON "CustomDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyCollectionJourneys_journeyCollectionId_journeyId_key" ON "JourneyCollectionJourneys"("journeyCollectionId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyCollectionJourneys_journeyCollectionId_order_key" ON "JourneyCollectionJourneys"("journeyCollectionId", "order");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_journeyCollectionId_fkey" FOREIGN KEY ("journeyCollectionId") REFERENCES "JourneyCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollection" ADD CONSTRAINT "JourneyCollection_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollectionJourneys" ADD CONSTRAINT "JourneyCollectionJourneys_journeyCollectionId_fkey" FOREIGN KEY ("journeyCollectionId") REFERENCES "JourneyCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyCollectionJourneys" ADD CONSTRAINT "JourneyCollectionJourneys_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
