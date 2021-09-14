-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockResponse" (
    "id" TEXT NOT NULL,
    "userSessionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "responseData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSession" ADD FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockResponse" ADD FOREIGN KEY ("userSessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockResponse" ADD FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
