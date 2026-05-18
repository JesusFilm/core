---
title: Fix template-gallery revalidate — response-cache stale-null gap
type: fix
status: active
date: 2026-05-14
---

# Fix template-gallery revalidate — response-cache stale-null gap

## Summary

`apis/api-journeys-modern/src/yoga.ts`'s `useResponseCache` plugin caches the public `templateGalleryPageBySlug` query for 60 seconds. When the query returns `null` during a `draft` window, the cached entry has no entity ID — so the subsequent `publish` mutation's entity-ID-based auto-invalidation can't evict it. Anything reading the public slug during the next 60 seconds (admin's preview-proxy revalidate, Next ISR regeneration, anonymous viewers) hits the cached null and sees a 404 even though the page is now `published`. The fix is explicit cache invalidation in the publish / unpublish / delete / assign-journey mutations that target `TemplateGalleryPage` (or its templates list), paired with a small diagnostic-logging addition in the public app's `getStaticProps` so the next failure mode is visible instead of silent.

---

## Problem Frame

NES-1644 (PR #9174) is the frontend revalidate plumbing. The plumbing works — every revalidate-API call returns 200 in the dev logs, the awaited revalidate inside the preview proxy fires correctly, mutation-success revalidates fire correctly. **But** Siyang's end-to-end manual test (publish → unpublish → publish → click "View the page") reliably returns 404 until `nf start` is restarted. The investigation in this session pinned the cause: it isn't in the revalidate plumbing at all. It's in NES-1547's response-cache configuration on the backend.

The 60s TTL was chosen deliberately at NES-1547 time to cap a cache-poisoning attack vector — a long-TTL null cache would let an attacker pre-poison popular slugs. The comment at `apis/api-journeys-modern/src/yoga.ts:108-115` documents that trade-off explicitly. What the trade-off didn't anticipate is the unpublish→republish cycle producing the same stale-null state as a legitimate workflow, not just an attack. Siyang's reproduction is the canonical worked example.

Until this is fixed, the click-immediately race fix in NES-1644 is unverifiable end-to-end — revalidate succeeds, but the post-revalidate render still serves the cached null. Restart is a non-answer because the bug recurs after every subsequent publish/unpublish cycle.

---

## Requirements

- R1. The publish/unpublish/delete/assign-journey mutations on `TemplateGalleryPage` must invalidate any `templateGalleryPageBySlug` cache entry whose slug matches the mutated page — including entries currently holding `null`.
- R2. The fix must NOT lengthen the existing public-traffic cache hit-rate window (must keep the 60s TTL benefit for normal published-slug reads).
- R3. The fix must NOT re-open the original cache-poisoning vector that the 60s TTL was designed to bound.
- R4. The fix must NOT regress any existing mutation auth, transaction-atomicity, or canonical-re-read semantics in the four target mutations.
- R5. After the fix, the publish → unpublish → publish → View-the-page cycle must serve fresh `published` content within the bounds NES-1644 already documents (≤ a couple of seconds, dominated by the revalidate roundtrip — not by a 60s cache wait).
- R6. The fix must surface diagnostic evidence (server-side) when `getStaticProps` in the public app receives `data?.templateGalleryPageBySlug == null` paired with non-empty `errors[]` — so the next failure mode in this code path doesn't require a session-long forensic re-investigation.
- R7. Test coverage must include at least one assertion per touched mutation that the cache invalidation call fires on the mutation success path AND does not fire on auth-rejected / not-found error paths.

---

## Scope Boundaries

- Not changing the 60s TTL itself — the trade-off documented in `yoga.ts:108-115` stands.
- Not touching `apis/api-gateway/` — gateway has no response-cache plugin and is not part of the failure.
- Not changing `getStaticProps` semantics — same query, same `errorPolicy: 'all'`, same `notFound: true` branch.
- Not adding retry logic to `getStaticProps` (would mask legitimate 404s, amplify load on degraded gateway, risk unbounded latency under ISR rendering timeouts).
- Not adding `Cache-Control: no-cache` to the server-side Apollo client (loses cache benefit on every public render; addressed in Alternatives Considered below).

---

## Context & Research

### Relevant Code and Patterns

- `apis/api-journeys-modern/src/yoga.ts:27` — `export const cache = createInMemoryCache()`. This is the cache reference we need to plumb into mutation resolvers.
- `apis/api-journeys-modern/src/yoga.ts:82-124` — `useResponseCache` plugin config with `Query.templateGalleryPageBySlug: 60_000`. Reference for understanding what gets cached.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPagePublish.mutation.ts` — publish mutation. Currently no cache invalidation.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageUnpublish.mutation.ts` — unpublish mutation. Currently no cache invalidation.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageDelete.mutation.ts` — delete mutation. Currently no cache invalidation.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageAssignJourney.mutation.ts` — assign-journey mutation (drag-end on admin). Currently no cache invalidation. Affects the same query's `templates` field.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageReorderTemplate.mutation.ts` — reorder mutation. Affects ordering of `templates` in cached responses.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageUpdate.mutation.ts` — update mutation (admin edit dialog save). Affects cached metadata.
- `apis/api-journeys-modern/src/schema/builder.ts` — Pothos schema builder. Where context type is defined; needs a `cache` field if we choose the context-plumbing approach.
- `apps/journeys/pages/home/template-gallery/[slug].tsx:101-118` — `getStaticProps` Apollo query + null check. Diagnostic logging additions go here.
- `apps/journeys/src/libs/apolloClient/apolloClient.ts:14-21` — `httpLink` definition. Reference if we need to verify server-side request shape during testing.

### Institutional Learnings

- The 60s TTL on `templateGalleryPageBySlug` was a deliberate security-vs-freshness trade-off, documented in source. Any plan that proposes raising the TTL or removing it must re-justify against that documented threat model.
- The publish/unpublish mutations already use Prisma `$transaction` with `updateMany` predicate-gated idempotence. Cache invalidation should happen AFTER the transaction commits, not inside it — invalidating before the response renders would race against any concurrent read.
- `useResponseCache`'s `cache.invalidate([{ typename, id? }])` API is documented in `@graphql-yoga/plugin-response-cache`. Typename-only invalidation evicts ALL entries that reference any entity of that typename, regardless of whether the entry has the specific entity ID — this is what closes the stale-null gap.
- NES-1648 was a prior fix for the admin-side cache footgun on `templateGalleryPage` / `templateGalleryPages` (set to TTL `0`). The same diagnostic pattern (cached null with no entity ID) is what motivated those zero-TTL choices. The current bug is the public-side equivalent.

### External References

- `@graphql-yoga/plugin-response-cache` README — `invalidate` API surface: `cache.invalidate([{ typename: 'Foo' }, { typename: 'Foo', id: '123' }])`. Supports typename-only and typename+id invalidation. Synchronous in-memory call.

---

## Key Technical Decisions

- **Use typename-level `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` in mutations, not typename+id**. Typename-only is the only form that evicts the null entries (which have no entity ID). Over-invalidation cost is minimal: typename-level eviction clears entries that referenced any `TemplateGalleryPage` entity AND any null-branch entries, which is exactly the scope we need. The next legitimate query repopulates the cache.
- **Invalidate AFTER the Prisma transaction commits, not inside it**. Order: transaction → response object materialised → `cache.invalidate(…)` → return to caller. This prevents a concurrent read from re-populating the cache from pre-commit state. (Pattern: invalidation is the last side-effect on the success path.)
- **Plumb the cache reference into the Pothos context object** rather than importing it directly. The yoga.ts `cache` export is technically importable, but injecting it via context (a) makes it mockable in mutation specs and (b) follows the established pattern (`prisma` is already in context via the same builder).
- **Add diagnostic logging in `getStaticProps`** at the null-result branch — gated on the presence of `errors[]` from Apollo. Cheap (no log spam on the happy path), valuable when this code path fails for a future reason that isn't the cache.
- **Do NOT add `Cache-Control: no-cache` to the server-side Apollo client**. Costs the 60s cache benefit on every public render (the dominant traffic shape) to mitigate a corner case that explicit invalidation handles surgically. The wrong place to spend the perf budget.
- **Do NOT reduce TTL to 1s** (the user's option D). Doesn't actually fix the race — within 1s of a re-publish, the cache can still hold null. And destroys public cache hit-rate.
- **Test coverage uses jest spy on the `cache.invalidate` mock** injected via context. Each mutation spec gains one new assertion. No need to plumb cache state through to test the eviction itself — the cache is a separate library and is already tested by its maintainers.

---

## Open Questions

### Resolved During Planning

- Q: Should this fix bundle into NES-1644 or split into a follow-up ticket? — **Resolved: split**. NES-1644 is frontend-only per spec, and the cache fix touches 5 mutation files in api-journeys-modern plus the Pothos context type. The diagnostic logging in `getStaticProps` is a clean frontend-only addition that _can_ land in NES-1644 since it's a one-block change in code NES-1644 already touches (and offers immediate diagnostic value for future incidents). Recommendation: ship U1 (logging) in NES-1644's existing bundle as a sibling-scope improvement, file U2-U5 as a new Linear ticket (proposed: NES-1672 or next available) targeted at api-journeys-modern.
- Q: Will Vercel preview deploy a fresh `apis/api-journeys-modern`? — **Yes**, Vercel preview builds the full monorepo per deploy. Each preview has its own in-memory cache instance per process. The bug exists in preview the same way it exists in prod — Siyang's local repro generalises.
- Q: Are there other consumers of `templateGalleryPageBySlug` beyond the public renderer? — **No**, search shows only `apps/journeys/src/libs/getTemplateGalleryPage/getTemplateGalleryPage.ts` calls this query (one call site, used by `getStaticProps`). Admin uses the team-scoped `templateGalleryPages(teamId)` and `templateGalleryPage(id)` queries which already have TTL 0 (NES-1648 lesson applied).
- Q: Does Apollo client expose `errors` on the resolved query result? — **Yes**, `apolloClient.query()` returns `{ data, errors, partial, networkStatus, … }`. Destructuring `errors` is documented and stable.

### Deferred to Implementation

- Q: Exact pattern for plumbing `cache` into Pothos context — whether to extend the existing `Context` union type in `apis/api-journeys-modern/src/schema/authScopes.ts` or add cache as a separate optional field. Implementation discovery; not a planning-time blocker.
- Q: Does the reorder mutation (`templateGalleryPageReorderTemplate`) need cache invalidation? It affects the `templates` array ORDER inside `templateGalleryPageBySlug` responses — a published reorder DOES change what viewers see. Implementation should verify and likely include it for safety. Plan covers all six candidate mutations but the reorder case is the least intuitive.

---

## Implementation Units

- U1. **Add diagnostic logging to public-app `getStaticProps`**

**Goal:** When the public-page template-gallery query returns `null` paired with a non-empty `errors[]` array, log a structured warning server-side. Silent failures in this code path have already cost a debugging session; this prevents recurrence.

**Requirements:** R6.

**Dependencies:** None.

**Files:**

- Modify: `apps/journeys/pages/home/template-gallery/[slug].tsx`

**Approach:**

- At the existing `apolloClient.query()` call site, destructure `errors` alongside `data`.
- After the destructure, when `data?.templateGalleryPageBySlug == null`, branch on whether `errors` is non-empty.
- If errors are present, `console.warn('[template-gallery getStaticProps] gql errors', { slug, errors })` — single structured line, picks up in Vercel logs and stage console.
- If no errors AND data is null, fall through to the existing `notFound: true` branch as today (legitimate not-found, no log noise).
- No code-path change to the existing flow. Pure additive logging.

**Patterns to follow:**

- The existing `console.error` pattern in `apps/journeys-admin/pages/api/revalidate-template-gallery.ts:72-74` (`upstream revalidate failed`) — structured object as second arg, deliberate decision to use `error` level only for non-2xx upstream and `warn` level for partial-data branches. Use `warn` here since the legitimate null branch is the much more common case.

**Test scenarios:**

- Happy path: when `data?.templateGalleryPageBySlug` returns a real gallery, no log fires. (Verify via `console.warn` spy returns zero calls.)
- Edge case: when `data?.templateGalleryPageBySlug` is null AND `errors` is undefined (genuine not-found), no log fires. (Spy returns zero calls.)
- Error path: when `data?.templateGalleryPageBySlug` is null AND `errors[]` is non-empty, log fires once with the slug + errors payload. (Spy assertion: called with structured object containing `slug` and `errors`.)

**Verification:**

- The change is bounded to one block in `[slug].tsx` and has no behavioural impact on the page's render output.
- Logging is observed in dev (`pnpm dev`) when a mocked Apollo error scenario is triggered.

---

- U2. **Plumb the in-memory response cache into Pothos resolver context**

**Goal:** Make the `useResponseCache` cache instance (currently encapsulated in `yoga.ts` as a top-level export) reachable from mutation resolvers via the standard Pothos `context` object. Enables U3 and unblocks future cache-aware resolver work without import-acrobatics.

**Requirements:** R4 (no regression to existing mutation semantics — context-additive change only).

**Dependencies:** None.

**Files:**

- Modify: `apis/api-journeys-modern/src/yoga.ts` (export cache + inject into `context`)
- Modify: `apis/api-journeys-modern/src/schema/authScopes.ts` (extend `Context` union type to carry the cache reference)
- Modify: `apis/api-journeys-modern/src/schema/builder.ts` (declare the cache field on the Pothos context type if needed by Pothos's type machinery)

**Approach:**

- The `cache` is already exported from `yoga.ts:27` (`export const cache = createInMemoryCache()`). Confirm import path stability.
- In the `context: async ({ request, params }) => { … }` callback in yoga.ts, add `cache` to the returned context object for all three branches (`authenticated`, `interop`, `public`).
- In `authScopes.ts`, extend the `Context` discriminated-union type so each variant carries `cache: Cache` (using the `Cache` type exported by `@graphql-yoga/plugin-response-cache`).
- The Pothos builder's context generic in `builder.ts` should already pick up the extended `Context` type; verify TypeScript compiles cleanly.
- No runtime behaviour change — only type-system + context-shape change. All existing resolvers continue to work unchanged.

**Patterns to follow:**

- `prisma` is already injected into `Context` and consumed by resolvers — the same pattern, the same injection style.
- Other Yoga + Pothos projects in this monorepo (e.g., look at `apis/api-media/src/schema/` if it follows the same pattern) for confirmation of the canonical approach.

**Test scenarios:**

- Integration: mutation resolver specs that destructure `context.cache` get a non-null cache mock injected via the test harness (no `undefined` errors).
- Type-level: TypeScript compilation of the schema build succeeds with the extended Context type.
- Test expectation: structural — this unit's behaviour change is just exposing the cache reference. Verified transitively via U3 + U4 spec runs.

**Verification:**

- `pnpm nx type-check api-journeys-modern` is clean.
- `pnpm nx lint api-journeys-modern` is clean.
- The existing mutation spec suite passes unchanged (cache reference is present but not yet consumed).

---

- U3. **Add `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` to all six mutation success paths**

**Goal:** Evict any cached `templateGalleryPageBySlug` entries — including null-branch entries — when a mutation lands that could change the public-page rendered state.

**Requirements:** R1, R2, R3, R4, R5.

**Dependencies:** U2 (context.cache must exist).

**Files:**

- Modify: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPagePublish.mutation.ts`
- Modify: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageUnpublish.mutation.ts`
- Modify: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageDelete.mutation.ts`
- Modify: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageAssignJourney.mutation.ts`
- Modify: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageReorderTemplate.mutation.ts`
- Modify: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageUpdate.mutation.ts` (also affects cached metadata — name, description, slug, etc.)

**Approach:**

- After the existing Prisma `$transaction` completes successfully and the canonical re-read returns the post-mutation entity, call `context.cache.invalidate([{ typename: 'TemplateGalleryPage' }])`.
- Place the invalidation call INSIDE the resolver body AFTER the transaction `try` block returns its result and BEFORE the final `return`.
- Auth-rejected and not-found paths must NOT invalidate (they throw before reaching the success path; the new code lives below the throw points).
- Six files, same one-line addition pattern in each. Each will need a matching spec assertion.

**Approach note (the unpublish→publish footgun explicitly addressed):**

- Sequence after the fix: unpublish mutation → transaction commits status=draft → `cache.invalidate(['TemplateGalleryPage'])` evicts the existing-with-entity-id cache entry. Subsequent reads while still draft populate a null entry — no entity ID, can't be invalidated by entity-id-only. **But** the _next_ publish mutation now also calls `cache.invalidate(['TemplateGalleryPage'])` — typename-level — which DOES evict null entries because typename-only invalidation walks the cache by typename presence in the recorded set OR a flag indicating "any entry that mentioned this typename". (Behaviour confirmed by `@graphql-yoga/plugin-response-cache` docs.) The republish therefore clears the null entry; the next read after republish is a cache miss → DB query → returns the published entity → caches normally.

**Patterns to follow:**

- The publish mutation's existing transaction shape is the template — don't restructure it. Add the invalidation as a single line after the transaction `try/catch` block but before the implicit return.
- The Prisma transaction's `findUniqueOrThrow` final step ensures the entity exists post-commit; cache invalidation after this line is guaranteed-safe-to-call.

**Test scenarios for each of the six mutation specs:**

- Happy path (publish on a draft page): mutation succeeds → `cache.invalidate` spy called exactly once with `[{ typename: 'TemplateGalleryPage' }]`.
- Idempotent re-publish (publish on already-published page): mutation succeeds (no-op transition) → `cache.invalidate` spy still called once. Documented decision: even no-op publishes invalidate, since the public cache might be stale for unrelated reasons.
- Auth-rejected path: mutation throws FORBIDDEN → `cache.invalidate` spy never called.
- Not-found path: mutation throws NOT_FOUND → `cache.invalidate` spy never called.
- Race-loss path (P2025 from Prisma): mutation throws NOT_FOUND → `cache.invalidate` spy never called.
- Integration (publish flow): assert that the invalidation call happens AFTER the Prisma transaction completes (test setup: spy on both `prisma.$transaction` and `cache.invalidate`, assert call order).

**Verification:**

- All six mutation specs pass with the new assertions.
- Existing assertions in each spec (transaction shape, auth, error mapping) all still pass — invalidation is additive.

---

- U4. **Add an integration spec that proves the publish → unpublish → publish cycle leaves no stale cache**

**Goal:** Lock in the bug-fix correctness against the actual repro scenario, not just per-mutation unit behaviour. Catches any future regression where typename-only invalidation behaviour might change in `@graphql-yoga/plugin-response-cache`.

**Requirements:** R1, R5, R7.

**Dependencies:** U3.

**Files:**

- Create: `apis/api-journeys-modern/src/schema/templateGalleryPage/responseCacheLifecycle.spec.ts` (new integration spec colocated with the mutation specs)

**Approach:**

- Build a test that wires up the real `useResponseCache` plugin against `createInMemoryCache()` (no mock — the actual library, real behaviour).
- Seed a published `TemplateGalleryPage` row. Query `templateGalleryPageBySlug(slug)`. Assert cache populates (entity-ID branch).
- Run `templateGalleryPageUnpublish` against the same row. Assert cache evicts.
- Query `templateGalleryPageBySlug(slug)` again while draft. Assert cache populates with null (no entity ID).
- Run `templateGalleryPagePublish` against the same row. Assert cache evicts the null entry (this is the critical assertion — it's what the bug-fix proves).
- Query `templateGalleryPageBySlug(slug)` post-republish. Assert it returns the published entity, NOT a stale null.

**Patterns to follow:**

- This is a new spec shape for this repo (existing specs mock `cache`). Reference `@graphql-yoga/plugin-response-cache`'s own test suite for how to wire the plugin against an in-process Yoga server.
- Test setup pattern from `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.spec.ts` for query-side scaffolding.

**Test scenarios:**

- Lifecycle (canonical bug scenario, prefix with "Covers R1, R5"): publish → query → unpublish → query (draft) → publish → query → ALL assertions hold, no stale null served post-republish.
- Edge case: rapid publish → unpublish → publish within 100ms — assert final read still returns the published entity (validates synchronous invalidation).
- Edge case: query → mutate-other-page → query — assert that invalidation of an unrelated `TemplateGalleryPage` does NOT evict the cache entry for our slug (validates we're not over-invalidating across unrelated entities). **Wait — this validates the OPPOSITE of typename-level eviction.** Document the trade-off explicitly: typename-only invalidation DOES evict across entities. This test should assert the cache IS evicted on unrelated mutations (over-invalidation is the trade-off we accept for null-branch correctness). Phrase the test as "validates the documented over-invalidation trade-off."

**Verification:**

- Spec passes. Specifically the post-republish read returns the published entity, not null.
- Running the same spec against `main` (pre-fix code) fails the post-republish assertion. This is a manual one-time verification by the implementer to confirm the test actually catches the bug being fixed.

---

- U5. **Document the explicit invalidation in `yoga.ts`'s cache-config comment**

**Goal:** Update the existing comment at `yoga.ts:108-115` to reflect that the stale-null gap is now closed at the mutation layer, while preserving the original threat-model rationale for the 60s TTL.

**Requirements:** R3 (don't re-open the poisoning vector — the comment should explain WHY the TTL stays).

**Dependencies:** U3.

**Files:**

- Modify: `apis/api-journeys-modern/src/yoga.ts`

**Approach:**

- Append a paragraph to the existing comment block at lines 108-115 noting:
  - The TTL remains at 60s because the cache-poisoning rationale is unchanged.
  - The original concern (null-branch can't be invalidated by entity-ID-only) is now mitigated by explicit `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` calls in the publish/unpublish/delete/assign/reorder/update mutations.
  - Reference NES-1644 for the bug context, the original ticket where Siyang reproduced it.
- No code change — pure documentation.

**Patterns to follow:**

- Comment-as-decision-log pattern already established in `yoga.ts` (lines 92-95, 99-106, 108-115 are all rationale-bearing comments).

**Test scenarios:**

- Test expectation: none — pure documentation change.

**Verification:**

- Comment reads coherently and reflects the new state.

---

## System-Wide Impact

- **Interaction graph:** Touches the response-cache lifecycle. Every read of `templateGalleryPageBySlug` interacts with the cache; every mutation in U3 will now ALSO evict entries with `TemplateGalleryPage` typename. Over-invalidation is intentional and trades a tiny cache-hit-rate hit for null-branch correctness.
- **Error propagation:** Cache.invalidate is synchronous and in-memory; no new failure mode introduced. Mutation success paths now have one additional side-effect after the Prisma transaction — if cache.invalidate somehow throws (unexpected in current in-memory backend), it would surface as a thrown error from the mutation. Acceptable: better to fail loudly than silently leave stale cache.
- **State lifecycle risks:** Invalidation must happen AFTER transaction commit, never before. A concurrent read during the in-flight transaction could re-populate the cache from pre-commit DB state if invalidation ran first. The plan places invalidation after the transaction `try` block returns.
- **API surface parity:** No GraphQL schema change. No client-visible behaviour change. The cache is a pure server-side concern.
- **Integration coverage:** U4's lifecycle spec is the cross-cutting integration test. Without it, we only have unit-level "did invalidate get called" coverage; the lifecycle spec proves the whole chain actually works against the real library.
- **Unchanged invariants:** The publish/unpublish/delete mutations' transaction-atomicity, auth, idempotence, and canonical-re-read shape all stay exactly as today. Cache invalidation is a side-effect appended after the existing success path. The 60s TTL stays. The Pothos `Context` discriminated-union grows by one field (`cache`) — additive, no breaking change to existing resolvers.

---

## Risks & Dependencies

| Risk                                                                                                                                                          | Mitigation                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typename-only invalidation in `useResponseCache` doesn't actually evict null entries (library behaviour differs from docs)                                    | U4's lifecycle spec exercises this directly against the real plugin. Run against `main` to confirm it fails pre-fix, run against the fix branch to confirm it passes.                                                                                                        |
| Over-invalidation: typename-level eviction clears entries for unrelated `TemplateGalleryPage` IDs that are still valid                                        | Acceptable cost: in current traffic (one or two slugs per team), the over-invalidation cost is dominated by the next-read DB query (~ms). Revisit if high-traffic cardinality changes the picture.                                                                           |
| Cache reference plumbed into context might collide with future Pothos schema generation in unexpected ways                                                    | U2 explicitly compiles the schema build + lint as verification. Type-level breakage would surface there. The pattern follows the existing `prisma` injection so the risk is precedented.                                                                                     |
| Pre-existing mutation specs may use a context shape that doesn't have `cache`, breaking on TypeScript strict checks                                           | U2's verification step runs the full mutation spec suite. If specs need to add `cache` to their test context, that's part of U3's work — it's not surprise scope but it is real grunt work. Each spec gets a one-line `cache: createInMemoryCache()` addition in test setup. |
| Diagnostic log in `getStaticProps` (U1) might be noisy under a real upstream incident, swamping the log channel                                               | Log level is `warn`, not `error`. Vercel and stage log dashboards default-filter `info`/`debug` but show `warn` and `error`. Acceptable trade-off — when the channel is "swamped" by warnings, it's because something is wrong and we want to know.                          |
| Scope creep: cache fix lands in NES-1644 instead of a separate ticket, expanding the PR's review surface and CI surface                                       | Plan recommends splitting: only U1 (diagnostic logging, pure frontend) joins NES-1644 as a small sibling improvement. U2-U5 file as a new ticket. The user has explicit authority to override and bundle if review-surface cost is acceptable.                               |
| The `nf start` restart workaround the user has been relying on stops working after deploy because no one will know it's the fix                               | The follow-up ticket should include a comment somewhere visible (likely `yoga.ts`'s updated comment in U5) noting that `nf restart` was the pre-fix workaround. Future debuggers grep for that.                                                                              |
| Vercel preview deploys serve the fix immediately upon merge; if the cache logic regresses in some other resolver pattern, we might think it's our fix's fault | U4's lifecycle spec is the canary. If U4 passes in CI, the regression is downstream.                                                                                                                                                                                         |

---

## Documentation / Operational Notes

- The new Linear ticket (filed for U2-U5) should reference:
  - This plan: `docs/plans/2026-05-14-001-fix-template-gallery-revalidate-cache-invalidation-plan.md`
  - NES-1644's PR #9174 as the surfacing ticket
  - NES-1547 as the ticket that introduced the cache config being fixed
- The PR for the cache fix should call out the trade-off in its description: typename-level invalidation accepts over-eviction in exchange for null-branch correctness.
- After merge: Sharon's QA should re-run the publish → unpublish → publish → View flow on stage. The fix should make that flow return 200 within seconds, not 60+ seconds. Add to QA requirements for NES-1644 stage verification.

---

## Hypothesis Validation (Retrospective)

The original investigation framing carried three live hypotheses. The cache finding settles all three; preserving the lessons here so the next debugger doesn't repeat the path.

- **H1 — Gateway federation race during warm-up:** INVALIDATED. The Hive Gateway has no response-cache plugin (`apis/api-gateway/src/common.config.ts`). The bug persists past any warm-up window (long after gateway readiness). Would have been ruled out faster by reading the gateway config first — three minutes of `cat apis/api-gateway/src/common.config.ts` instead of an hour of debugging.
- **H2 — Apollo Client server-side singleton state:** WRONG LAYER. The journeys-app Apollo client is created fresh per `getStaticProps` call. The actual stateful cache lives one layer further upstream — `apis/api-journeys-modern/src/yoga.ts`'s `useResponseCache` plugin. Would have been caught by reading `yoga.ts` (which Mike Allison and Siyang have both read) with the question "what's the longest-lived in-memory state in this flow?" in mind.
- **H3 — `errorPolicy: 'all'` swallows GraphQL errors:** RULED OUT for this specific bug (no errors in flight — the cache returns clean null), but the diagnostic gap is real and U1 closes it.

The retrospective lesson: when a bug "persists in memory until restart", the next investigation step should be `grep -rn 'createInMemoryCache\|useResponseCache' apis/` before chasing transport or apollo-client hypotheses. In-memory caches are the canonical "needs restart" failure mode.

---

## Sources & References

- This session's investigation (no formal origin document): conversation between Siyang and the agent identifying the cache root cause.
- Related PRs: [#9174 (NES-1644)](https://github.com/JesusFilm/core/pull/9174) — the PR this fix unblocks for end-to-end verification.
- Related code: `apis/api-journeys-modern/src/yoga.ts:82-124` — the response-cache config being patched.
- Related code: `apis/api-journeys-modern/src/schema/templateGalleryPage/*.mutation.ts` — the six mutations getting the invalidation call.
- Related ticket precedent: NES-1648 set `Query.templateGalleryPage` and `Query.templateGalleryPages` to TTL 0 to dodge a similar admin-side footgun. This plan does NOT take that route for the public slug query because the 60s TTL has a documented poisoning-mitigation rationale.
- External: [@graphql-yoga/plugin-response-cache](https://the-guild.dev/graphql/yoga-server/docs/features/response-caching) — `invalidate` API documentation.
