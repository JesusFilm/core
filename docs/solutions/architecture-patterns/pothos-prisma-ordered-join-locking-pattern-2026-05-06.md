---
title: 'Pothos + Prisma ordered-join-table locking and contiguous-renumber pattern'
date: 2026-05-06
last_updated: 2026-05-11
category: architecture-patterns
module: apis/api-journeys-modern
ticket: NES-1547
problem_type: architecture_pattern
component: database
severity: high
related_components:
  - service_object
  - tooling
applies_when:
  - 'A Pothos + Prisma resolver mutates an ordered join table backing a user-facing list — assign, unassign, reorder, or list-replacement operations'
  - 'The join table carries `@@unique([parentId, order])` (Prisma migrate emits a non-deferrable Postgres unique index by default)'
  - 'Concurrent writes are realistic — multiple admins, browser tabs, React Strict Mode double-mounts, or any path that submits the mutation twice in close succession'
  - 'A frontend reorder UI sends a 0-based display index that must hold even when stored `order` values have grown gappy from earlier assign/unassign churn'
  - 'List-replacement mutations (`Update.journeyIds = [...]` style) must uphold a single-membership invariant — a child row may belong to exactly one parent at a time'
  - 'A public-anonymous resolver returns federated/shareable types whose nested relations would otherwise expose data not intended for anonymous traffic'
tags:
  - pothos
  - prisma
  - postgres
  - graphql
  - ordered-join-table
  - select-for-update
  - row-lock
  - reorder
  - concurrency
  - unique-constraint
  - public-dto
  - federation
  - api-journeys-modern
---

# Pothos + Prisma ordered-join-table locking and contiguous-renumber pattern

## Context

NES-1547 added a `TemplateGalleryPage` Pothos type with a `TemplateGalleryPageTemplate` join row carrying `@@unique([templateGalleryPageId, journeyId])` and `@@unique([templateGalleryPageId, order])`. The surface includes Create/Update/Delete/Publish/Unpublish/AssignJourney/ReorderTemplate mutations on the modern subgraph. Across roughly fifteen iterations we hit four distinct failure modes that all trace back to the same architectural shape — an ordered join table whose `order` column is locally unique per parent, mutated through several mutation paths, in a Pothos resolver layer.

Two reproduced production failure modes prompted this doc. **Concurrent reorders trip the unique constraint** when two transactions both stage a moving row to the same sentinel (we used `order = -1`); the `unique_violation` on `(pageId, -1)` is unmistakable in psql and reproduces deterministically. **Gappy `order` values accumulate** after a few rounds of assign/unassign churn — the live database grew to `{0, 2, 4, 5}` after editorial activity — which silently breaks any reorder protocol that treats the API's `order` argument as an absolute column value rather than a display index. Plus two adjacent failure modes: cross-page moves can deadlock without a lock-ordering rule, and a `Update.journeyIds = [...]` list-replacement can violate single-membership if not guarded.

The fix is structural at the resolver layer — no schema or migration change. The same primitives apply to any ordered join table in this stack.

## Guidance

### 1. Page-level row lock as the first transaction statement

Every mutation that modifies the join table — reorder, assign, unassign, list-replacement — must hold a `SELECT ... FOR UPDATE` on the parent row before any write. The lock serializes concurrent mutations on the same parent and is held until the transaction commits or rolls back. `FOR UPDATE` outside a transaction releases immediately and gives no guarantee.

```ts
// apis/api-journeys-modern/src/schema/templateGalleryPage/applyContiguousOrder.ts
import { Prisma } from '@core/prisma/journeys/client'

export async function lockPage(tx: Prisma.TransactionClient, pageId: string): Promise<void> {
  await tx.$queryRaw`
    SELECT 1 FROM "TemplateGalleryPage"
    WHERE id = ${pageId}
    FOR UPDATE
  `
}
```

Call this first inside every `prisma.$transaction` that touches the join table. The lock is cheap (a single bounded row), and its presence is the load-bearing invariant for everything else in this pattern.

### 2. Sorted lock ordering for cross-parent moves

When a mutation touches two parent rows (e.g. moving a journey from page A to page B), lock both — but in a deterministic order keyed off the parent id. Without this rule, two transactions doing A → B and B → A in parallel deadlock by holding-and-waiting in opposite orders.

