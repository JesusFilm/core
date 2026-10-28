-- Data change (additive): let the nxstp.is domain mint links for the `youtube`
-- service alongside the services it already allows. Existing entries are kept,
-- so api-journeys' own minting is untouched.
--
-- Separate from the migration that adds the enum value because Postgres refuses
-- to use a new enum value in the same transaction that added it.
--
-- An empty `services` array already means "every service may use this domain",
-- so rows in that state are skipped — appending to one would narrow it to
-- youtube alone.
UPDATE "ShortLinkDomain"
SET "services" = array_append("services", 'youtube'::"Service"),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "hostname" = 'nxstp.is'
  AND cardinality("services") > 0
  AND NOT ('youtube' = ANY ("services"));
