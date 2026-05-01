---
title: Editor Asset Library
type: feat
status: active
date: 2026-04-28
origin: docs/brainstorms/2026-04-28-editor-asset-library-requirements.md
deepened: 2026-04-28
revised: 2026-05-01
---

# Editor Asset Library

## 2026-04-28 Approach pivot — supersedes prior sections

A prototype pass surfaced a fundamental issue with the original `Block`-table-as-source-of-truth premise: **`Block.src` is overwritten in place** by `imageBlockUpdate` when a user picks a new image on the same card. The first cover creates a `Block` row; every subsequent pick on that card mutates that same row's `src`. Confirmed in `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Card/BackgroundMedia/Image/BackgroundMediaImage.tsx:221-263`.

Consequence: a Library backed by `Block` rows can only show *currently-attached* images. The exact scenario the feature is meant to solve — "I uploaded this last week, replaced it, now I want it back" — is unreachable, because the prior `src` is gone.

### New approach: per-tab history backed by existing `CloudflareImage` table

Each existing tab in `ImageBlockEditor` gains its own history surface, fed by its own persistence layer:

| Tab | History surface | Backing data | Survives Block.src overwrite? |
|-----|-----------------|--------------|------------------------------|
| **Custom** | "Your uploads" grid above the file/URL inputs | `CloudflareImage` (media DB), `userId`-scoped, populated by `createCloudflareUploadByFile` and `createCloudflareUploadByUrl` | ✅ Independent table |
| **AI** | "Your generations" grid above the prompt input | Same `CloudflareImage` (populated by `createImageBySegmindPrompt` / `createCloudflareImageFromPrompt`) | ✅ Independent table |
| **Unsplash** | Deferred. No local persistence today; `triggerUnsplashDownload` only calls Unsplash's tracking API. Picking from Unsplash's existing search/browse remains the path. | — | — |
| **Standalone Library tab** | **Dropped.** Per-tab history covers ~90% of the user's mental model ("I uploaded that" → check Custom; "I generated that" → check AI). Cross-source unification adds little once each tab shows its own history. | — | — |

### What's already in place to leverage

- **`getMyCloudflareImages(offset, limit)`** — exists in `apis/api-media/src/schema/cloudflare/image/image.ts:69-85`. Returns all `CloudflareImage` rows for the authenticated user. No backend work required to power Custom and AI history grids.
- `CloudflareImage` URL pattern (`https://imagedelivery.net/{hash}/{id}/public`) is identical across uploads/URL paste/AI, so Custom and AI grids initially show overlapping content.

### Open question rolled into this pivot

`CloudflareImage` has no `source` enum (`file | url | ai`) or `prompt` column. Two paths:
- **Cheap:** show all `CloudflareImage` rows in both Custom and AI tabs, accept the overlap.
- **Right:** add `source` enum and (for AI) `prompt` column to `CloudflareImage`. Mutations populate them. Each tab filters accordingly.

For prototype: take the cheap path. Promote to "right" once the UX is validated.

### Why this is better product

- **No new architecture required.** No `MediaAsset` table, no Block-mutation rewiring, no orphan-Block strategy.
- **Matches the user's mental model.** People remember *how* they got an image (uploaded vs generated vs picked), and they're already on that tab when they want to find it again.
- **Skips the Unsplash gap.** Unsplash already provides search/browse; "previously picked Unsplash images" is the weakest of the three use cases and can ship later via a small `UnsplashSelection` table if metrics justify it.
- **Removes the deletion-orphan worry entirely** — `CloudflareImage` rows are independent of `Block`, so deletes don't cascade strangely.

### Sections below this point

The original plan (Frontend, Backend, Technical Approach, Acceptance Criteria, etc.) was built around the rejected `Block`-table approach. **Treat them as historical context for the decision trail, not the v1 spec.** New acceptance criteria, file layout, and phasing for the per-tab approach are TODO and will be drafted before implementation resumes.

The revised v1 work is roughly:
1. Add a "Your uploads" grid component to the Custom tab, backed by `getMyCloudflareImages`.
2. Add a "Your generations" grid component to the AI tab, backed by the same query (or a filtered variant once `source` is added to `CloudflareImage`).
3. Defer Unsplash history.
4. Optional: add `source` enum + `prompt` column to `CloudflareImage`, populate on the relevant mutations.

---

## 2026-05-01 v1 shipped + v1.1 team scope plan — supersedes ACTIVE_TEAM material in prior sections

### What v1 actually shipped (per-tab history, personal scope only)

Implementation against the 2026-04-28 pivot landed in PR #9102. Production state:

**Image picker (`ImageBlockEditor`):**
- "Your uploads" grid in Custom tab.
- "Your generations" grid in AI tab.
- Backed by existing `getMyCloudflareImages(offset, limit, isAi): [CloudflareImage!]!` — additive `isAi` arg only, no schema-breaking change.
- New nullable `CloudflareImage.isAi` column populated by upload/URL/AI mutations. Existing 38k rows stay NULL and are excluded from both grids (no backfill — accepted limitation).
- Frontend: offset/limit pagination with `length >= PAGE_SIZE` heuristic for "Load More". `offsetLimitPagination(['isAi'])` cache config.

**Video picker (`VideoFromMux`):**
- "Your uploads" grid below the Mux upload form.
- Backed by existing `getMyMuxVideos(offset, limit): [MuxVideo!]!` — no schema change. Resolver only added a deterministic `orderBy [createdAt desc, id desc]` (correctness for offset pagination, not a UI preference).
- Click-a-tile opens existing `VideoDetails` + `MuxDetails` with a Select button. Gallery flow reuses the same preview infrastructure as the active-block flow; `playbackId` is threaded through to avoid a redundant fetch. `MuxDetails.dispose()` fix shipped alongside.
- `MuxVideoUploadProvider` refetches `GetMyMuxVideos` after polling completes so freshly-ready uploads surface in the gallery.
- `VideoLibrary.onSelect` now closes the outer drawer when `shouldCloseDrawer` is true so picking the same video as the active block still navigates back to Properties.

The "fourth Library tab" with `imageBlocksConnection` from the original plan **is permanently dropped**. Per-tab history covers the user's mental model. Don't reintroduce it without explicit product re-validation.

The `Connection`-style refactor of `getMyCloudflareImages` and `getMyMuxVideos` was prototyped and **reverted** before merge — overengineered for the actual UX requirement. Both resolvers ship as backward-compatible flat arrays with offset/limit pagination. Documented for posterity so the next person doesn't re-introduce it.

### v1.1 — team-shared visibility (replaces the ACTIVE_TEAM material in original Backend / Architecture / Implementation Phases sections)

Goal: the same per-tab grids surface assets uploaded by *teammates* in the user's active team, alongside their own.

#### Locked decisions

- **Ownership stays with the user.** `MuxVideo.userId` / `CloudflareImage.userId` is canonical owner; team affiliation is *not* persisted on the asset.
- **Visibility = own ∪ active-team-members'.** Single team scope at a time. The user's *list of teams* is on the session; *active team* is the lens.
- **Active team passed per-request** from the editor (header or arg). The frontend already knows it via `useTeam()` and feeds it to journey scoping elsewhere.
- **Membership lookup**: `api-media` directly imports `prisma-journeys`. Same precedent already established by `api-journeys-modern`'s user-delete flow (which imports both `prisma-users` and `prisma-journeys`). Latency ~2–5ms per lookup, always fresh, no token-staleness window.
- **No schema changes** to `MuxVideo` / `CloudflareImage`. No `teamId` column, no migration, no backfill — team affiliation is computed dynamically from current `UserTeam` rows.
- **Account deletion is already handled correctly** — verified against `api-users/userDeleteConfirm` + `api-journeys-modern/userDeleteJourneysConfirm`. Neither flow touches `MuxVideo` or `CloudflareImage`. A deleted user's `UserTeam` rows are hard-deleted; their assets automatically vanish from team galleries (the `userId IN (...)` set no longer includes them) while existing journey blocks keep playing — Mux/Cloudflare playback URLs are public, so playback survives. The lingering `userId` reference is a UUID tombstone with no PII attached.
- **Out of scope** for v1.1: deletion/management of teammates' assets, multi-team merged views, signed/private playback IDs, uploader attribution UI (deferred to v1.2 if product asks), backfilling team scope onto historical assets, storage quotas per team.

