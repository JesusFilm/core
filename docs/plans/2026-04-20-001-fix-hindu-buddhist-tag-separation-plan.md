---
title: 'fix: Separate Hindu/Buddhist tag and fix spelling'
type: fix
status: active
date: 2026-04-20
---

# fix: Separate Hindu/Buddhist tag and fix spelling

## Overview

The Global Template Library surfaces an "Audience" taxonomy whose children include a combined `Hindu/Buddist` tag. The label is offensive to users because it conflates two distinct religions, and "Buddhist" is misspelled. Shannon and Lisa are running a training tomorrow morning with Regional Strategy Leaders' wives where the Audience selector is central to the flow, so the offensive label must be gone before then.

This plan splits the single combined tag into two separate tags — `Hindu` and `Buddhist` — in both the seed file (source of truth) and in the production database (one-time migration via a standalone script).

## Problem Frame

Melissa (Slack `#nextsteps-bugs`, 2026-04-20): _"Is it possible to get the checkbox in the Global Template Library under 'Audience' that says 'Hindu/Buddist' separated out into two different checkboxes? … These two religions are pushed together. Also, Buddhist is misspelled."_

The Audience tags are seeded by `apis/api-media/src/workers/seed/service/tag/tag.ts` (`seedTags` → `upsertTag('Audience', [...])`). The frontend (`apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/CategoriesTabPanel`) renders the children of each parent Audience tag dynamically — it does **not** hardcode `Hindu/Buddist`. So the code-level fix is purely in the seed file.

However, `apis/api-media/src/workers/server.ts` (lines 91-98) runs the seed worker **only when `NODE_ENV !== 'production'`**. That means:

- New/local environments will pick up the fix via the seed.
- The production database already contains a `Tag` row with `name = 'Hindu/Buddist'` and existing `Tagging` rows that reference it. Changing the seed alone will **not** change production data. A one-off migration is required.

## Requirements Trace

- R1. The Global Template Library's Audience taxonomy must no longer display `Hindu/Buddist` — it must display `Hindu` and `Buddhist` as two separate checkboxes (source: Melissa's Slack message + NES-1591 description).
- R2. The word `Buddhist` must be spelled correctly (not `Buddist`).
- R3. Templates currently tagged with `Hindu/Buddist` must retain audience targeting — after migration they should be tagged with both `Hindu` and `Buddhist` so existing filter behavior is preserved (implicit requirement: do not silently lose data).
- R4. Fresh (non-production) environments that run the seed must create the new tags correctly.

## Scope Boundaries

- Only the `Hindu/Buddist` entry in the `Audience` list is changed. Other Audience children (`Catholic/Orthodox`, `Atheist/Agnostic`, etc.) are deliberately left as-is; they are out of scope.
- No schema changes to `Tag`, `TagName`, or `Tagging`.
- No frontend changes — tags are loaded dynamically from `tags` query.
- No changes to the seed worker's trigger (still local/dev only).

### Deferred to Separate Tasks

- Running the migration script against the production `media` database: a post-merge deploy/ops step handled by the PR author after merge. Not part of the code deliverable.

## Context & Research

### Relevant Code and Patterns

- `apis/api-media/src/workers/seed/service/tag/tag.ts` — source of truth for the Audience tag list. Uses `upsert` keyed on `name` with an empty `update: {}`, so renaming in the seed alone does not rename the row in an existing database.
- `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` — existing `prismaMock` pattern for seed tests; mirror this structure for the new `tag.spec.ts`.
- `apis/api-media/src/scripts/update-arcgt-urls.ts` — existing pattern for a one-off data-transformation script. Documented in `apis/api-media/src/scripts/README.md` and registered as `nx run api-media:update-arcgt-urls`. This is the right shape for the production migration.
- `apis/api-media/src/scripts/README.md` — docs convention for new scripts.
- `libs/prisma/media/db/schema.prisma` — `Tag { id, name @unique, parentId, service }`, `TagName { tagId, languageId, value, primary }`, `Tagging { tagId, taggableId, taggableType, context }`. `Tagging.tag` has `onDelete: Cascade`, so deleting a `Tag` row silently drops its `Tagging`s — another reason we rename rather than delete.
- `apis/api-media/src/schema/tag/tag.ts` — exposes `tags` query; no code-level references to specific tag names.

