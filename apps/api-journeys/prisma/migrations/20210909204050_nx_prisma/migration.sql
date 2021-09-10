-- CreateTable
CREATE TABLE "JourneySession" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockResponse" (
    "id" TEXT NOT NULL,
    "journeySessionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "responseData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JourneySession" ADD FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockResponse" ADD FOREIGN KEY ("journeySessionId") REFERENCES "JourneySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockResponse" ADD FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
