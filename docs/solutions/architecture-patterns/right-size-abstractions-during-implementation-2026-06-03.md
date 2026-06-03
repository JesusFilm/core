---
title: Right-size abstractions and validate premises when promoting a prototype to production
date: 2026-06-03
category: docs/solutions/architecture-patterns/
module: journeys-admin editor media picker / api-media
problem_type: architecture_pattern
component: tooling
severity: medium
related_components:
  - tooling
  - database
applies_when:
  - "A plan over-specifies component decomposition before implementation begins"
  - "Choosing pagination machinery (Relay cursor connections vs offset/limit) for a small bounded list"
  - "A design's source-of-truth assumption may be invalidated by existing write/update behavior"
  - "Reusing media or assets a user previously uploaded or generated in the editor"
symptoms:
  - "Plan named two near-identical per-tab grid components that collapsed into one shared component in practice"
  - "A Relay/Connection refactor was prototyped then reverted as overengineered for the UX"
  - "Block.src is overwritten in place by imageBlockUpdate, so the Block table cannot serve as history"
tags:
  - architecture
  - abstraction
  - pagination
  - graphql
  - apollo-cache
  - source-of-truth
  - media-library
---

# Right-size abstractions and validate premises when promoting a prototype to production

## Context

The **Editor Asset Library** feature added grids of a user's previously-used media to the journeys-admin image and video block pickers, so creators can re-pick an image/video they uploaded or generated earlier instead of re-uploading or re-prompting. It was prototyped in PR #9102 (NES-1614) and taken to production through a series of NES tickets; the plan lives at `docs/plans/2026-04-28-001-feat-editor-asset-library-plan.md` (PR #9155).

Moving the prototype to production produced three reinforcing course-corrections, all variations on one theme: **the plan's abstractions and premises were provisional; implementation revealed the right shape.**

1. The plan specified two per-tab grid components. One shared component shipped instead.
2. The prototype refactored the resolvers toward Relay cursor connections. That was reverted as overengineered; flat arrays with offset/limit shipped.
3. The original data source (the `Block` table) was discovered to be unable to answer the core question. The feature pivoted to the independent `CloudflareImage` / `MuxVideo` tables.

## Guidance

### 1. Right-size the abstraction to the actual call sites, not the plan's tab count

The plan named a `MyCloudflareImagesGrid` per tab. Shipped instead: one `MediaLibrary` component (`apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/MediaLibrary/MediaLibrary.tsx`) parameterized by `isAi: boolean`, mounted twice:

```tsx
// CustomImage/CustomImage.tsx
<MediaLibrary isAi={false} title={t('Uploads')} onSelect={onChange} selectedSrc={selectedBlock?.src} />
// AIGallery/AIGallery.tsx
<MediaLibrary isAi={true} title={t('Generations')} onSelect={onChange} ... />
```

The two tabs differed only by a filter flag and a title string — a prop, not a new component. Video, which has a genuinely different query and rendering, correctly got a *sibling* (`VideoLibrary/VideoFromMux/MyMuxVideos/MyMuxVideos.tsx`), not a forced merge.

**Rule of thumb:** collapse to one component when call sites differ only by data/config; keep siblings when they differ structurally. (Reinforces the team DRY preference — share from the source rather than copying. *(auto memory [claude])*)