### Institutional Learnings

- No prior `docs/solutions/` entries touch Tag seeding, splitting taxonomy entries, or `Hindu/Buddist`.

### External References

- Not required. Task is narrowly scoped; no new library or framework guidance needed.

## Key Technical Decisions

- **Rename the existing row in production rather than delete-and-recreate.** The old `Hindu/Buddist` row has `Taggings` attached. If we delete it, those `Tagging`s cascade-delete and templates silently lose audience targeting. Renaming preserves references.
- **Map the renamed row to `Hindu` (not `Buddhist`).** Either choice is fine mechanically; `Hindu` is alphabetically first and matches the left-to-right reading of the old label. Arbitrary but consistent.
- **Copy, don't move, Taggings.** For every `Tagging` on the old row (now `Hindu`), duplicate it onto the new `Buddhist` row so a template previously tagged `Hindu/Buddist` is tagged with both new values — preserving the original ambiguous intent without guessing.
- **Keep the migration as a standalone script, not seed-embedded logic.** Production never runs the seed; embedding migration-only logic in the seed pollutes the seed's role as a source of truth. A standalone script mirrors `update-arcgt-urls.ts` and is a one-time run.
- **Make the script idempotent.** After it runs, re-running it is a no-op (old tag no longer exists → exit early). This matches `update-arcgt-urls.ts`'s behavior.
- **Default Audience children have `service = undefined`.** `upsertTag('Audience', [...])` is called without a `service` argument, so `Hindu` (the renamed row) and `Buddhist` (the new row) should have `service = NULL` — matching the other Audience children. The migration script must not set `service`.

## Open Questions

### Resolved During Planning

- _Q: Should the frontend change?_ A: No. `CategoriesTabPanel.tsx` renders children of `Audience` dynamically from the `tags` GraphQL query — no hardcoded labels.
- _Q: Should we add migration logic inside `seedTags`?_ A: No — production doesn't run the seed, and dev environments will either be fresh (no old tag) or can run the same standalone script locally if needed.
- _Q: What happens if the script runs twice?_ A: The first run renames `Hindu/Buddist` → `Hindu`. On the second run, `findUnique({ name: 'Hindu/Buddist' })` returns null and the script exits early — idempotent.

### Deferred to Implementation

- Exact `console.log` / progress output format (mirror `update-arcgt-urls.ts`).
- Whether to wrap the migration in a single `prisma.$transaction` — lean yes for atomicity, confirm during implementation.

## Implementation Units

- [ ] **Unit 1: Update the Audience seed list**

**Goal:** Change `apis/api-media/src/workers/seed/service/tag/tag.ts` so the `Audience` children contain `Hindu` and `Buddhist` instead of `Hindu/Buddist`. New/fresh environments (local dev, CI test DBs) then receive the correct tags.

**Requirements:** R1, R2, R4

**Dependencies:** None.

**Files:**

- Modify: `apis/api-media/src/workers/seed/service/tag/tag.ts`

**Approach:**

- In the `Audience` array passed to `upsertTag`, replace the `'Hindu/Buddist'` string with two entries: `'Hindu'` and `'Buddhist'`.
- Preserve the position in the array (between `Muslim` and `Atheist/Agnostic`) to minimize diff noise.
- No changes to other Audience entries or other parent tags.

**Patterns to follow:**

- The existing array format in the same function.

**Test scenarios:**

- Covered by Unit 2's `tag.spec.ts` — Happy path: `seedTags()` upserts a `Hindu` and `Buddhist` tag as children of `Audience`, and does not upsert any `Hindu/Buddist` tag.

**Verification:**

- Source file diff shows only the Audience list entry change.
- Running the seed locally against a fresh database produces `Hindu` and `Buddhist` tags under `Audience`, no `Hindu/Buddist`.

