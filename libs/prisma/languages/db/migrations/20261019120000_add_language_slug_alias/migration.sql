-- CreateTable
CREATE TABLE "LanguageSlug" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "canonical" BOOLEAN NOT NULL DEFAULT false,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageSlug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LanguageSlug_value_key" ON "LanguageSlug"("value");

-- CreateIndex
CREATE INDEX "LanguageSlug_languageId_idx" ON "LanguageSlug"("languageId");

-- CreateIndex
-- Partial unique index: at most one canonical slug per Language. Prisma's
-- schema DSL has no way to express a partial index, so this one is written
-- by hand rather than generated from schema.prisma.
CREATE UNIQUE INDEX "LanguageSlug_languageId_canonical_key" ON "LanguageSlug"("languageId") WHERE "canonical" = true;

-- AddForeignKey
ALTER TABLE "LanguageSlug" ADD CONSTRAINT "LanguageSlug_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one canonical LanguageSlug per Language from its existing slug column.
INSERT INTO "LanguageSlug" ("id", "value", "canonical", "languageId", "updatedAt")
SELECT gen_random_uuid()::text, "slug", true, "id", CURRENT_TIMESTAMP
FROM "Language"
WHERE "slug" IS NOT NULL;

-- Backfill: historical slugs from the rename map that currently lives at
-- apps/resources/src/libs/slugMap.ts (old slug -> current slug), matched
-- against the canonical slug just inserted above. A pair is skipped if no
-- Language currently has that canonical slug, or if the old slug is already
-- taken (global uniqueness wins over the historical record).
INSERT INTO "LanguageSlug" ("id", "value", "canonical", "languageId", "updatedAt")
SELECT gen_random_uuid()::text, v."oldSlug", false, l."id", CURRENT_TIMESTAMP
FROM (VALUES
    ('lala-nigeria', 'lala'),
    ('chinese-hainanese', 'hainanese'),
    ('arabic-sudanese', 'arabic-sudanese-spoken'),
    ('lala-zambia', 'lala'),
    ('yaka-central-african-rep', 'yaka'),
    ('akan-twi', 'twi'),
    ('chinese-mandarin-2', 'mandarin-china'),
    ('chinese-mandarin', 'mandarin-china'),
    ('chinese-shanghainese', 'shanghainese'),
    ('russian-central-asian', 'central-asian-russian'),
    ('tibetan-lhasa', 'lhasa-tibetan'),
    ('pidgin-english-nigerian', 'nigerian-pidgin-english'),
    ('tibetan-amdo', 'amdo-tibetan'),
    ('zhuang-yongbei', 'zhuang-northern-yongbei'),
    ('zhuang-hongshuihe', 'zhuang-northern-hongshuihe'),
    ('malagasy-antandroy', 'antandroy'),
    ('chinese-taiwanese-mandarin', 'mandarin-taiwan'),
    ('euskera', 'basque'),
    ('creole-french-reunion', 'reunion-creole-french'),
    ('creole-french-sesselwa', 'seselwa-creole'),
    ('tlicho-dogrib', 'tlicho'),
    ('creole-french-haitian', 'haitian-creole'),
    ('gaelic-scottish', 'gaelic-scots'),
    ('arabic-algerian', 'arabic-algerian-spoken'),
    ('arabic-egyptian-modern-standard', 'arabic-modern-standard-egyptian'),
    ('yaka', 'yaka-drcongo'),
    ('malay-central-serawai', 'serawai'),
    ('malay-central-pasemah', 'pasemah'),
    ('malay-central-ogan', 'ogan'),
    ('arabic-moroccan', 'arabic-moroccan-spoken'),
    ('banyamulenge', 'kinyamulenge'),
    ('javanese-cirebon', 'cirebon'),
    ('lango', 'lango-uganda'),
    ('shona-karanga', 'karanga'),
    ('chinese-hakka', 'hakka'),
    ('chinese-xiang', 'xiang'),
    ('creole-french-guyanese', 'guyanese-creole'),
    ('mixe-atitlan', 'atitlan-mixe'),
    ('nahuatl-guerrero-aztec', 'aztec-nahuatl-guerrero'),
    ('motu-hiri', 'hiri-motu'),
    ('chinese-hui', 'hui'),
    ('karen-pao', 'pao'),
    ('arabic-mardini', 'mardini'),
    ('chinese-foochow', 'foochow'),
    ('chinese-teochew', 'teochew'),
    ('zande-dr-congo', 'zande-drc'),
    ('zande-sudan', 'zande-south-sudan'),
    ('luri-iran', 'luri-luristan-province-iran'),
    ('bantawa-rai', 'rai-bantawa'),
    ('mumuye-zing', 'zing'),
    ('creole-french-lesser-antillean', 'lesser-antillean-creole-french'),
    ('carib-western', 'western-carib'),
    ('pulaar-fulacunda', 'fulacunda'),
    ('akan-fante', 'fante'),
    ('gujarati-kathiyawadi', 'kathiyawadi'),
    ('korean-hamgyongdo', 'hamgyongdo')
) AS v("oldSlug", "newSlug")
JOIN "Language" l ON l."slug" = v."newSlug"
WHERE NOT EXISTS (
    SELECT 1 FROM "LanguageSlug" existing WHERE existing."value" = v."oldSlug"
);
