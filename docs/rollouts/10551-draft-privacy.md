# Draft read privacy, issue #10551

This change belongs to implementation slice 1 of #10153 and acceptance cases A2/A8 of #10157. It adds no MCP endpoint, grant, lifecycle tool or media-delivery change. The private read path is `adminJourney`, under current Admin Read rights. The later private-preview slice consumes it.

## Publication evidence

The old schema has `publishedAt`, lifecycle timestamps and current status, but no publication event log. Existing `journeyCreate` creates published journeys; `journeyDuplicate(duplicateAsDraft: true)` creates a draft with no publication timestamp. Crucially, the old `journeysRestore` sets **every** restored journey to published and overwrites `publishedAt`. Therefore that timestamp on an inactive legacy row cannot distinguish deliberate publication from an implicitly restored draft. Visitor/playback events cannot prove authorized publication either, since they may have come through the read defect.

`firstPublishedAt` records confirmed publication and is immutable. The migration backfills only journeys currently published. It preserves their existing timestamp, or records migration time when the timestamp is absent. It does not infer publication from archive/trash/delete status, creation time, featured flags, view events, or an inactive row's `publishedAt`. Existing drafts stay private even if they have an old timestamp. New published creation/duplication and explicit Manage-authorized publication establish provenance; draft duplication explicitly resets it.

An inactive legacy row, including one with `publishedAt`, remains private until a manager deliberately publishes it or an operator establishes independently audited publication evidence. This deliberately restricts ambiguous old URLs. Do not silently bulk-approve them. Known publications at migration time continue anonymous delivery through subsequent archive/trash/delete and restore, matching the existing viewer policy. Restoring a never-published or ambiguous row returns it to draft without inventing a publication time. Restoring an already active draft never publishes it.

Run and retain this report in the deployment record before migration and after rollout. It contains identifiers and timestamps, not content. Review inactive rows with the owning teams. Any correction must cite independent publication evidence or use the normal authorized Publish operation.

```sql
-- Before migration: publication evidence available in the old schema.
SELECT status, count(*) AS total,
       count(*) FILTER (WHERE "publishedAt" IS NOT NULL) AS with_legacy_timestamp
FROM "Journey" GROUP BY status ORDER BY status;

-- After migration: rows needing explicit review, never an automatic backfill.
SELECT id, slug, "teamId", status, "publishedAt", "archivedAt", "trashedAt", "deletedAt"
FROM "Journey"
WHERE status <> 'published' AND "firstPublishedAt" IS NULL
ORDER BY status, id;
```

## Deployment, cache purge and rollback

1. Use synthetic-data staging first. Hold lifecycle/publication writes during migration and replacement of all old API instances. The trigger rejects an old writer's attempt to publish without provenance, including the old Publish handler. Published inserts retain the existing Admin creation and seed policy. This is a coordinated rollout, not an unrestricted mixed-version deployment.
2. Apply the additive migration and retain its column and trigger. Deploy the fixed API, then the fixed viewer. Verify both owning-service tests and the ordinary anonymous published playback smoke check before reopening writes.
3. Replace every API instance to discard old process-local Yoga caches. The fixed configuration disables caching of all Journey results, simple results and federation hydration, including nested Journey objects, and sends `Cache-Control: private, no-store` on API responses.
4. Purge existing viewer HTML, ISR, CDN and `/_next/data/<build-id>/...json` entries on the root domain and every custom domain. Include journey and website-step routes, embed routes, domain indexes, oEmbed responses, and campaign landing/region pages in every language variant. Use a new viewer deployment/build ID and invalidate any shared CDN entries that survive deployment. Do this for the full affected set, not only newly private slugs. Existing browser copies or previously downloaded content cannot be recalled.
5. Retry previously affected URLs signed out and as a stranger. A viewer revalidation must resolve a private journey to 404 and replace its old payload; an upstream outage is not evidence of a purge. Check both HTML and Next page data. Keep private URLs blocked at the edge while purge or backend verification is incomplete.
6. Roll back only to a digest containing these read/cache protections. Do not deploy an older reader: the database trigger fences old publication writers, but cannot authorize an old application's unrestricted `SELECT`. If no fixed rollback digest exists, disable the affected API/viewer routes and roll forward. Never drop the provenance column/trigger to make an old binary work. Redeploying the fixed binary requires no reverse migration and must not rerun the backfill.

The viewer's public loaders also reject draft responses before serialization, even if an outdated upstream returns one. Protected content is fetched through `adminJourney`; it never enters those public loaders. Campaign image projections require an undeleted image block owned by the linked public journey, so a foreign private block reference cannot disclose its URL or alt text. Ready public image/video byte URLs are unchanged.

## Automated evidence

`apis/api-journeys/integration/journeyPrivacy.spec.ts` runs the real Yoga HTTP schema, production response-cache plugin and Prisma against an isolated PostgreSQL database. Only synthetic identity injection and external queues are substituted. It exercises root ID/slug/status variants, simple reads, Journey/VideoBlock hydration, nested blocks, a forged foreign private image in a public campaign, cross-user cache warming, normal Admin lifecycle operations, explicit Publish, migration classification, old restore SQL rejection, immutable provenance and a new database connection after migration. The fixture report is one current publication, one draft, one ambiguous archived timestamp and one inactive row without evidence. The current publication remains playable after every inactive transition.

Run against an **empty, disposable localhost database named `privacy_test`**. This suite creates the full current schema and applies the actual migration to a pre-column shape. It does not touch production:

```bash
JOURNEY_PRIVACY_TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:PORT/privacy_test \
  pnpm exec vitest run --root apis/api-journeys \
  --config "$PWD/apis/api-journeys/vitest.privacy.config.mts"
```

The normal Vitest config excludes `integration/`; the ready gate and ordinary CI still run the mock-database HTTP regressions, cache regressions, existing template visibility tests and viewer page-data tests. The integration command is an additional required check for this change. No browser, gateway-issuer, staging CDN purge or real-client release acceptance is claimed by these local tests. Those deployment checks remain required before this slice's rollout and the final release gate.
