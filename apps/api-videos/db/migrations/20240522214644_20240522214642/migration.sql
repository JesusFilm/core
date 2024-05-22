-- CreateTable
CREATE TABLE "ImportTimes" (
    "modelName" TEXT NOT NULL,
    "lastImport" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportTimes_pkey" PRIMARY KEY ("modelName")
);
