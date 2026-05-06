---
title: "feat: Add paginated updatedAt-filtered sync queries to api-media"
type: feat
status: active
date: 2026-05-06
origin: docs/brainstorms/2026-05-06-media-sync-endpoints-requirements.md
---

# feat: Add Paginated Sync Queries to api-media

## Overview

Add flat, paginated, `updatedAt`-filterable root-level GraphQL queries for six resource types in `api-media` so a remote data pipeline can incrementally sync each type independently. Two existing queries (`videoEditions`, `videoOrigins`, `keywords`) are upgraded with new optional args; four new root queries are added (`videoSubtitles`, `videoVariantDownloads`, `videoImages`, plus companion count queries for all). All queries are public.

> See origin: `docs/brainstorms/2026-05-06-media-sync-endpoints-requirements.md`

## Problem Statement

A remote data pipeline needs to incrementally pull media content changes. Querying nested resources through parent types (e.g. downloads through variants) is too slow at scale. The existing `adminVideos` and `videoVariants` queries are already sync-ready; all child resource types lack the flat, independent, filterable root queries required for efficient incremental pulls.

## Proposed Solution

Apply the `adminVideos` pattern — filter input type → filter function → `prismaField` list query + `int` count query — to each of the six resource types. All args are optional so existing zero-arg calls are unaffected. All queries are public (no auth guard).

**Note on countries:** `Country` does not exist as a queryable entity in `api-media` (only stored as string IDs in `UserMediaProfile`). Likely managed by a separate service. Confirm with the team before scheduling any follow-up work.

---

## Work Items

### W1 — VideoEdition: add pagination + `updatedAt` filter

**Files to change:**
- `apis/api-media/src/schema/videoEdition/videoEdition.ts` — add optional `where`, `offset`, `limit` args to `videoEditions`; add `orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]`; add `videoEditionsCount` companion
- `apis/api-media/src/schema/videoEdition/inputs/` — create `videoEditionsFilter.ts` + add to `index.ts`
- `libs/prisma/media/db/schema.prisma` — add `@@index([updatedAt, id])` to `VideoEdition` model
- Migration: `nx prisma-migrate prisma-media`

**Pattern reference:** `apis/api-media/src/schema/video/video.ts` lines 505–640 (`adminVideos` / `adminVideosCount`)

**Notes:**
- `updatedAt` is already exposed on the `VideoEdition` GraphQL type — no type change needed
- Zero-arg call (`videoEditions { id }`) must return the same result as today

---

### W2 — VideoSubtitle: new root query + expose `updatedAt` + expose `videoId`

**Files to change:**
- `apis/api-media/src/schema/video/videoSubtitle/videoSubtitle.ts` — expose `updatedAt` on the type; expose `videoId` on the type (non-breaking additive); add `builder.queryFields` with `videoSubtitles` + `videoSubtitlesCount`
- `apis/api-media/src/schema/video/videoSubtitle/inputs/` — create `videoSubtitlesFilter.ts` + add to `index.ts`
- `libs/prisma/media/db/schema.prisma` — add `@@index([updatedAt, id])` to `VideoSubtitle` model
- Migration: shared with W1 above

**Suggested filter fields:** `updatedAt`, `videoId`, `languageId`, `edition`, `primary`

**Notes:**
- `videoId` is in the DB but not currently exposed in GraphQL. Exposing it here is essential — without it the pipeline cannot join subtitles back to their parent video without N+1 fetches.

---

### W3 — VideoOrigin: add pagination + `updatedAt` filter + make public + expose `updatedAt`