- [ ] **Unit 2: Add a spec for `seedTags`**

**Goal:** Lock in the Audience taxonomy via a new `tag.spec.ts` next to `tag.ts`. Guards against accidental regressions and closes an existing gap — there is currently no unit test for `seedTags` (`service.spec.ts` mocks it).

**Requirements:** R4

**Dependencies:** Unit 1.

**Files:**

- Create: `apis/api-media/src/workers/seed/service/tag/tag.spec.ts`
- Modify (if needed for mock availability): none expected; `test/prismaMock.ts` already exists and is used by `taxonomy.spec.ts`.

**Approach:**

- Mirror `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` structure: import `prismaMock`, call `seedTags()`, assert on `prismaMock.tag.upsert` / `prismaMock.tagName.upsert` call arguments.
- Because `upsertTag` upserts parent-then-children recursively, assertions should focus on observable outcomes rather than exact call counts: that `tag.upsert` was called with `name: 'Hindu'` and `name: 'Buddhist'`, and was **not** called with `name: 'Hindu/Buddist'`.

**Execution note:** Test-first is not required, but the test should be added in the same PR — not a follow-up.

**Patterns to follow:**

- `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` — `prismaMock` usage, `describe`/`it` structure, absence of a real DB.

**Test scenarios:**

- Happy path: `seedTags()` calls `prisma.tag.upsert` with `where: { name: 'Hindu' }` (parent `Audience`).
- Happy path: `seedTags()` calls `prisma.tag.upsert` with `where: { name: 'Buddhist' }` (parent `Audience`).
- Regression guard: `seedTags()` never calls `prisma.tag.upsert` with `where: { name: 'Hindu/Buddist' }`.
- Happy path: `seedTags()` also calls `prisma.tag.upsert` for the parent `Audience` (spot-check to confirm parent chain still runs).

**Verification:**

- `npx jest --config apis/api-media/jest.config.ts --no-coverage apis/api-media/src/workers/seed/service/tag/tag.spec.ts` passes.
- The spec fails if Unit 1 is reverted.

- [ ] **Unit 3: Production data migration script**

**Goal:** Provide a one-off, idempotent script that renames the existing `Hindu/Buddist` tag row to `Hindu`, creates a new `Buddhist` tag row under the same `Audience` parent, and copies every `Tagging` from the renamed `Hindu` row to the new `Buddhist` row — so existing tagged templates end up tagged with both new values.

**Requirements:** R1, R2, R3

**Dependencies:** None directly (can run independently of Unit 1), but is shipped with the same PR.

**Files:**