#### Resolver changes (additive, non-breaking)

```graphql
getMyMuxVideos(offset: Int, limit: Int, teamId: ID): [MuxVideo!]!
getMyCloudflareImages(offset: Int, limit: Int, isAi: Boolean, teamId: ID): [CloudflareImage!]!
```

Both resolvers' implementation:
1. **`teamId` omitted** → existing behavior (own assets only). Backward compatible.
2. **`teamId` provided**:
   - **Membership precheck**: `journeysPrisma.userTeam.findUnique({ where: { teamId_userId: { teamId, userId: caller } } })`. If null → throw `GraphQLError('Not a member of this team', { extensions: { code: 'FORBIDDEN' } })`. Don't distinguish from non-existent team — avoids existence enumeration.
   - **Teammate userIds**: `journeysPrisma.userTeam.findMany({ where: { teamId, userId: { not: caller } }, select: { userId: true } })`.
   - **Asset query**: `where: { userId: { in: [caller, ...teammateIds] }, ...(isAi != null ? { isAi } : {}) }`.
   - Same `orderBy [createdAt desc, id desc]` and offset/limit pagination as v1.

#### Frontend changes

- `MyCloudflareImagesGrid` and `MyMuxVideosGrid` get a `teamId?: string | null` prop.
- Mount each grid twice in its respective tab/screen:
  ```tsx
  <MyCloudflareImagesGrid title="Your uploads" isAi={false} />
  <MyCloudflareImagesGrid title="Team uploads" isAi={false} teamId={activeTeamId} />
  ```
  Same pattern for Mux: a "Your uploads" + a "Team uploads" grid stacked under `AddByFile`.
- **Apollo cache** — extend the keyArgs so the two grids stay in separate cache entries:
  ```ts
  getMyCloudflareImages: offsetLimitPagination(['isAi', 'teamId']),
  getMyMuxVideos: offsetLimitPagination(['teamId']),
  ```
- **Active team source**: `useTeam()` from `TeamProvider` — already a tree ancestor of the editor. Threaded as a prop into the relevant tab/screen components.
- **Refetch on upload**: existing `refetchQueries: ['GetMyCloudflareImages']` / `'GetMyMuxVideos'` works as-is. Apollo refetches every active query with that operation name regardless of variables, so both personal and team grids update.

#### Performance considerations

- Two extra round-trips to `prisma-journeys` per gallery request (precheck + member list). Both are indexed lookups on `(teamId, userId)` — sub-5ms each, intra-region.
- Asset query becomes `WHERE userId IN (N userIds)`. Existing `userId` index handles efficiently up to large teams.
- For very large teams (hundreds of members) consider switching to an `EXISTS` subquery joining `UserTeam` directly. Not v1.1 work; benchmark first.

#### Authorization edge cases

