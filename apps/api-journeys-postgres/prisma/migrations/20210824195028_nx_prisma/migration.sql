-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "block_type" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "parentBlockId" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