- Create: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.ts`
- Modify: `apis/api-media/src/scripts/README.md` (add a section documenting the new script)
- Modify: `apis/api-media/project.json` (register a new `migrate-hindu-buddhist-tags` target mirroring `update-arcgt-urls`)

**Approach:**

Structure the script exactly like `apis/api-media/src/scripts/update-arcgt-urls.ts`:

1. Log a start banner.
2. Wrap the mutations in `prisma.$transaction` for atomicity.
3. Look up the existing row: `prisma.tag.findUnique({ where: { name: 'Hindu/Buddist' } })`.
   - If `null`, log "already migrated, exiting" and return (idempotent).
4. Look up the `Audience` parent: `prisma.tag.findUnique({ where: { name: 'Audience' } })`. If missing, abort with an error (this is an unexpected state; the DB is not a valid seeded media DB).
5. Rename the existing row:
   - `prisma.tag.update({ where: { id: oldTag.id }, data: { name: 'Hindu' } })`.
   - `prisma.tagName.updateMany({ where: { tagId: oldTag.id, value: 'Hindu/Buddist' }, data: { value: 'Hindu' } })`.
6. Upsert the new row under the same parent:
   - `prisma.tag.upsert({ where: { name: 'Buddhist' }, create: { name: 'Buddhist', parentId: audience.id }, update: {} })`.
   - `prisma.tagName.upsert({ where: { tagId_languageId: { tagId: buddhist.id, languageId: '529' } }, create: { tagId: buddhist.id, languageId: '529', value: 'Buddhist', primary: true }, update: {} })`.
7. Copy taggings:
   - `findMany` on `prisma.tagging` where `tagId = oldTag.id` (now the Hindu row).
   - `createMany` with `{ taggableId, taggableType, context, tagId: buddhist.id }` per row, `skipDuplicates: true` to stay idempotent against partial prior runs.
8. Log counts at each step. Exit non-zero on exception.

**Execution note:** Implement defensively (findUnique null-checks, try/catch with exit code), mirroring `update-arcgt-urls.ts`.

**Technical design:** _(directional)_

    // Pseudo-steps, not final code
    const old = await tx.tag.findUnique({ where: { name: 'Hindu/Buddist' } })
    if (!old) return
    const audience = await tx.tag.findUnique({ where: { name: 'Audience' } })
    await tx.tag.update({ where: { id: old.id }, data: { name: 'Hindu' } })
    await tx.tagName.updateMany({ where: { tagId: old.id, value: 'Hindu/Buddist' }, data: { value: 'Hindu' } })
    const buddhist = await tx.tag.upsert({
      where: { name: 'Buddhist' },
      create: { name: 'Buddhist', parentId: audience.id },
      update: {}
    })
    await tx.tagName.upsert({
      where: { tagId_languageId: { tagId: buddhist.id, languageId: '529' } },
      create: { tagId: buddhist.id, languageId: '529', value: 'Buddhist', primary: true },
      update: {}
    })
    const existing = await tx.tagging.findMany({ where: { tagId: old.id } })
    if (existing.length > 0) {
      await tx.tagging.createMany({
        data: existing.map(t => ({
          taggableId: t.taggableId,
          taggableType: t.taggableType,
          context: t.context,
          tagId: buddhist.id,
        })),
        skipDuplicates: true,
      })
    }

**Patterns to follow:**

- `apis/api-media/src/scripts/update-arcgt-urls.ts` — entry-point structure, logging, prisma import path, exit-code handling.
- `apis/api-media/src/workers/seed/service/tag/tag.ts` — `upsert` signatures for `tag` and `tagName` (language `'529'`, `primary: true`).

**Test scenarios:**

- Happy path: Given a DB with a `Hindu/Buddist` tag under `Audience` with two `Tagging` rows, the script renames the tag to `Hindu`, creates a new `Buddhist` tag, and produces two matching `Tagging` rows on `Buddhist`. Assert: the `Tag` table now has `Hindu` and `Buddhist` under `Audience` and no row named `Hindu/Buddist`; `Tagging` count on the new `Buddhist` tag equals the count that was on `Hindu/Buddist` before the run.
- Happy path: `TagName` row for the renamed tag now has `value = 'Hindu'` (spelling fix visible at the display layer).
- Happy path: `TagName` row for `Buddhist` has `value = 'Buddhist'`, `languageId = '529'`, `primary = true`.
- Edge case (idempotency): Running the script twice in a row — the second run finds no `Hindu/Buddist` row and exits cleanly with no mutations. Assert: row counts and IDs are unchanged between the second run and the state after the first run.
- Edge case (no taggings): Running against a DB where the old tag has zero `Tagging` rows — script succeeds, new `Buddhist` tag exists with no `Tagging`s.
- Error path (missing `Audience`): Running against a DB without an `Audience` parent tag — script throws with a clear error message and does not partially apply changes (transaction rollback).

**Files for tests:**

- Create: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` — mirror `update-arcgt-urls` style if a spec exists; otherwise use `prismaMock`.

**Verification:**

- `npx jest --config apis/api-media/jest.config.ts --no-coverage apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` passes.
- `nx run api-media:migrate-hindu-buddhist-tags` target is registered in `project.json` and runs the script via ts-node (same mechanism as `update-arcgt-urls`).
- Manual dry run against a local `media` DB with a seeded `Hindu/Buddist` tag produces the expected shape.

- [ ] **Unit 4: Documentation updates**