| Scenario | Behavior |
|---|---|
| Caller passes `teamId` they're not a member of | `FORBIDDEN` |
| Caller passes a non-existent `teamId` | `FORBIDDEN` (same response — don't leak existence) |
| User added to team mid-session | Next request reflects new membership (always fresh via direct Prisma) |
| User removed from team mid-session | Next request rejects with `FORBIDDEN`; frontend should detect and refetch active-team list |
| Teammate uploads while caller paginates | Insertion drift between pages possible; mitigated by refetch-on-upload; acceptable for v1.1 |

#### Tests (v1.1 specific)

- Resolver: `teamId` omitted → current behavior preserved.
- Resolver: `teamId` provided + caller is member → returns own ∪ teammates' rows, ordered correctly.
- Resolver: `teamId` provided + caller not member → `FORBIDDEN`.
- Resolver: `teamId` for non-existent team → `FORBIDDEN` (same shape as not-member).
- Resolver: deleted teammate (`UserTeam` row gone) → no rows returned for them; existing journey embeds keep working (out-of-scope for unit test, integration smoke).
- Frontend: both grids render independently with separate cache entries; switching `teamId` triggers the team grid to refetch.
- Frontend: refetch-after-upload updates both grids simultaneously.

#### Phasing

- **1.1.1 — Backend**: optional `teamId` arg + direct Prisma membership lookup on both `getMyCloudflareImages` and `getMyMuxVideos`. Tests above. Ship behind no flag (additive arg = backward compatible).
- **1.1.2 — Frontend**: thread `useTeam().activeTeam.id` to the grids, mount second "Team uploads" grid in each affected tab/screen, update Apollo cache keys.
- **1.1.3 (optional, deferred)**: uploader attribution chip on each tile (federation to `api-users.User`). Skip until product asks.

#### Risk surface

- Tight: additive schema change, no migration, no breaking change, no federation consumer impact.
- Cross-domain Prisma adds a build-time coupling between `api-media` and `prisma-journeys` — already established precedent (user-delete), so additive rather than new policy.
- The `userId IN (...)` query path can degrade with very large teams; instrument before optimizing.

#### Material in original plan that does NOT apply to v1.1

The original (pre-pivot) plan and the deepening notes (lines 62–101) reference: `imageBlocksConnection`, `ImageBlockLibraryScope` enum, `ImageBlockLibraryEdge`, `ImageBlockLibraryConnection`, `JourneyProfile.lastActiveTeamId` server derivation, CASL guard / publisher-role tests, `thumbnailSrc`, `relayStylePagination`, partial composite Block index. **None of these apply to v1.1.** v1.1 is an additive arg on existing resolvers — not a new connection, not a new type, not a new auth code path beyond the membership precheck above. Treat the original Backend / Architecture / Acceptance Criteria sections as historical context for the rejected approach.

---

## Enhancement Summary

**Deepened:** 2026-04-28 with 3 best-practices researchers (Pothos cursor + Apollo cache + MUI tabs) and 5 reviewers (performance, security, simplicity, architecture, TypeScript).

### Major plan changes from deepening

1. **Resolver moves to legacy `apis/api-journeys`** (NestJS + SDL). The modern Pothos service has no Relay connection precedent, no `CaslAccessible`/`AppCaslGuard` infrastructure, and no team-scoped image-block resolvers — every piece the original plan assumed lives in legacy. The `visitorsConnection` template that the plan cites is itself in legacy.
2. **Drop the `ImageBlockLibraryEntry` projection.** Return `Connection<ImageBlock>` directly (mirrors `visitorsConnection { edges { node: Visitor } }`). Avoids parallel-type drift, codegen bloat, Apollo normalization collisions on shared `ImageBlock` ids, and ~150 LOC of mapping code. Three reviewers (architecture, simplicity, TypeScript) converged on this.
3. **Drop client-supplied `activeTeamId`.** Derive from `JourneyProfile.lastActiveTeamId` server-side and add an explicit `userTeam` membership precheck. Closes the cross-team enumeration vector and removes a forgeable client input.
4. **Drop server-side `DISTINCT ON` + raw SQL for v1.** Use vanilla Prisma `findMany` ordered by `updatedAt DESC` with a generous take, dedupe by `src` in resolver memory, and rely on the client `Map` as the cross-page safety net. Realistic library sizes are sub-few-thousand. Re-evaluate raw SQL only if EXPLAIN ANALYZE shows the simpler path is too slow.
5. **Add `thumbnailSrc` field (critical performance).** Resolver computes a thumbnail URL per source: Cloudflare `cdn-cgi/image/width=240,quality=80` for cf-hosted, Unsplash `&w=240&fit=crop`, AI/external passthrough. A 24-tile grid otherwise loads tens of MB of full-size hero images.
6. **Apollo cache strategy: `cache-first` (default) + mutation eviction.** Original plan double-paid by combining `cache-and-network` *and* eviction. With single-source-of-truth mutations, eviction alone is correct.
7. **MUI tabs: switch to `variant="scrollable"` with `iconPosition="top"`** unconditionally (the drawer is always narrow; viewport-conditional toggling adds flicker).
8. **Auth: pick one filter, not two.** "Defense-in-depth" via CASL AND scope filter is double-bookkeeping for cases where both are supposed to compute the same set. Use the explicit scope filter as the authoritative gate, plus an explicit membership check for `ACTIVE_TEAM`. CASL still applies elsewhere (the resolver guard) but is not duplicated in the where-input. EXCEPTION: the `publisher` role can read `template: true` journeys across teams via CASL — for that role explicitly, AND-ing the scope filter is load-bearing. Document and test this.
9. **Cursor and raw-row decoding need runtime validation** (zod) if any raw SQL is reintroduced. Versioned cursor (`v: 1, ...`) for forward compatibility.
10. **Explicit Postgres partial index DDL** required (not implicit): `CREATE INDEX CONCURRENTLY ... ON "Block" ("journeyId", "src", "updatedAt" DESC) WHERE typename='ImageBlock' AND src IS NOT NULL AND deletedAt IS NULL`.

### Phasing decision (locked in 2026-04-28)

**v1 ships PERSONAL only. ACTIVE_TEAM follows in v1.1.** This was the user's call after weighing the simplicity review's push to ship team-only against the brainstorm's stated dual-scope plan.

Concrete implications for v1:
- No `ACTIVE_TEAM` scope, no server-side `lastActiveTeamId` derivation, no `userTeam` membership precheck.
- No feature-flag infrastructure required (Q7 dissolves).
- Schema can drop the `ImageBlockLibraryScope` enum and the `scope` argument entirely; the resolver is unconditionally personal-scoped.
- All publisher-role / cross-team / transfer auth tests (R20, R21) are deferred to v1.1 since they only matter when team scope ships.
- The brainstorm's stated value driver (team-shared brand assets) lands in v1.1, not v1.

The technical sections below were drafted with both scopes in scope. Where they reference `ACTIVE_TEAM`, treat that material as a v1.1 spec carried in the same plan for continuity. **Phase 1 implements PERSONAL only.**

### Sections substantially revised below

- Proposed Solution → Backend
- Technical Approach → Architecture (resolver home, schema, query, authorization, frontend cache)
- Implementation Phases (Phase 1 query path; Phase 2 tab variant; Phase 4 flag dependency)
- Acceptance Criteria (added R19–R23; removed R10/R12/R15 — see notes inline)
- Risk Analysis (publisher role; thumbnail bandwidth)
- Dependencies (feature-flag infra)
- Outstanding Questions (Q6 dual-scope vs single-scope; Q7 feature-flag infra)

## Overview

Add a **Library** tab to the Editor's image picker (`ImageBlockEditor`) that surfaces images the creator (or their active team) has previously used in any `ImageBlock`. Picking an image applies it to the current block via the existing `onChange` flow — no upload, no AI prompt, no Cloudflare round-trip. The library is a derived view over `Block` rows of `typename = 'ImageBlock'`; **no new media/asset domain model is introduced**.

Two scope variants are planned in parallel and gated by a feature flag so the same client code can ship either:
- **Approach A — Personal:** library shows ImageBlocks from journeys the user owns or edits.
- **Approach B — Personal + Active Team (recommended target):** library shows ImageBlocks from any journey in the user's currently-active team.

Recommended path: build the UI once, ship the resolver dual-scoped behind a server flag (`scope: PERSONAL | ACTIVE_TEAM`). Default to `ACTIVE_TEAM` in staging, validate, then in production. If team-scoped query work runs long, ship `PERSONAL` first and flip without touching the client.

## Problem Statement

Today the image picker offers Custom (file/URL upload), AI (prompt-to-image), and Unsplash. Creators have no way to pick from images they've already produced. They re-upload identical files (wasted storage, wasted time) and re-prompt the AI to recreate images they already have (wasted budget, drift in output). Teams suffer doubly: a designer uploads a logo to one journey, a colleague uploads the same logo on theirs because they can't see the first one.

The constraint that shapes this plan: **deletion is forbidden in v1** — removing a library entry would orphan images on existing journeys that still reference them (see origin: `docs/brainstorms/2026-04-28-editor-asset-library-requirements.md` Key Decisions).

## Proposed Solution

### Frontend
A new `<Tab>` + `<TabPanel>` inserted into `ImageBlockEditor.tsx` between the existing tabs, mirroring the `UnsplashGallery` structural pattern. New component lives at `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/ImageLibraryGallery/` (the name `ImageLibrary` is taken by an unrelated wrapper component — see the Naming section in System-Wide Impact).

The tab calls a new GraphQL query to list deduplicated `ImageBlock` summaries, ordered by `updatedAt DESC`, paginated as a Relay-style cursor connection. Selecting a tile calls the editor's existing `handleSrcChange` → `onChange(input)` prop with `{ src, alt, width, height, blurhash, scale, focalLeft, focalTop }` — the same path Unsplash and AI use today. **No new client mutations.**

### Backend
A new resolver `imageBlocksConnection(first, after, scope)` in **`apis/api-journeys`** (legacy NestJS + SDL — `visitorsConnection` lives here, all `ImageBlock` mutations live here, `AppCaslGuard` and `@CaslAccessible` decorators only exist here). Server-side filters:
- `typename = 'ImageBlock' AND src IS NOT NULL AND deletedAt IS NULL`
- Journey scope (single explicit filter, not AND-ed with CASL):
  - `PERSONAL`: `journey.userJourneys.some({ userId: me, role: { in: [owner, editor] } })`
  - `ACTIVE_TEAM`: `journey.teamId = derivedActiveTeamId` AND **explicit precheck** that `userTeam.findFirst({ teamId: derivedActiveTeamId, userId: me })` is non-null. `derivedActiveTeamId` is read from `JourneyProfile.lastActiveTeamId` server-side; no client-supplied `activeTeamId` argument exists. The membership precheck short-circuits to an empty connection when the user is not a current member of their stored active team (e.g., they were just removed).
- The resolver is still gated by `@UseGuards(AppCaslGuard)` — CASL ensures only authenticated users hit the resolver and provides a sanity check, but the where-input is *not* `AND`-ed with `accessibleBy('Journey')`. Reasoning: for non-publisher users the explicit scope filter is a strict subset of what CASL allows; AND-ing changes nothing. For the `publisher` role specifically, CASL grants `Read` on every published-template journey across all teams (`journey.acl.ts:83-86, :144`) — so adding a scope filter here is necessary for `ACTIVE_TEAM` correctness. Encoded as: scope filter authoritative; CASL guard for auth gate only.
- **Include** journeys with `archivedAt`, `deletedAt`, `trashedAt` set — past work is exactly when reuse matters most (R7).

**De-duplication strategy (v1, simplified):** Use Prisma `findMany` ordered by `updatedAt DESC` with `take: first * 3` (over-fetch to absorb dedup loss), dedupe in resolver memory keyed by `src` preserving the first occurrence (newest), slice to `first + 1` for `hasNextPage`, encode the cursor as `(updatedAt, id)`. The over-fetch factor of 3 is heuristic — tunable. For v1 library sizes (low thousands per team), this is well under p95 budget. The client `Map` keyed on `src` is kept as a cross-page safety net. **Raw SQL `DISTINCT ON` is deferred** to a v1.x optimization if EXPLAIN ANALYZE on a seeded 50k-block dataset misses the latency target.

## Technical Approach

### Architecture

#### Where the resolver lives
**Decision: legacy `apis/api-journeys` (NestJS + SDL).** Reasoning surfaced during deepening:
- `visitorsConnection` (the Relay connection template the plan mirrors) lives in legacy.
- All `ImageBlock` mutations (`imageBlockCreate`, `imageBlockUpdate`) live in legacy at `apis/api-journeys/src/app/modules/block/image/image.resolver.ts`.
- `apis/api-journeys-modern` (Pothos) only defines the `ImageBlock` *type*; it has no `prismaConnection`/`prismaConnectionHelpers` usage anywhere, no `AppCaslGuard`, no `@CaslAccessible` decorator. Hand-rolled `journeyAcl(Action.X, journey, user)` is the modern auth idiom.
- Building the connection in modern would require porting/inventing all of those pieces. Not v1.

#### Schema (using existing types)

```graphql
"""Scope for the image library query."""
enum ImageBlockLibraryScope {
  PERSONAL          # journeys the user owns or edits
  ACTIVE_TEAM       # journeys in the user's currently-active team (server-derived)
}

type ImageBlockLibraryEdge {
  cursor: String!
  node: ImageBlock!
  """Provider-specific thumbnail variant of node.src."""
  thumbnailSrc: String!
}

type ImageBlockLibraryConnection {
  edges: [ImageBlockLibraryEdge!]!
  pageInfo: PageInfo!
}

extend type Query {
  imageBlocksConnection(
    first: Int = 24
    after: String
    scope: ImageBlockLibraryScope!
  ): ImageBlockLibraryConnection!
}
```

Notes on the schema shape (changes from v1 of the plan):
- **No `ImageBlockLibraryEntry`**. Edges expose existing `ImageBlock` directly. Reuses the existing `ImageBlockFields` codegen fragment, eliminates a parallel TS type, prevents Apollo cache normalization collisions on shared `ImageBlock` ids.
- **No `activeTeamId` argument**. Server derives from `JourneyProfile.lastActiveTeamId`. Removes a forgeable client input.
- **`thumbnailSrc` on the edge** (not on `ImageBlock`) so it's contextual to the library use case and doesn't pollute the canonical type.

Pattern reference: `apis/api-journeys/src/app/modules/visitor/visitor.graphql:153–220` and `visitor.resolver.ts:37–42`.

#### Prisma query (v1 — simplified, no raw SQL)

```ts
// PSEUDO — actual resolver lives in NestJS + Prisma
const overFetch = first * 3 + 1;
const rows = await prisma.block.findMany({
  where: {
    typename: 'ImageBlock',
    src: { not: null },
    deletedAt: null,
    journey: scopeFilter,        // see Authorization below
  },
  orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
  take: overFetch,
  // cursor-based pagination on (updatedAt, id) — both indexed
  ...(after ? { cursor: { id: decodeCursor(after).id }, skip: 1 } : {}),
});

// In-memory dedup by src, preserve first (newest by orderBy)
const seen = new Set<string>();
const deduped: typeof rows = [];
for (const r of rows) {
  if (r.src && !seen.has(r.src)) { seen.add(r.src); deduped.push(r); }
  if (deduped.length === first + 1) break;
}
const hasNextPage = deduped.length > first;
const slice = deduped.slice(0, first);
```

Cursor encoding: base64url JSON `{ v: 1, id, updatedAt }`. Decoded with a zod schema (`z.object({ v: z.literal(1), id: z.string(), updatedAt: z.string().datetime() })`) — malformed cursors throw `GraphQLError('Invalid cursor')` rather than crashing the resolver. The `v` byte enables non-breaking schema evolution.

**Why this simplified path is correct for v1:**
- For team libraries up to ~few thousand ImageBlocks, the over-fetch + in-memory dedup completes in single-digit ms after the indexed query.
- Trades a marginal worst-case (over-fetch wastes a row read per duplicate) for orders-of-magnitude less complexity vs. raw SQL `DISTINCT ON` + seek cursor on a compound key.
- Cross-page duplicates are still possible if a duplicate `src` straddles a page boundary; the client `Map` (R15) absorbs them. Severity is cosmetic.
- If EXPLAIN ANALYZE on a seeded 50k-block dataset misses the latency target, swap in the raw SQL `DISTINCT ON (src)` CTE pattern (recommended by deepening research as Pattern B: CTE + keyset seek). Captured as a v1.x optimization.

#### Index DDL (must ship with the resolver)

```sql
-- Migration: add to libs/prisma/journeys
CREATE INDEX CONCURRENTLY IF NOT EXISTS block_imageblock_library_idx
  ON "Block" ("journeyId", "src", "updatedAt" DESC)
  WHERE typename = 'ImageBlock' AND "src" IS NOT NULL AND "deletedAt" IS NULL;
```

Partial composite index. The partial predicate is essential — `typename='ImageBlock'` is a small fraction of `Block`, and the `WHERE` matches the resolver's filter exactly so the planner uses an index-only scan. Verify with `EXPLAIN ANALYZE` against a seeded 50k+ block dataset before merge.

Also confirm a `Journey(teamId)` index exists; if not, add one in the same migration.

#### Authorization

```ts
@Resolver()
@UseGuards(AppCaslGuard)               // auth gate; not used for where-filtering
class ImageBlockLibraryResolver {
  @Query(() => ImageBlockLibraryConnection)
  async imageBlocksConnection(
    @CurrentUserId() userId: string,
    @Args('scope') scope: ImageBlockLibraryScope,
    @Args('first', { defaultValue: 24 }) first: number,
    @Args('after', { nullable: true }) after?: string,
  ) {
    let scopeFilter: Prisma.JourneyWhereInput;

    if (scope === 'PERSONAL') {
      scopeFilter = {
        userJourneys: { some: { userId, role: { in: ['owner', 'editor'] } } },
      };
    } else {
      // ACTIVE_TEAM — derive teamId server-side, then verify membership
      const profile = await this.prisma.journeyProfile.findUnique({
        where: { userId },
        select: { lastActiveTeamId: true },
      });
      const teamId = profile?.lastActiveTeamId;
      if (!teamId) return emptyConnection();    // R10: fall back to empty (or PERSONAL — see Q3)

      const isMember = await this.prisma.userTeam.findFirst({
        where: { teamId, userId },
        select: { id: true },
      });
      if (!isMember) return emptyConnection();  // R13 enforcement at resolver entry

      scopeFilter = { teamId };
    }

    // ... findMany with where: { ..., journey: scopeFilter }
  }
}
```

Decisions encoded:
- **Scope filter is authoritative** for where-filtering. CASL guard handles auth-gate only.
- **`activeTeamId` is server-derived** (`JourneyProfile.lastActiveTeamId`). No client argument.
- **Membership precheck** short-circuits to empty connection — matches R13 ("user removed from team T returns 0 images") at the resolver entry, also closes the timing-side-channel.
- **Publisher-role cross-team test required** (see Acceptance Criteria R20): a publisher reading `ACTIVE_TEAM` must not see template ImageBlocks from teams they're not a member of, because the membership precheck blocks the resolver before the scope filter is even applied.

#### Client query and cache strategy

```ts
// apps/journeys-admin/src/libs/useImageLibraryQuery/
import { relayStylePagination } from '@apollo/client/utilities';

// In Apollo cache config (centralised):
typePolicies: {
  Query: {
    fields: {
      imageBlocksConnection: relayStylePagination(['scope']),
    },
  },
  ImageBlock: {
    // Avoid normalisation collision with the canonical ImageBlock cached
    // by the editor's other queries — library entries are read-only views.
    keyFields: false,
  },
}

// Hook:
const { activeTeam, loading: teamLoading } = useTeam();

const { data, fetchMore, networkStatus, refetch } = useQuery(
  ImageBlocksConnectionDocument,
  {
    variables: { first: 24, scope: /* from feature flag */ },
    fetchPolicy: 'cache-first',                // NOT cache-and-network
    skip: teamLoading,
    notifyOnNetworkStatusChange: true,         // required for NetworkStatus.fetchMore
  },
);

const isFetchingMore = networkStatus === NetworkStatus.fetchMore;
const { endCursor, hasNextPage } = data?.imageBlocksConnection.pageInfo ?? {};
```

Mutation eviction (single source of truth for refresh):

```ts
const [createImageBlock] = useJourneyImageBlockCreateMutation({
  update(cache) {
    cache.evict({ fieldName: 'imageBlocksConnection' });
    cache.gc();
  },
});
// Same wrapper added to useJourneyImageBlockUpdateMutation.
```

On `activeTeam.id` change in the same session, also evict — Apollo will re-fetch on next read because the field is empty:

```ts
useEffect(() => {
  client.cache.evict({ fieldName: 'imageBlocksConnection' });
  client.cache.gc();
}, [activeTeam?.id]);
```

Why this differs from v1 of the plan:
- **`cache-first`, not `cache-and-network`.** With single-source-of-truth mutation eviction, every drawer open is either a cache hit (fresh) or a fresh fetch (just evicted). `cache-and-network` would double-pay every open.
- **`relayStylePagination(['scope'])` as the field policy** — handles edge merging, cursor stability, dedup-by-cursor automatically. Source: https://www.apollographql.com/docs/react/pagination/cursor-based#relay-style-cursor-pagination
- **`ImageBlock.keyFields: false`** prevents the library's `ImageBlock` nodes from sharing cache identity with the editor's canonical `ImageBlock` queries (where they would otherwise overwrite richer field selections).
- **Concurrent `fetchMore` guard** via `notifyOnNetworkStatusChange: true` + `NetworkStatus.fetchMore` (R14).

#### Frontend file layout

```
apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/
  ImageBlockEditor.tsx                # add 4th tab, beacon param, extend TabParams
  ImageLibraryGallery/
    ImageLibraryGallery.tsx           # tab body, useImageLibraryQuery, dedup, render list
    ImageLibraryGallery.spec.tsx
    ImageLibraryGallery.stories.tsx
    index.ts
    ImageLibraryList/
      ImageLibraryList.tsx            # grid renderer, click → onChange
      ImageLibraryList.spec.tsx
      ImageLibraryList.stories.tsx
    ImageLibraryEmptyState/
      ImageLibraryEmptyState.tsx      # 3 variants: never-uploaded, team-empty, error
      ImageLibraryEmptyState.spec.tsx

apps/journeys-admin/src/libs/useImageLibraryQuery/
  useImageLibraryQuery.ts
  useImageLibraryQuery.spec.tsx
  useImageLibraryQuery.mock.tsx
  index.ts
```

### Implementation Phases

#### Phase 1 — Backend resolver + schema (legacy api-journeys)

- **1.1** Add migration with the partial composite index (DDL above) and confirm `Journey(teamId)` index. Run `EXPLAIN ANALYZE` against a seeded dataset (50k blocks across 100 journeys / 1 team).
- **1.2** Add SDL definitions: `ImageBlockLibraryScope` enum, `ImageBlockLibraryEdge`, `ImageBlockLibraryConnection`, and the `imageBlocksConnection` query. Edges expose existing `ImageBlock` and a new `thumbnailSrc: String!` field.
- **1.3** Implement resolver in `apis/api-journeys/src/app/modules/block/image/imageBlockLibrary.resolver.ts` (or extend `image.resolver.ts`). Vanilla Prisma `findMany` with over-fetch + in-memory dedup. Server-derived `lastActiveTeamId`. Membership precheck for `ACTIVE_TEAM`. Versioned cursor with zod validation on decode.
- **1.4** `thumbnailSrc` resolver: provider detection by URL prefix (`imagedelivery.net` → Cloudflare variant; `images.unsplash.com` → `&w=240&fit=crop`; AI provider URLs that already include sizing → passthrough; otherwise → passthrough with a documented bandwidth caveat).
- **1.5** Tests:
  - Unit: dedup correctness (same `src` in 3 ImageBlocks → 1 entry, newest wins).
  - Auth: user not on team T cannot fetch ACTIVE_TEAM images of T (membership precheck blocks).
  - Auth: user removed from team mid-test → fetch returns 0.
  - **Auth (publisher role): a publisher reading ACTIVE_TEAM must not see template ImageBlocks from a team they are not a member of.** Specifically guards the cross-team CASL leak vector.
  - Auth (transfer): journey transferred from T1→T2; T1 members no longer see its ImageBlocks under `ACTIVE_TEAM=T1`; T2 members do under `ACTIVE_TEAM=T2`. Audit `userJourneys` cleanup on transfer for PERSONAL scope.
  - Soft-delete: archived/deleted/trashed journeys' images are included; deleted ImageBlocks are excluded.
  - Pagination: 60 unique `src`s, page size 24 → three pages, no duplicates across pages.
  - Cursor: malformed cursor returns `Invalid cursor` GraphQLError, not 500.
- **1.6** Codegen: run apollo codegen to produce TS types in journeys-admin.

**Deliverables:** new query merged behind a feature flag (no client UI yet).
**Success criteria:** integration test green; auth tests green; query callable from GraphQL Playground.
**Estimated effort:** 2–3 days (Approach A and B share the same query; the scope arg differentiates them).

#### Phase 2 — Frontend Library tab (UI shell)

- **2.1** Create `ImageLibraryGallery/` skeleton with `next/dynamic` import in `ImageBlockEditor.tsx`. Add 4th tab, extend `TabParams`, emit `setBeaconPageViewed('library-image')`. Decide tab position (Outstanding Q2; recommend index 0 once stable, after empty-state polish).
- **2.2** Switch the `<Tabs>` in `ImageBlockEditor.tsx` from `variant="fullWidth"` to **`variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile`** unconditionally — the drawer is always narrow regardless of viewport, and 4 fullWidth tabs at ~360px truncate i18n labels (German "Bibliothek" doesn't fit). Add `aria-label="Image source"` on the Tabs container. Pair each `<Tab>` with `iconPosition="top"` and a small icon for visual scanning at narrow widths.
- **2.3** Wire `useImageLibraryQuery` with `cache-first` policy, `notifyOnNetworkStatusChange: true`, `skip: useTeam().loading`, and a `useEffect` that evicts the connection field when `activeTeam.id` changes.
- **2.4** Render grid using the same image-tile aesthetic as `UnsplashList.tsx:60–90`. **Use `edge.thumbnailSrc` (not `edge.node.src`) for the `<img>` source** — full-size images would tank a 24-tile grid. Add `loading="lazy"` and `decoding="async"` to every tile img.
- **2.5** Selection highlight: `selectedBlock?.src === edge.node.src` → outlined state. Clicking the currently-applied tile is a no-op via `handleSrcChange`'s existing short-circuit — accept that rather than introducing the `Current` badge / non-clickable state (R12 dropped per simplicity review).
- **2.6** Client-side dedup safety net: accumulate edges in a `Map<string, Edge>` (in `useRef` inside `useImageLibraryQuery`) keyed by `src`, reset in a `useEffect` on `[scope, activeTeam?.id]`. Cap at 500 entries — when reached, disable "Load More". Add a test asserting `Map.size <= 500` after 30 paginations.
- **2.7** Concurrent `fetchMore` guard: disable the "Load More" button while `networkStatus === NetworkStatus.fetchMore`.
- **2.8** Tests + stories. Stories must include: empty, loading, error, populated, populated-with-current-selected, end-of-list, error-on-load-more.

**Deliverables:** Library tab functional with team scope behind a flag; selection applies images correctly.
**Success criteria:** R1–R6 pass acceptance tests; manual smoke test in Editor.
**Estimated effort:** 2–3 days.

#### Phase 3 — States, pagination, polish

- **3.1** Empty states (3 variants per SpecFlow #1, #3, #4): never-uploaded, team-with-no-uploads, error. All translated.
- **3.2** Loading skeleton (6–12 placeholder tiles matching grid template).
- **3.3** Error state with `Try again` button → `refetch()`.
- **3.4** "Load More" button with concurrent-fetch guard (SpecFlow #17). Terminal sentinel "End of library" when `hasNextPage === false` (SpecFlow #16).
- **3.5** `<img onError>` handler hides broken tiles (Cloudflare/AI URL purge — SpecFlow #12).
- **3.6** A11y: `role="listbox"`, `role="option"` per tile, roving tabindex, descriptive aria-label, focus-on-tab-activate (SpecFlow #27).
- **3.7** Translation strings extracted via `i18next-parser`. Verify `apps-journeys-admin` namespace.
- **3.8** Mutation cache invalidation: `useJourneyImageBlockCreateMutation` / `useJourneyImageBlockUpdateMutation` evict `imageBlocksConnection` on success.
- **3.9** Active-team-null fallback for Approach B (Outstanding Q3 — recommend: fall back to `PERSONAL` scope client-side when `activeTeam == null && !loading`).

**Deliverables:** production-ready Library tab.
**Success criteria:** all acceptance criteria pass; manual cross-browser + mobile smoke; analytics fires.
**Estimated effort:** 2 days.

#### Phase 4 — Rollout

**Prerequisite:** confirm feature-flag infrastructure exists in this monorepo. Architecture review found no GrowthBook/Unleash/`isFeatureEnabled` pattern; if absent, dual-scope rollout is not viable as planned. Two paths:
- **Path A (flag infra exists or is added):** as below.
- **Path B (no flag infra; pragmatic):** ship `ACTIVE_TEAM`-only — that's the actual product value driver per the brainstorm. Drop the `scope` arg or hard-default it. Saves all flag work. Origin doc's "personal vs personal+team" comparison resolves in favor of team for the same reason.

This plan defaults to Path A and surfaces Path B as Outstanding Q7.

- **4.1** Server feature flag `imageLibraryScope` defaulting to `PERSONAL`.
- **4.2** Stage with `ACTIVE_TEAM` enabled; QA cross-team auth test plan from Phase 1 manually.
- **4.3** Production: enable for internal teams first, observe analytics (Library-tab applies vs. Custom-tab uploads ratio — see Success Metrics).
- **4.4** Roll to all teams.
- **4.5** Document v2 candidates: search, hide/delete, multi-team filter, video assets, raw SQL `DISTINCT ON` optimization if EXPLAIN ANALYZE shows the v1 over-fetch path is too slow.

**Deliverables:** GA.
**Success criteria:** non-zero Library applies within first week; no auth incidents.
**Estimated effort:** 1 day of in-product work + flag-flip cycles.

## Alternative Approaches Considered

These come from the origin doc and are preserved here for context.

1. **Standalone library management page** — rejected for v1 in origin; UI tab inside the existing picker has lower friction and lower scope.
2. **Opt-in "Save to library" action** — rejected; auto-save matches the "don't re-upload" goal exactly. Already implicitly happens since uploads create ImageBlocks.
3. **New server-side asset model (`MediaAsset`)** — rejected; every uploaded/generated image already creates an `ImageBlock` immediately. A separate model adds backfill, sync, and complexity without product value for v1.
4. **All teams the user belongs to** — rejected for B; matches journey scoping and avoids cross-org bleed.
5. **Approach A first, B later (phased)** — still a viable fallback if Phase 1 effort balloons. The pragmatic flag-based path subsumes this — code is the same, scope flips at the resolver.

## System-Wide Impact

### Interaction Graph

When a creator clicks a Library tile:
1. `ImageLibraryList` `onClick(item)` fires.
2. → `ImageLibraryGallery` calls `props.onChange({ src, alt, width, height, blurhash, scale, focalLeft, focalTop })`.
3. → `ImageBlockEditor.handleSrcChange` short-circuits if `src === selectedBlock.src` (no-op), otherwise validates `src`, defaults `alt` from filename, calls parent `onChange`.
4. → Parent (e.g. `BackgroundMediaImage.handleChange`) decides create-vs-update:
   - No existing `coverBlock` → `useJourneyImageBlockCreateMutation` → server inserts `Block`, then `journeyUpdate` to wire the cover association.
   - Existing `coverBlock` → `useJourneyImageBlockUpdateMutation` → server updates `Block.src` etc., bumping `updatedAt`.
5. → Mutation `update()` evicts `imageBlocksConnection` → next library open shows the just-applied image first.
6. → Editor canvas re-renders the new image; preview iframe (Journeys preview) re-renders via existing block subscription.
7. → Beacon event for tab view fires on the next tab switch.

### Error & Failure Propagation

- **Resolver query failure** (DB error): Apollo error returned; client shows error state with retry. No partial UI corruption.
- **Auth failure**: `@CaslAccessible('Journey')` returns empty journey set; resolver returns empty connection. User sees the "team has no images" empty state — non-fatal, slightly misleading. Acceptable; auth failure on Journey read is already tested elsewhere.
- **Cloudflare/Unsplash URL 404 at render**: `<img onError>` hides the broken tile. Other tiles unaffected. If user already applied that image to a journey before it 404'd, that journey is broken regardless — pre-existing behavior, not regressed.
- **Apply mutation failure**: existing path's error handling applies (snackbar, no canvas mutation). Library tab does not introduce new error paths.
- **Cache eviction race** (mutation evicts cache while a `fetchMore` is in-flight): Apollo handles by treating evicted cache as miss; the `fetchMore` resolves with the latest server state. No corruption.

### State Lifecycle Risks

- **Picking an image does not create new persistent state in Library** — it creates/updates an `ImageBlock` on a journey via existing mutations. No orphan risk introduced.
- **Cross-page client dedup state** lives only inside the `useImageLibraryQuery` consumer. Resets on tab close (component unmount). No persistent state to leak.
- **Apollo cache for `imageBlocksConnection`** can grow unbounded if user paginates through 1000s of tiles in a session. Mitigate by capping client accumulation at 500 entries (configurable). Memory budget: ~50KB.

### API Surface Parity

- `imageBlocksConnection` is a new query — no existing surface to keep parity with. The resolver intentionally mirrors `visitorsConnection` style for codebase consistency.
- The client `onChange` contract is shared by Custom, Unsplash, AI tabs. Library follows the same shape — no parity work needed.
- No mobile-app surface (this is admin-only).

### Integration Test Scenarios

1. **Cross-tab freshness**: Upload an image via Custom tab → switch to Library tab → expect the just-uploaded image as the first tile (mutation cache invalidation works end-to-end).
2. **Apply-from-library on empty slot**: Open card with no cover → Library → click → expect `ImageBlock` created and associated; reopen card → cover renders.
3. **Apply-from-library on populated slot**: Open card with an existing cover → Library → click a different image → expect `Block.src` updated in place (no new id); preview re-renders.
4. **Cross-team auth (B)**: User U on teams T1+T2 with images on both. `activeTeam = T1` → Library returns only T1 images. Switch to T2 → Library refetches with T2 images, no T1 leak. Remove U from T2 → Library returns 0 with `activeTeam = T2`.
5. **Soft-delete inclusion**: Seed 3 ImageBlocks: one on active journey, one on archived journey, one on trashed journey. All 3 appear. Hard-delete an ImageBlock (sets `Block.deletedAt`) → it disappears from the next fetch.
6. **De-dup race**: Seed 5 ImageBlocks with same `src` across 5 journeys; assert exactly 1 tile rendered. Insert a 6th with the same `src` between page 1 fetch and page 2 fetch → assert no visible duplicate (client `Map` dedup catches it).

## Acceptance Criteria

### Functional Requirements

- [ ] **R1** A "Library" tab is visible in `ImageBlockEditor` alongside Custom, AI, Unsplash. Test: render `ImageBlockEditor` with mocks, assert 4 `Tab` elements with the expected labels.
- [ ] **R2** Library shows ImageBlocks reverse-chronologically with cursor pagination. Test: seed 50 entries, assert order matches `updatedAt DESC`; assert "Load More" triggers next page.
- [ ] **R3** Selecting an image calls `onChange({ src, alt, width, height, blurhash, scale, focalLeft, focalTop })` matching the source ImageBlock. Test: click tile, assert mock `onChange` payload.
- [ ] **R4** All four sources (Cloudflare upload, URL paste, AI-generated, Unsplash) appear when ever placed in an `ImageBlock`. Test: seed one of each, assert all visible.
- [ ] **R5** No "Save to library" UI control exists; uploads/generations auto-appear after apply (cache invalidation). Test: assert no save button; integration test: apply via Custom tab → switch to Library → first tile is the new image.
- [ ] **R6** De-dup by `src`. Test: seed two ImageBlocks with identical `src`, assert one tile.
- [ ] **R7** Includes images from archived/deleted/trashed journeys. Test: seed each, assert all visible.
- [ ] **R8** No delete, hide, rename, or label affordance on tiles. Test: assert no per-tile menu rendered.

### New Acceptance Criteria from Flow Analysis & Deepening

- [ ] **R9** Empty states render distinct copy for: no-images-anywhere/team-with-no-images (collapsed per simplicity review — same UX in v1 since team scope means an empty team library reads the same as "no images") and fetch-error. Two variants total, not three.
- [ ] **R10** When `JourneyProfile.lastActiveTeamId` is null in `ACTIVE_TEAM` scope, resolver returns an empty connection. Client may *optionally* render a hint "Set an active team to see shared images" — leave to design.
- [ ] **R11** When `activeTeam.id` changes client-side, the connection field is evicted and re-fetched from cursor null; accumulated client `Map` is reset.
- [ ] ~~**R12**~~ *(removed: existing selection-highlight via `selectedBlock?.src === edge.node.src` covers this; `handleSrcChange` already short-circuits on identical src; no Current badge needed)*
- [ ] **R13** Cross-team auth test passes: user removed from team T → resolver returns empty connection for `scope=ACTIVE_TEAM` (membership precheck).
- [ ] **R14** Concurrent "Load More" clicks are guarded — only one in-flight fetch at a time (via `NetworkStatus.fetchMore`).
- [ ] **R15** Client-side dedup `Map` absorbs cross-page race duplicates and is capped at 500 entries; "Load More" disables on cap.
- [ ] **R16** A11y: grid is keyboard-navigable; tiles have descriptive aria-labels.
- [ ] **R17** Tab strip uses `variant="scrollable"` with `iconPosition="top"`; remains usable at all drawer widths.
- [ ] **R18** Beacon event `library-image` fires on tab activation.
- [ ] **R19** Each edge exposes `thumbnailSrc` returning a provider-appropriate small variant; client renders `<img src={thumbnailSrc}>` with `loading="lazy"` + `decoding="async"`. Bandwidth per page-load < 2MB at 24 tiles.
- [ ] **R20** Publisher-role auth test: a user with `publisher` role reading `ACTIVE_TEAM` scope does not see template ImageBlocks from teams they are not a member of.
- [ ] **R21** Journey-transfer auth test: a journey moved from team T1 to T2 stops appearing in T1 members' libraries and starts appearing in T2 members'. PERSONAL scope: confirm `userJourneys` cleanup behavior on transfer.
- [ ] **R22** Cursor decode is zod-validated; malformed cursors return `Invalid cursor` GraphQLError (not 500).
- [ ] **R23** Apollo `ImageBlock` cache normalization for library results does not collide with the editor's canonical `ImageBlock` queries (`keyFields: false` typePolicy on the library's read path, or equivalent).

### Non-Functional Requirements

- [ ] Initial fetch p95 < 500ms with team library of 500 unique images.
- [ ] Pagination fetch p95 < 300ms.
- [ ] No N+1 queries — all data in one Prisma round-trip.
- [ ] Bundle impact for the new tab + hook < 8KB gzipped.

### Quality Gates

- [ ] Test coverage matches existing `UnsplashGallery` (≥80% line in new files).
- [ ] All new strings in `apps-journeys-admin` translation namespace.
- [ ] Stories rendered for: empty, loading, error, populated, populated-with-current-selected.
- [ ] Manual mobile drawer smoke (`xs` viewport).
- [ ] Storybook accessibility audit on new components (no new violations).

## Success Metrics

**Primary metric (lock in before launch — SpecFlow #33):**
- Ratio of Library-tab applies to Custom-tab uploads per session. Target: ≥30% within four weeks of GA. If ≥50%, declare clear success.

**Secondary metrics:**
- Library tab open-rate (% of editor sessions that activate the Library tab). Target: ≥40% within four weeks.
- Re-upload rate: count of new `ImageBlock` rows where `src` already exists in the user's (or team's) prior ImageBlocks. Should drop measurably post-launch.
- AI re-prompt rate: heuristic match on similar prompts producing similar images. Stretch metric — instrument only if cheap.

## Dependencies & Prerequisites

- **D1** Active-team context via `useTeam()` is reliable inside the Editor's component tree (verified — `TeamProvider` is a tree ancestor). Server reads `JourneyProfile.lastActiveTeamId` independently.
- **D2** Soft-delete semantics confirmed: `Journey.archivedAt`, `Journey.deletedAt`, `Journey.trashedAt`, `Block.deletedAt` all soft-delete via timestamp; rows persist. R7 stands.
- **D3** GraphQL codegen pipeline picks up new types automatically (apollo.config.js present).
- **D4** Apollo cache eviction API works against the legacy API's connection field (verified by `visitorsConnection` patterns in legacy).
- **D5** Cloudflare/Unsplash/AI delivery URLs are stable enough that `src` equality is a reasonable dedup key — see Risks for the caveat.
- **D6** Postgres index migration tooling supports `CREATE INDEX CONCURRENTLY` in this monorepo's Prisma migration flow. If not, the migration must be applied out-of-band to avoid table locks on the production `Block` table.
- **D7** **Feature-flag infrastructure (open).** See Outstanding Q7. Phase 1 must verify or add this before Phase 4's dual-scope rollout works.
- **D8** **`userJourneys` cleanup on journey transfer (open).** See Outstanding Q8. Phase 1 verifies behavior; PERSONAL scope correctness depends on it.

## Risk Analysis & Mitigation

- **R-1 — Cross-team data leak via publisher role (Critical / Low likelihood).** CASL grants `publisher` users `Read` on every published-template journey across all teams (`journey.acl.ts:83-86, :144`). Without an explicit scope filter and membership precheck, a publisher's `ACTIVE_TEAM` library would surface template images from teams they don't belong to. Mitigation: explicit scope filter + membership precheck + dedicated publisher-role auth test (R20).
- **R-2 — Visible duplicates from `src` normalization gaps (Important / Medium likelihood).** Same Unsplash photo with different query strings, or AI image variants, look identical but have different `src`. Mitigation: accept some duplicates in v1; document as known limitation; optionally apply a normalization rule (strip query string for unsplash.com domain) if QA flags it as common.
- **R-3 — Cross-page dedup race (Important / Low likelihood).** Concurrent ImageBlock creation between page fetches can produce a duplicate `src` in the visible grid. Mitigation: client-side `Map`-based dedup (R15).
- **R-4 — Library tab UX in narrow drawer with 4 tabs (Medium / High likelihood).** Tab labels truncate. Mitigation: switch to scrollable tabs at `xs` if needed (R17).
- **R-5 — AI generations abandoned mid-flow are invisible to Library (Low / Low likelihood).** Documented as v1 limitation; rare and self-inflicted by the user.
- **R-6 — Library opens before `useTeam()` hydrates (Medium / Medium likelihood).** Approach B query runs with `activeTeamId = undefined` and either errors or returns empty. Mitigation: skip the query while `useTeam().loading`; fall back to PERSONAL when `activeTeam` is null (R10).
- **R-7 — Cloudflare object purged but ImageBlock row remains (Low / Low likelihood).** Library shows broken thumb. Mitigation: `<img onError>` hides; pre-existing systemic issue, not regressed.
- **R-8 — Thumbnail bandwidth (Critical / High likelihood without mitigation).** A 24-tile grid loading full-size hero images can transfer 50–100MB per page on real-world Cloudflare assets. Mitigation: `thumbnailSrc` field on edges with provider-specific variants (Cloudflare `cdn-cgi/image/width=240,quality=80`, Unsplash query param, AI passthrough). R19 enforces this. Without it, mobile users on cellular suffer disproportionately and p95 latency is dominated by network, not query.
- **R-9 — Apollo cache identity collision on `ImageBlock` (Important / Medium likelihood).** The library's `ImageBlock` nodes share `__typename:id` with the editor's canonical `ImageBlock` queries. Default normalization could overwrite richer field selections in the editor's cache with the library's thinner projection — manifesting as missing fields elsewhere in the app. Mitigation: `ImageBlock.keyFields: false` typePolicy in the library's cache config (R23). If that turns out to disable normalization too broadly, fall back to a synthetic `__typename` like `LibraryImageBlock` for the library's read path.
- **R-10 — Feature-flag infrastructure absent (Important / Unknown likelihood).** Architecture review found no flag system in the monorepo. If true, Phase 4's dual-scope rollout strategy is non-functional. Mitigation: confirm in Phase 1; if absent, take Path B (ship `ACTIVE_TEAM` only). Addressed in Outstanding Q7.

## Resource Requirements

- 1 frontend engineer, ~5 days (Phases 2 + 3).
- 1 backend engineer, ~3 days (Phase 1).
- 1 designer review for empty states, currently-applied affordance, and tab strip layout (~2 hours).
- 1 product/analytics check to lock in success metric and verify the `library-image` beacon event is consumed by the analytics pipeline (~1 hour).
- Total wall-clock: ~1 week if frontend and backend run in parallel after Phase 1.2.

## Future Considerations

- **v2 candidates** (deliberately out of v1 per origin doc):
  - Search by filename / AI prompt / tag.
  - Hide entries (without deleting the underlying image — flag-only soft-hide).
  - Multi-team filter (let the user opt to see assets from any team they belong to).
  - Video assets and generic media model — only if a separate brief justifies it.
  - Standalone library management page outside the Editor.
- **Server-side `MediaAsset` model**: re-evaluate when the v2 features above (especially hide/label) require fields the `Block` table can't carry without bloat.
- **AI prompt-as-label**: only meaningful with a `MediaAsset` model; deferred.

## Documentation Plan

- **No public docs** required for v1 — feature is in-product and self-explanatory.
- **CHANGELOG** entry: "Editor: pick from previously used images via the new Library tab."
- **Storybook** entries function as the component spec.
- **Origin and plan docs** (this file) are the durable record.
- **Outstanding question resolutions** are captured inline in this plan as they're answered, not in a separate doc.

## Outstanding Questions

(All deferred-to-planning questions from the origin doc are addressed inline above. Remaining open items, all resolvable in implementation:)

- **Q1** ~~Modern vs. legacy API home~~ — **Resolved during deepening: legacy `apis/api-journeys`** (modern lacks Pothos connection patterns, CASL guard, and image-block mutations all live in legacy).
- **Q2** Position of the Library tab in the strip and whether it becomes the new default. Recommend: insert at index 0 once Phase 3 (empty states) is solid; keep Unsplash as default for the first week post-launch.
- **Q3** Behavior when `JourneyProfile.lastActiveTeamId == null` in `ACTIVE_TEAM` scope. Recommend: resolver returns empty (not silent fall-through to PERSONAL — different scopes are different intents). Client may render a small "set an active team" hint.
- **Q4** `src` normalization rule for Unsplash query strings — apply now or accept duplicates. Recommend: accept v1; revisit if QA flags >5% visible duplicates.
- **Q5** Whether the `library-image` beacon event name is consumed by the analytics pipeline before launch. Quick confirmation with analytics owner.
- **Q6** ~~Dual-scope vs. single-scope~~ — **Resolved: PERSONAL only for v1, ACTIVE_TEAM in v1.1.**
- **Q7** ~~Feature-flag infrastructure~~ — **Resolved: not required for v1** (single scope means no flag needed). Will be re-evaluated when v1.1 lands; if no flag infra exists by then, v1.1 ships team scope unconditionally.
- **Q8** `userJourneys` cleanup on journey transfer between teams — does it happen? Verify so PERSONAL scope doesn't quietly leak access to ImageBlocks on a journey transferred away from the user. **Now applies to v1** (PERSONAL is the v1 scope). R21 (PERSONAL portion) covers the test.
- **Q9** Whether to over-fetch by `first * 3` (current proposal) or compute the factor adaptively from observed dedup ratio per query. Recommend: fixed factor for v1, instrument the ratio, revisit if observed dedup density is high.

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-04-28-editor-asset-library-requirements.md](../brainstorms/2026-04-28-editor-asset-library-requirements.md)
  - Key decisions carried forward: single picker tab (not standalone page); auto-saved via existing ImageBlock creation; no management actions in v1; de-dup by `src`; include archived/deleted journeys (R7); active-team-only scope for Approach B.

### Internal References

- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/ImageBlockEditor.tsx` — tab structure, `handleSrcChange` (line 90), `TabParams` (line 67), beacon emission (lines 73–75).
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/UnsplashGallery/UnsplashGallery.tsx` — closest pattern to mirror (network-fetched grid, "Load More").
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/UnsplashGallery/UnsplashList/UnsplashList.tsx:40–90` — tile render + `onChange` payload shape.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/AIGallery/AIGallery.tsx:41–77` — `onChange` payload contract.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Card/BackgroundMedia/Image/BackgroundMediaImage.tsx:337–345` — canonical create-vs-update wiring at the parent.
- `apps/journeys-admin/src/libs/useJourneyImageBlockCreateMutation/`, `.../useJourneyImageBlockUpdateMutation/` — mutation hooks; add cache eviction here.
- `libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx` — `useTeam()` source of `activeTeam.id`.
- `apis/api-journeys/src/app/modules/journey/journey.resolver.ts:132–180` — pagination + CASL idiom to replicate.
- `apis/api-journeys/src/app/modules/journey/journey.acl.ts` — `INCLUDE_JOURNEY_ACL`, ability matchers.
- `apis/api-journeys/src/app/modules/visitor/visitor.graphql:153–220` and `visitor.resolver.ts:37–42` — Relay connection template.
- `apis/api-journeys-modern/src/schema/block/image/image.ts` — modern Pothos definition of `ImageBlock`.
- `libs/prisma/journeys/db/schema.prisma` — `Block` (line 536), `Journey` (line 406), `UserJourney` (line 352), `UserTeam` (line 307), `JourneyProfile.lastActiveTeamId` (line 493).

### External References

- Apollo Client cache eviction: https://www.apollographql.com/docs/react/caching/garbage-collection
- Relay-style cursor connection spec: https://relay.dev/graphql/connections.htm

### Related Work

- No prior PRs or feature attempts for an asset library / media picker found in the codebase.
- No `docs/solutions/` entries — institutional knowledge gap to seed post-launch (`/ce:compound`).
