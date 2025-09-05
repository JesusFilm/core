-- CreateTable
CREATE TABLE "LanguageName" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "parentLanguageId" TEXT NOT NULL,

    CONSTRAINT "LanguageName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LanguageName_parentLanguageId_idx" ON "LanguageName"("parentLanguageId");

-- CreateIndex
CREATE INDEX "LanguageName_primary_idx" ON "LanguageName"("primary");

-- CreateIndex
CREATE INDEX "LanguageName_languageId_idx" ON "LanguageName"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageName_parentLanguageId_languageId_key" ON "LanguageName"("parentLanguageId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageName_parentLanguageId_primary_key" ON "LanguageName"("parentLanguageId", "primary");

-- CreateIndex
CREATE INDEX "Language_bcp47_idx" ON "Language"("bcp47");

-- AddForeignKey
ALTER TABLE "LanguageName" ADD CONSTRAINT "LanguageName_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageName" ADD CONSTRAINT "LanguageName_parentLanguageId_fkey" FOREIGN KEY ("parentLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