**Files to change:**
- `apis/api-media/src/schema/video/videoOrigin/videoOrigin.ts` — remove `isPublisher` auth guard from `videoOrigins`; expose `updatedAt` on the `VideoOrigin` type; add optional `where`, `offset`, `limit` args; update `orderBy` to `[{ updatedAt: 'asc' }, { id: 'asc' }]` (was `{ name: 'asc' }`); add `videoOriginsCount` companion
- `apis/api-media/src/schema/video/videoOrigin/inputs/` — create `videoOriginsFilter.ts` + add to `index.ts` (if inputs dir doesn't exist, create it)
- `libs/prisma/media/db/schema.prisma` — add `@@index([updatedAt, id])` to `VideoOrigin` model
- Migration: shared above
- **Test update required:** `apis/api-media/src/schema/video/videoOrigin/videoOrigin.spec.ts` — the `'should reject if not publisher'` test must be converted to assert the query now succeeds without auth

**Notes:**
- The `orderBy` change from `{ name: 'asc' }` to `[{ updatedAt: 'asc' }, { id: 'asc' }]` is a behavioural change for existing callers. VideoOrigin is a small reference table (~static data), so impact is minimal, but the test must be updated.
- `updatedAt` exists in the DB but is not currently exposed on the GraphQL type.

---

### W4 — VideoVariantDownload: new root query + expose `updatedAt` + expose `videoVariantId`

**Files to change:**
- `apis/api-media/src/schema/videoVariant/videoVariantDownload/videoVariantDownload.ts` — expose `updatedAt` on the type; expose `videoVariantId` on the type (non-breaking additive); add `builder.queryFields` with `videoVariantDownloads` + `videoVariantDownloadsCount`
- `apis/api-media/src/schema/videoVariant/videoVariantDownload/inputs/` — create `videoVariantDownloadsFilter.ts` + add to `index.ts`
- `libs/prisma/media/db/schema.prisma` — add `@@index([updatedAt, id])` to `VideoVariantDownload` model
- Migration: shared above

**Suggested filter fields:** `updatedAt`, `videoVariantId`, `quality`

**Notes:**
- `updatedAt` **already exists** in the DB (`updatedAt DateTime @default(now()) @updatedAt` at schema line 215) — no column migration needed, only the index and GraphQL exposure.
- `videoVariantId` must be exposed so the pipeline can join downloads to their parent variant/video.

---

### W5 — VideoImages: new `videoImages` root query + expose `updatedAt` + expose `videoId`

**Files to change:**
- `apis/api-media/src/schema/cloudflare/image/image.ts` — expose `updatedAt` on `CloudflareImage` type; expose `videoId` on type; add `videoImages` + `videoImagesCount` query fields (public, no auth)
- `apis/api-media/src/schema/cloudflare/image/inputs/` — create `videoImagesFilter.ts` + add to `index.ts`
- `libs/prisma/media/db/schema.prisma` — add `@@index([updatedAt, id])` to `CloudflareImage` model
- Migration: shared above

**Prisma `where` clause for `videoImages`:**
```typescript
where: {
  videoId: { not: null },
  uploaded: true,          // exclude incomplete uploads
  ...filter
}
```

**Suggested filter fields:** `updatedAt`, `videoId`, `aspectRatio`

**Notes:**
- The query must scope to `videoId IS NOT NULL` (video-associated images only, not user uploads).
- The query must also filter `uploaded: true` — records with `uploaded: false` have no usable image data behind the URL and would corrupt the pipeline's downstream data.
- `videoId` must be exposed so the pipeline knows which video each image belongs to.
- `updatedAt` is in the DB but not currently exposed on the `CloudflareImage` GraphQL type.
- The DB join is `CloudflareImage.videoId → Video.id`.

---

### W6 — Keywords: add pagination (updatedAt filter already exists)

**Files to change:**
- `apis/api-media/src/schema/keyword/keyword.ts` — add optional `offset` and `limit` args to the existing `keywords` query; add `orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]`; add `keywordsCount` companion query
- `libs/prisma/media/db/schema.prisma` — add `@@index([updatedAt, id])` to `Keyword` model if not already present
- Migration: shared above

**Notes:**
- `updatedAt` filtering and exposure are already in place — this work item is pagination-only.
- `keywordsCount` is noted as absent in SpecFlow analysis despite the `keywords` query having a filter.

---

## Shared Prisma Migration

A single migration should add indexes to all six models:

```prisma
// Add to each model:
@@index([updatedAt, id])
```

Models requiring the index: `VideoEdition`, `VideoSubtitle`, `VideoOrigin`, `VideoVariantDownload`, `CloudflareImage`, `Keyword`.

Run after schema edit:
```bash
nx prisma-migrate prisma-media
```

> Without these indexes, `updatedAt`-filtered list queries are full table scans in production.

---

## Consistent Query Shape

All new and upgraded list queries must follow this shape:

```typescript
// List query
<queryName>: t.prismaField({
  type: ['<Model>'],
  nullable: false,
  args: {
    where: t.arg({ type: <Filter>, required: false }),
    offset: t.arg.int({ required: false }),
    limit:  t.arg.int({ required: false })
  },
  resolve: async (query, _parent, { offset, limit, where }) => {
    const filter = <filterFn>(where ?? {})
    return await prisma.<model>.findMany({
      ...query,          // spread query — never name this _query
      where: filter,
      skip: offset ?? 0,
      take: limit ?? 100,
      orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]
    })
  }
}),

// Count companion
<queryName>Count: t.int({
  args: { where: t.arg({ type: <Filter>, required: false }) },
  nullable: false,
  resolve: async (_parent, { where }) => {
    const filter = <filterFn>(where ?? {})
    return await prisma.<model>.count({ where: filter })
  }
})
```

**Key conventions (from institutional learnings):**
- **Never name the first `prismaField` arg `_query`** — this silently breaks nested field resolution. Always name it `query` and always spread it: `{ ...query, where, skip, take, orderBy }`.
- **Never pass Pothos `$inferInput` directly to Prisma** — use `toPrismaDateTimeFilter()` to strip `null → undefined` for date fields.
- **Default limit is 100** — consistent with `adminVideos`. `videoVariants` uses no default cap, but for a sync pipeline 100 is safer.
- **Arg name is `where`** — consistent with `adminVideos` / `videos`. (`videoVariants` uses `input` — this is an existing inconsistency; new queries use `where`.)
- **`orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]`** — required for stable offset pagination. Without deterministic ordering, concurrent writes cause missed or duplicated records.

---

## Schema Regeneration

After all code changes, run:
```bash
nx generate-graphql api-media
nx generate-graphql api-gateway
nx run-many -t codegen
```

> Do NOT edit `apis/api-media/schema.graphql` directly — it is auto-generated.

---

## Technical Considerations

- **`DateTimeFilter` is already registered** in `apis/api-media/src/schema/builder.ts` lines 131–145. Import `{ DateTimeFilter, toPrismaDateTimeFilter }` from `../../builder` (adjust relative path).
- **`DateTime` scalar** is already registered in api-media's builder — no scalar registration work needed.
- **`videoOrigins` existing test** (`videoOrigin.spec.ts` — `'should reject if not publisher'`) will fail after W3. Convert it to assert the query succeeds without auth.
- **`videoImages` uploaded filter** — always apply `uploaded: true` in the base `where` clause, not in the filter input. This is an invariant of the `videoImages` query, not a user-configurable filter.

---

## Acceptance Criteria

- [ ] `videoEditions` — accepts optional `where: VideoEditionsFilter`, `offset`, `limit`; zero-arg call returns same result as today
- [ ] `videoEditionsCount` — new companion query accepting same `where`
- [ ] `videoSubtitles` — new root query with `where: VideoSubtitlesFilter`, `offset`, `limit`; `updatedAt` and `videoId` exposed on `VideoSubtitle` type
- [ ] `videoSubtitlesCount` — new companion query
- [ ] `videoOrigins` — accepts optional `where: VideoOriginsFilter`, `offset`, `limit`; `updatedAt` exposed on `VideoOrigin` type; no auth required; zero-arg call returns same result as today (minus alphabetical ordering change)
- [ ] `videoOriginsCount` — new companion query
- [ ] `videoVariantDownloads` — new root query with `where: VideoVariantDownloadsFilter`, `offset`, `limit`; `updatedAt` and `videoVariantId` exposed on `VideoVariantDownload` type
- [ ] `videoVariantDownloadsCount` — new companion query
- [ ] `videoImages` — new root query with `where: VideoImagesFilter`, `offset`, `limit`; scoped to `videoId IS NOT NULL` and `uploaded: true`; `updatedAt` and `videoId` exposed on `CloudflareImage` type
- [ ] `videoImagesCount` — new companion query
- [ ] `keywords` — accepts optional `offset`, `limit`; `keywordsCount` companion added
- [ ] All list queries ordered by `[updatedAt ASC, id ASC]`
- [ ] Prisma migration adds `@@index([updatedAt, id])` to all six models
- [ ] `videoOrigin.spec.ts` auth rejection test converted to public access assertion
- [ ] All six queries callable without auth
- [ ] `nx generate-graphql` runs cleanly post-change
- [ ] Existing tests pass

## Dependencies & Risks

- **Prisma migration** must run before deploying — `@@index` additions are backwards-compatible and safe to apply to live tables.
- **`videoOrigins` ordering change** (`name ASC` → `updatedAt ASC, id ASC`) — existing callers that rely on alphabetical order will see different ordering. VideoOrigin is a small reference table so impact is low, but worth noting in the PR.
- **Countries** are not a queryable entity in `api-media` — if country sync is needed, that work belongs to a different service.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-06-media-sync-endpoints-requirements.md](../brainstorms/2026-05-06-media-sync-endpoints-requirements.md)
  - Key decisions carried forward: all queries public; backwards-compatible optional args; `videoVariantDownload.updatedAt` already in DB (no column migration); `videoImages` scoped to video-associated + uploaded images only