```ts
const pagesToLock = (sourcePageId != null && sourcePageId !== pageId ? [pageId, sourcePageId] : [pageId]).sort()
for (const id of pagesToLock) {
  await lockPage(tx, id)
}
// DO NOT parallelise — the sorted-id order IS the deadlock guard.
```

`Promise.all` here re-introduces the deadlock, so the sequential `for ... of` is structural, not stylistic. Either inline a comment forbidding it or extract a `lockPagesInOrder(tx, ids)` helper that bakes the invariant into the call site.

### 3. Reorder API takes a display index, not the stored `order` value

The frontend sends the destination as a 0-based index into the page's current display order. The resolver reads all rows in display order, splices in memory, then writes back contiguous orders 0..N-1. This stays correct regardless of whether stored orders are `{0,1,2,3}` or `{0,2,4,5}` — the display index is computed from the asc-ordered fetch, not the column values.

```ts
const rows = await tx.templateGalleryPageTemplate.findMany({
  where: { templateGalleryPageId: pageId },
  orderBy: { order: 'asc' },
  select: { id: true, journeyId: true }
})
const sourceIndex = rows.findIndex((r) => r.journeyId === journeyId)
const reordered = [...rows]
const [moving] = reordered.splice(sourceIndex, 1)
reordered.splice(newIndex, 0, moving)
await applyContiguousOrder(tx, pageId, reordered)
```

The SDL description must call out that `order` is a display index — `Int!` alone is misleading when stored values may be gappy. Document the contract on the `t.arg.int({ description: ... })` so introspecting clients see it.

### 4. Two-pass write under the lock for renumbering

`@@unique([parentId, order])` is non-deferrable when Prisma generates the index (plain `CREATE UNIQUE INDEX`, no `DEFERRABLE INITIALLY DEFERRED`). Postgres checks the constraint per-row, so a single `SET order = order + 1` over a window collides at the boundary. The fix: stage every row to a unique negative offset in one statement, then write each row's final 0..N-1 position.

```ts
export async function applyContiguousOrder(tx: Prisma.TransactionClient, pageId: string, rowsInOrder: ReadonlyArray<{ id: string }>): Promise<void> {
  await tx.$executeRaw`
    UPDATE "TemplateGalleryPageTemplate"
    SET "order" = -("order") - 1000000
    WHERE "templateGalleryPageId" = ${pageId}
  `
  for (let i = 0; i < rowsInOrder.length; i++) {
    await tx.templateGalleryPageTemplate.update({
      where: { id: rowsInOrder[i].id },
      data: { order: i }
    })
  }
}
```

Caller MUST hold `lockPage` first — without it, two transactions both running the stage UPDATE can collide on overlapping negative ranges. The lock is what makes the sentinel safe.

For high-N callers the per-row update loop is N round trips. A single bulk `UPDATE ... FROM unnest($1::text[], $2::int[])` collapses it to one statement, with the same correctness invariant. Worth doing if pages routinely exceed ~50 rows; keep the simple loop otherwise.

### 5. Renumber after every membership change

