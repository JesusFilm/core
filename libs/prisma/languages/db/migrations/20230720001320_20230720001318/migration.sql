-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" JSONB[],
    "bcp47" TEXT,
    "iso3" TEXT,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);
