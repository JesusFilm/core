---
title: 'Pothos + Prisma ordered-join-table locking and contiguous-renumber pattern'
date: 2026-05-06
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

- **Generated SDL files are a recurring rebase conflict.** `apis/api-gateway/schema.graphql` (the federation supergraph) and `libs/prisma/journeys/src/__generated__/pothos-types.ts` conflict on every multi-commit rebase that includes schema work. Set `merge=ours` in `.git/info/attributes` for both before rebasing, then regenerate from source after the rebase completes. Saves dozens of manual conflict resolutions.
- **`include: { journey: true }` beats `nestedSelection(true)` when an in-memory filter needs a non-exposed scalar.** The Pothos plugin's `nestedSelection(true)` only selects scalars the GraphQL client requested + `t.expose*` fields. If a `resolve` callback compares against a column not exposed on the related type (e.g. `journey.teamId` for a team-isolation filter), `nestedSelection` silently drops it and the filter compares `undefined === <string>` → empty result. `include: { journey: true }` over-fetches but is correct. CodeRabbit caught this at `templateGalleryPage.ts`.
- **Don't add resolved fields for URLs the frontend can build from env.** A `publicUrl: String` resolved field was proposed for agent introspection, then withdrawn because the frontend already had `JOURNEYS_URL`/`NEXT_PUBLIC_*` and could compose `${envBase}/collections/${slug}` locally. Adding the server-side field would have leaked deployment topology into the GraphQL contract.
- **SDL docstring passes are high-leverage.** Adding `description:` to every `t.field`, `t.arg`, and input field across the module took one focused commit and turned the SDL into a self-documenting contract (display-index semantics, slug rules, idempotency, error catalogues with `code` + `field`). An introspecting agent or CodeRabbit pass now sees the protocol, not just the type signatures.
- **Description-only commits are safe to stack on top of correctness fixes.** Keep them as separate commits in the PR — easier to review, easier to revert if needed, and they don't entangle behaviour with documentation in the same diff.

## Related

- [`docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md`](../integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md) — narrow sibling pattern from the same PR (the public-unauthenticated `templateGalleryPageBySlug` query)
- [`docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md`](../logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md) — the Pothos `query` arg / `nestedSelection` trap referenced in lesson #2 above
- [`docs/solutions/security-issues/google-sync-missing-integration-ownership-guard.md`](../security-issues/google-sync-missing-integration-ownership-guard.md) — the existence-vs-ownership pattern that informed the team-scoped validation in earlier iterations of this PR
- PR #9119 (NES-1547 backend Template Gallery Page) — full commit-level archaeology