- Canonical paginated query pattern: `apis/api-media/src/schema/video/video.ts` lines 505–640
- `DateTimeFilter` + `toPrismaDateTimeFilter`: `apis/api-media/src/schema/builder.ts` lines 131–145
- `videoEditions` current query: `apis/api-media/src/schema/videoEdition/videoEdition.ts` lines 18–39
- `VideoSubtitle` type + mutations: `apis/api-media/src/schema/video/videoSubtitle/videoSubtitle.ts`
- `videoOrigins` current query: `apis/api-media/src/schema/video/videoOrigin/videoOrigin.ts` lines 13–24
- `VideoVariantDownload` type: `apis/api-media/src/schema/videoVariant/videoVariantDownload/videoVariantDownload.ts`
- `getMyCloudflareImages` + `CloudflareImage` type: `apis/api-media/src/schema/cloudflare/image/image.ts`
- `keywords` current query: `apis/api-media/src/schema/keyword/keyword.ts`
- Prisma models: `libs/prisma/media/db/schema.prisma` (VideoVariantDownload lines 201–219, VideoSubtitle lines 270–289, VideoEdition line 265, VideoOrigin lines 584–591, CloudflareImage lines 25–40, Keyword lines 421–432)
- Learning — Pothos `_query` bug: `docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md`
- Learning — DateTimeFilter null mismatch: `docs/solutions/integration-issues/pothos-prisma-datetimefilter-null-type-mismatch.md`
- Learning — Federation scalar + migration audit: `docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md`