This abstraction *emerged*; it was not designed up front, and an earlier reuse attempt was correctly rejected first (see What Didn't Work).

### 2. Prefer the simplest pagination that satisfies the cache

A Relay cursor-connection rewrite was prototyped and **reverted** before merge as overengineered for the UX (documented in the plan's 2026-05-01 section). Shipped resolvers return flat arrays with offset/limit:

```ts
// apis/api-media/src/schema/cloudflare/image/image.ts
getMyCloudflareImages: t.withAuth({ isAuthenticated: true }).prismaField({
  type: ['CloudflareImage'], nullable: false,
  args: { offset: t.arg.int(...), limit: t.arg.int(...), isAi: t.arg.boolean(...) },
  resolve: async (query, _root, { offset, limit, isAi }, { user }) =>
    prisma.cloudflareImage.findMany({
      ...query,
      where: { userId: user.id, ...(isAi != null ? { isAi } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit ?? undefined, skip: offset ?? undefined
    })
})
```

`getMyMuxVideos` mirrors this (`type: ['MuxVideo']`, no `isAi`; additionally filters `readyToStream: true` + `playbackId: { not: null }`). Apollo's built-in helper handles merging — `apps/journeys-admin/src/libs/apolloClient/cache.ts`:

```ts
getMyCloudflareImages: offsetLimitPagination(['isAi']),
getMyMuxVideos: offsetLimitPagination(),
```

Note the keyArgs `['isAi']` — the Uploads and Generations grids share one query but must cache as separate paginated lists. "Load More" uses a **fetch-one-extra peek** heuristic in the component (`PAGE_SIZE = 10`, `PEEK_LIMIT = PAGE_SIZE + 1`, `hasMore = allImages.length > pagesFetched * PAGE_SIZE`) rather than connection `hasNextPage`.

**Reach for Relay connections only when you need cursors, edge metadata, or bidirectional paging — not for a simple newest-first list.**

### 3. Validate the source-of-truth premise before building on it

The original design assumed the `Block` table held "previously used images." It cannot: `imageBlockUpdate` overwrites `Block.src` in place.

```ts
// apis/api-journeys-modern/src/schema/block/image/imageBlockUpdate.mutation.ts
const input = await transformInput({ ...args.input })
return await update(id, { ...input })   // Block.src replaced in place; prior src gone
```

So "give me the image I used last week" is unanswerable from `Block` — the first cover creates a row, every subsequent pick on that card mutates the same row's `src`. The pivot: back the grids with the independent, append-only `CloudflareImage` / `MuxVideo` tables in api-media, `userId`-scoped. To split AI generations from uploads, a **nullable** `isAi` column was added with **no backfill**:

```sql
-- libs/prisma/media/db/migrations/.../migration.sql
ALTER TABLE "CloudflareImage" ADD COLUMN "isAi" BOOLEAN;
```

Existing ~153k rows stay `NULL` and are excluded by the `isAi != null ? { isAi }` filter — no risky backfill on a large table. A covering index matching the resolver's exact `where` + `orderBy` was added in the same effort: `CloudflareImage(userId, isAi, createdAt DESC)` and `MuxVideo(userId, createdAt DESC)`. (A pre-existing Hash index on `MuxVideo.userId` had to be replaced — Hash indexes can't serve `ORDER BY`.)

## Why This Matters

- **Plans are hypotheses.** All three corrections came from facts only visible during implementation — the tabs were near-identical, the connection machinery was unused, the `Block` table was lossy. Treating the plan as immutable would have shipped a worse design on all three axes.
- **Premise bugs are the expensive ones.** Building two grids and a connection refactor on top of a `Block`-table source that physically cannot return prior images would have been wasted work discovered late. A five-minute check of `imageBlockUpdate` (does it preserve history?) invalidates the whole foundation before it's poured.
- **Simpler scales here.** Flat arrays + `offsetLimitPagination` + a nullable column with no backfill avoided a Relay migration, a multi-hour backfill on a 153k/200k-row table, and the operational risk of both.
- **DRY by sharing the source, not copying it.** One `MediaLibrary` over two near-identical grids means one place to fix bugs, one query, one cache policy.

## When to Apply

- A plan prescribes N similar components — before scaffolding all N, check whether they differ by data/config (→ one parameterized unit) or by structure (→ siblings).
- You're tempted to introduce Relay connections, a generic abstraction, or a framework for what is currently a simple newest-first list. Confirm the extra capability is actually consumed.
- A feature reads from a table/field as its "history" or "source of truth." Verify the write path preserves what you intend to read — in-place updates (`update(id, input)`), upserts, and overwrites silently destroy history.
- Adding a discriminator column to a large existing table — default to nullable + no backfill + a query filter that excludes NULL, unless a backfill is genuinely required. Add the covering index matching the resolver's `where` + `orderBy` in the same change.

## What Didn't Work

Implementation surfaced several abstractions that were built and then walked back — concrete instances of the "let it emerge" guidance *(session history)*:

- **Reusing `UnsplashList` as the grid.** Rejected: it bakes in Unsplash-specific side effects (`triggerUnsplashDownload` on every click) and photographer attribution. The grid was instead built fresh ("inspired by" UnsplashList's MUI structure), then split into `MediaLibrary` + a presentational `MediaLibraryList`.
- **Mobile horizontal-scroll variant** (IntersectionObserver sentinel, scroll-snap, 120px tiles) was built, then reverted in favor of a single 2-column grid at all breakpoints.
- **`prependCloudflareImageToCache` Apollo `cache.modify` helper** was built to optimistically prepend new uploads, then **deleted** — substring-matching Apollo's internal `storeFieldName` (e.g. `includes('"isAi":true')`) is fragile. Replaced with a simpler `localImages` prop/state pattern that merges local + server images client-side.
- **Frontend `onError` filter** for broken thumbnails was added then reverted — it masked the real backend gap (orphaned `uploaded: false` rows, tracked separately as NES-1689) rather than fixing it.
- **`serverHasMore` mirrored into state via `useEffect`** was removed — the peek-pagination length already encodes whether more items exist.

Note: session history did **not** contain a coding attempt for the Relay/Connection revert (learning #2) or an explicit Block.src evaluation (learning #3); those decisions are recorded in the plan and may predate the searched window or were resolved in planning. The shipped state corroborates both.

## Related

- `docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md` — Prior art on validating spec premises before implementing and not bundling pagination/scope creep into a feature PR (same api-media module). Complementary: that doc warns against *adding* pagination on unbounded queries; learning #2 here is the inverse — a pagination abstraction correctly *reverted* as overengineered.
- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — Sibling journeys-admin feature; its §8 (component decomposition) and §10 (ship simplest, iterate) reinforce the right-sizing-abstractions learning.
- `docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md` — Related Pothos query-shape patterns in the same API generation.
