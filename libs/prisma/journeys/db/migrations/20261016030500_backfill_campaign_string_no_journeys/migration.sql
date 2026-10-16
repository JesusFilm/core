-- Backfill the noJourneys Campaign String for campaigns created before the key existed
INSERT INTO "CampaignString" ("id", "campaignId", "key", "value")
SELECT gen_random_uuid()::text, "id", 'noJourneys', 'Journeys for this region are coming soon'
FROM "Campaign"
ON CONFLICT ("campaignId", "key") DO NOTHING;