**Goal:** Document the new script in `apis/api-media/src/scripts/README.md` so the ops operator running it in production has a single source of truth for how/why.

**Requirements:** R3 (enables the production run).

**Dependencies:** Unit 3.

**Files:**

- Modify: `apis/api-media/src/scripts/README.md`

**Approach:**

- Add a section titled `## Migrate Hindu/Buddhist Tags` following the same structure as existing entries (Usage, Environment Variables, Process, Idempotency, Error Handling).
- State that this is a one-off production script, note that it is safe to run multiple times, and document the env var `PG_DATABASE_URL_MEDIA`.

**Patterns to follow:**

- The `## Update Arc.gt URLs Script` section in the same README.

**Test scenarios:**

- Test expectation: none — docs-only change with no behavioral surface.

**Verification:**

- Running the script with the command in the README works end-to-end against a local DB.

## System-Wide Impact

- **Interaction graph:** The `tags` GraphQL query will return one additional row after the migration (split of one into two). Consumers: the Global Template Library UI (`CategoriesTabPanel`) and any downstream template filtering. Because those consumers render dynamically, no code change is needed.
- **Error propagation:** The script uses a single `prisma.$transaction` so partial state is impossible.
- **State lifecycle risks:** If the migration is run against a DB that has already had the old tag manually renamed to `Hindu` but no `Buddhist` created, the script's `findUnique('Hindu/Buddist')` returns null and it exits early — operator would need to finish the cleanup manually. This is an acceptable edge case because production is controlled.
- **API surface parity:** None. Tag IDs remain stable across the rename; template `Tagging` rows are not touched on the renamed row.
- **Integration coverage:** The seed spec (Unit 2) covers the source-of-truth side; the script spec (Unit 3) covers the migration side with prisma mocks. A manual smoke test against a local seeded DB is recommended before running in production.
- **Unchanged invariants:**
  - `Tag.id` for the original `Hindu/Buddist` row is preserved (only `name` changes).
  - `parentId` chain under `Audience` is preserved.
  - Other Audience children are untouched.

## Risks & Dependencies

| Risk                                                                           | Mitigation                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running the migration against production without testing locally first         | Ship the spec and a local dry-run step in the README; run against a local seeded DB before production.                                                                                                          |
| Someone re-introduces the old tag by running the pre-change seed               | The seed change in Unit 1 removes the old value permanently from source. Unit 2's spec will fail if anyone re-adds it.                                                                                          |
| Transaction hits a production timeout for DBs with very large `Tagging` counts | `Tagging` rows per tag are expected to be in the low hundreds at most (template count). Acceptable. If this turns out to be wrong in production, split the `createMany` into batches — defer to execution-time. |
| Migration is forgotten and only the seed ships                                 | Call out in the PR description that the script needs to be run against production post-merge, before Shannon/Lisa's training.                                                                                   |

## Documentation / Operational Notes

- Post-merge, run `nx run api-media:migrate-hindu-buddhist-tags` against the production `media` database with `PG_DATABASE_URL_MEDIA` pointed at prod.
- Verify in the Global Template Library that `Hindu/Buddist` no longer appears and both `Hindu` and `Buddhist` do.
- No monitoring or feature-flag considerations.

## Sources & References

- Linear ticket: [NES-1591](https://linear.app/jesus-film-project/issue/NES-1591/separate-hindubuddist-checkbox-and-fix-spelling-error) (Urgent; assignee Jian Wei Chong)
- Slack source: `#nextsteps-bugs` 2026-04-20 — Melissa Immel's message asking for the separation before the training.
- Related code:
  - `apis/api-media/src/workers/seed/service/tag/tag.ts`
  - `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` (test pattern)
  - `apis/api-media/src/workers/server.ts` (production-gating of seed worker)
  - `apis/api-media/src/scripts/update-arcgt-urls.ts` (script pattern)
  - `apis/api-media/src/scripts/README.md`
  - `libs/prisma/media/db/schema.prisma` (Tag, TagName, Tagging models)
  - `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/CategoriesTabPanel/CategoriesTabPanel.tsx` (consumer — no change)
