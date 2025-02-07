-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "term" TEXT NOT NULL,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyName" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,

    CONSTRAINT "TaxonomyName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_term_key" ON "Taxonomy"("term");

-- CreateIndex
CREATE INDEX "TaxonomyName_term_idx" ON "TaxonomyName"("term");

-- CreateIndex
CREATE INDEX "TaxonomyName_languageId_idx" ON "TaxonomyName"("languageId");

-- CreateIndex
CREATE INDEX "TaxonomyName_languageCode_idx" ON "TaxonomyName"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyName_term_languageId_key" ON "TaxonomyName"("term", "languageId");

-- AddForeignKey
ALTER TABLE "TaxonomyName" ADD CONSTRAINT "TaxonomyName_term_fkey" FOREIGN KEY ("term") REFERENCES "Taxonomy"("term") ON DELETE RESTRICT ON UPDATE CASCADE;