Gappy orders (`{0, 2, 4, 5}`) come from delete-without-renumber. The rule: any mutation that adds or removes a join row must run `applyContiguousOrder` on the affected parent before commit. That includes the unassign path of `AssignJourney`, the create-or-move path, and any journey-cascade aftermath. Once gaps exist, the display-index reorder protocol still works (it doesn't care about gaps), but every other consumer that reads `order` directly drifts further from `0..N-1`.

### 6. Single-membership guard on list-replacement mutations

Mutations that replace the join list wholesale (e.g. `Update.journeyIds = [...]`) must check, before `deleteMany + createMany`, that no supplied id is already a member of a different parent. Without this, a race against a concurrent assign of the same id to a different parent leaves the row on both — directly violating the single-membership invariant the assign mutation maintains.

```ts
// inside prisma.$transaction, AFTER lockPage(tx, id):
if (input.journeyIds.length > 0) {
  const conflicting = await tx.templateGalleryPageTemplate.findFirst({
    where: {
      journeyId: { in: input.journeyIds },
      NOT: { templateGalleryPageId: id } // exclude self — re-assigning own rows is fine
    },
    select: { journeyId: true, templateGalleryPageId: true }
  })
  if (conflicting != null) {
    throw new GraphQLError('journey already belongs to another collection', {
      extensions: {
        code: 'CONFLICT',
        field: 'journeyIds',
        journeyId: conflicting.journeyId
      }
    })
  }
}
```

The `NOT` clause keeps the mutation idempotent for re-assigning rows already on the parent being updated.

### 7. Narrow the public-anonymous return type with a dedicated DTO

(Added during Mike's PR review, 2026-05-11 — turned into the seventh load-bearing rule alongside the six concurrency rules above.)

Pothos `prismaObject` types declared as `shareable: true` are anonymously reachable through any public-anonymous resolver that returns them, **and** through every `t.relation` they expose — recursively. In a federated subgraph this is doubly dangerous: when the query plan stays within one subgraph (which Apollo prefers, to minimise hops), the local Pothos `t.relation` auto-resolvers serve the field without any auth scope, even if a sibling subgraph guards the same field with an `optional ability` returning `[]`.

The concrete failure mode on NES-1547: `templateGalleryPageBySlug.templates: [JourneyRef]` made `JourneyRef.userJourneys`, `JourneyRef.team.userTeams`, `Team.integrations.accessSecretPart`, etc. anonymously reachable. The legacy `api-journeys` public query through `journeys(template:true)` had been guarding `userJourneys` / `userTeams` via `@ResolveField + optional ability → []`. The new modern subgraph's unguarded `t.relation` auto-resolvers exposed real rows for the same fields. **Anonymous traffic newly reaching `userTeams` / `userJourneys` is a regression**, not a pre-existing leak.

The fix: return a **dedicated public DTO Pothos type**, not the federated `*Ref`. The DTO is a separate GraphQL type backed by the same Prisma model via Pothos `variant`, exposing only the fields the public renderer consumes.

```ts
// apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryItem.ts
export const TemplateGalleryItemRef = builder.prismaObject('Journey', {
  variant: 'TemplateGalleryItem',
  description: 'Narrow public DTO over Journey — the fields the gallery renderer consumes.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    description: t.exposeString('description', { nullable: true }),
    slug: t.exposeString('slug', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    template: t.exposeBoolean('template', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    website: t.exposeBoolean('website', { nullable: true }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    primaryImageBlock: t.relation('primaryImageBlock', {
      nullable: true,
      type: ImageBlock
    })
  })
})
```

Why `variant: 'TemplateGalleryItem'`: Pothos lets you register multiple GraphQL types backed by the same Prisma model, distinguished by `variant`. Prisma's relation resolution still works (no resolver boilerplate), but the SDL surface is independent — the DTO can omit fields the parent `*Ref` exposes. The supergraph composition shows `type TemplateGalleryItem @join__type(graph: API_JOURNEYS_MODERN)` — single-subgraph ownership, no federation re-exposure.

The audit before merging:

1. **Identify every public-anonymous resolver in your subgraph.** Anything without `t.withAuth(...)`.
2. **For each, walk the type graph** from the return type. List every reachable field, including transitive `t.relation` chains.
3. **Cross-reference with the FE's actual selection set.** Anything the FE doesn't use is a candidate for removal from the public surface.
4. **For `shareable: true` types**, assume the local subgraph's Pothos resolver will serve any field declared on it — not the federation peer's guarded version. The "the other subgraph has an ability check" argument is unreliable.
5. **Default to narrow public DTOs** for any field that returns a federated entity. The cost is one tiny type file per DTO; the win is a bounded, audit-friendly anonymous surface.

Coordinate field names with the FE: as long as the DTO exposes the same field names with the same types as the original `*Ref` for everything the FE selects, the FE GraphQL document does NOT need changes — only the SDL type changes from `[Journey!]` to `[TemplateGalleryItem!]`. The FE selection set is type-agnostic at the selection level.

## Why This Matters

The failure modes here aren't theoretical — they were reproduced live on the journeys DB. Without the lock, concurrent reorders die with `duplicate key value violates unique constraint "TemplateGalleryPageTemplate_templateGalleryPageId_order_key"` and the user sees a 500. Without contiguous renumbering, gaps accumulate over weeks of editorial activity and the reorder UI silently no-ops in ways that look like flaky frontend code. Without the single-membership guard, a journey can end up on two pages simultaneously and the assign mutation's "single membership" comment becomes a lie.

The cost of getting this right is small — one helper file, one row lock, one renumber pass — and the structural shape generalises. Any future ordered join table in this stack should follow the same six rules.

## When to Apply

- A Pothos resolver mutates an ordered join table whose `order` column is locally unique per parent
- The reorder API exposes a destination position to the frontend (display index, not absolute order)
- The same parent can be mutated through multiple paths (assign, unassign, reorder, list-replacement)
- Concurrent writes are realistic — admin tools, public APIs, anything called from a UI without strict serialisation upstream

Skip this pattern only if the join table is append-only with no ordering semantics, or if the parent is hot enough that page-level row locks would cause unacceptable contention (in which case advisory locks via `pg_advisory_xact_lock` are the next step up).

## Examples

Reference implementation in this PR (commit `297e1c3ee` reorder rewrite, `bc0143daf` Update lock + single-membership):

- [`apis/api-journeys-modern/src/schema/templateGalleryPage/applyContiguousOrder.ts`](../../../apis/api-journeys-modern/src/schema/templateGalleryPage/applyContiguousOrder.ts) — `lockPage` + `applyContiguousOrder` helpers
- [`apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageReorderTemplate.mutation.ts`](../../../apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageReorderTemplate.mutation.ts) — display-index protocol, splice + renumber
- [`apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageAssignJourney.mutation.ts`](../../../apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageAssignJourney.mutation.ts) — sorted multi-page lock, renumber-after-mutate, single-membership invariant
- [`apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageUpdate.mutation.ts`](../../../apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageUpdate.mutation.ts) — list-replacement with cross-page conflict guard

### Bonus lessons surfaced during this iteration

These are tangential to the core pattern but worth banking for next time the same module is touched:

- **Generated SDL files are a recurring rebase conflict.** `apis/api-gateway/schema.graphql` (the federation supergraph), `libs/prisma/journeys/src/__generated__/pothos-types.ts`, `apis/api-journeys/src/__generated__/graphql.ts`, and `libs/shared/gql/src/__generated__/graphql-env.d.ts` all conflict on every multi-commit rebase that includes schema work. Set `merge=ours` in `.git/info/attributes` for all four before rebasing, then regenerate from source after the rebase completes. Saves dozens of manual conflict resolutions.
- **`include: { journey: true }` beats `nestedSelection(true)` when an in-memory filter needs a non-exposed scalar.** The Pothos plugin's `nestedSelection(true)` only selects scalars the GraphQL client requested + `t.expose*` fields. If a `resolve` callback compares against a column not exposed on the related type (e.g. `journey.teamId` for a team-isolation filter), `nestedSelection` silently drops it and the filter compares `undefined === <string>` → empty result. `include: { journey: true }` over-fetches but is correct. CodeRabbit caught this at `templateGalleryPage.ts`.
- **Don't add resolved fields for URLs the frontend can build from env.** A `publicUrl: String` resolved field was proposed for agent introspection, then withdrawn because the frontend already had `JOURNEYS_URL`/`NEXT_PUBLIC_*` and could compose `${envBase}/collections/${slug}` locally. Adding the server-side field would have leaked deployment topology into the GraphQL contract.
- **SDL docstring passes are high-leverage.** Adding `description:` to every `t.field`, `t.arg`, and input field across the module took one focused commit and turned the SDL into a self-documenting contract (display-index semantics, slug rules, idempotency, error catalogues with `code` + `field`). An introspecting agent or CodeRabbit pass now sees the protocol, not just the type signatures.
- **Description-only commits are safe to stack on top of correctness fixes.** Keep them as separate commits in the PR — easier to review, easier to revert if needed, and they don't entangle behaviour with documentation in the same diff.
- **Cache the public branch with a finite TTL, not the default `Infinity`.** Yoga's `useResponseCache` invalidates by entity ID. A `null` response (unknown slug, draft, malformed) has no entity ID, so the publish mutation cannot evict it — an attacker can pre-poison popular slugs so legitimate later publishes appear 404 for the cache's lifetime. The admin-side fix lands at TTL 0 (NES-1648, separate doc); the public-side fix is a finite 60 s TTL bounded by the cache-poisoning impact you can tolerate. Both go in `apis/api-journeys-modern/src/yoga.ts:ttlPerSchemaCoordinate`.
- **P2002 on a `String @unique` column survives validation-outside-the-transaction.** When validation runs against `prisma` (not `tx`) before `prisma.$transaction(...)`, two concurrent callers can both pass the slug-uniqueness check, then both attempt the write, then the loser trips the DB unique constraint at commit and surfaces as an unwrapped 500. Catch `Prisma.PrismaClientKnownRequestError` with `code === 'P2002' && error.meta.target.includes('slug')` inside the tx's `update`, re-throw as the same `SlugTakenError` the validation path uses, so the client error shape is consistent regardless of which layer detected the conflict. Defensive: only convert P2002 when the target is the slug column — other P2002s (join-table races) must propagate untouched so the caller sees the real failure.
- **Cheap-fetch-then-auth on read-by-id resolvers.** A by-id GraphQL resolver that spreads the client `query` directly into a `findUnique` pays the full nested template/journey/team walk for callers who'll receive FORBIDDEN. Fix: do a `findUnique({ select: { id: true, teamId: true } })` for the auth check first, then a `findUniqueOrThrow({ ...query })` for the canonical client-selection fetch only after `isInTeam` passes. Mirrors what the Delete mutation already did; should be the standard pattern for any in-team-only resolver.
- **Keep publish-state semantics uniform across mutations.** Reorder originally threw CONFLICT on published pages while Update + AssignJourney accepted them — internally inconsistent. Pick one: either ALL structural mutations gate on `status: 'draft'`, or NONE do. We picked "none — backend accepts unconditionally; FE handles the UX". The asymmetry is the bug, not either side individually.
- **`prisma.$transaction` wraps for intent clarity even when the predicate-protected `updateMany` is already concurrency-safe.** Publish/Unpublish guard concurrent transitions via `where: { id, status: 'draft' | 'published' }`, so the writes are atomic without an explicit transaction. But wrapping the `updateMany + findUniqueOrThrow` re-read in a single tx makes the "atomic transition + canonical re-read" intent obvious in the code rather than relying on the reader spotting the predicate.
- **Squash add-then-drop migrations in the same PR.** Two migrations that compose to "create X, then drop X, add Y" should be one migration "create Y" before merge. Saves a transient FK that never matters in production, and makes the migration history readable as "what did this PR add to schema" rather than "what did this PR add then take away".
- **Curate the reserved-slug list with the full set of framework + product paths.** First slug-reservation list in this repo (verified via `rg -l RESERVED_SLUGS apis/ libs/` — no other model has one). Beyond service routes (`admin`, `api`, `graphql`), include Next.js conventions (`_next`, `_app`, `_document`, `_error`, `favicon-ico`, `robots-txt`, `sitemap-xml`), HTTP error pages (`404`, `500`), and likely-future auth flows (`login`, `signin`, `signup`, `account`, `settings`, `me`). Squat-prevention is cheap; backfilling after a customer claims `/me` is not.
- **Drop dead return-state from helpers that nobody consumes.** `filterToTeamTemplates` returned `{ validIds, droppedCount }` for a hypothetical "we removed N journeys you don't have access to" toast that never shipped. Both callsites only destructured `validIds`. Dead state survives multiple iterations because it's harmless-looking; only an explicit "is this consumed?" pass catches it.

## Related

- [`docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md`](../integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md) — narrow sibling pattern from the same PR (the public-unauthenticated `templateGalleryPageBySlug` query)
- [`docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md`](../logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md) — the Pothos `query` arg / `nestedSelection` trap referenced in lesson #2 above
- [`docs/solutions/security-issues/google-sync-missing-integration-ownership-guard.md`](../security-issues/google-sync-missing-integration-ownership-guard.md) — the existence-vs-ownership pattern that informed the team-scoped validation in earlier iterations of this PR
- PR #9119 (NES-1547 backend Template Gallery Page) — full commit-level archaeology
