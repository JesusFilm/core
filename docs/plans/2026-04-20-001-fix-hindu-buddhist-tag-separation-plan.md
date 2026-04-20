---
title: 'fix: Separate Hindu/Buddhist tag and fix spelling'
type: fix
status: active
date: 2026-04-20
deepened: 2026-04-20
---

# fix: Separate Hindu/Buddhist tag and fix spelling

## Overview

The Global Template Library surfaces an "Audience" taxonomy whose children include a combined `Hindu/Buddist` tag. The label is offensive to users because it conflates two distinct religions, and "Buddhist" is misspelled. Shannon and Lisa are running a training tomorrow morning with Regional Strategy Leaders' wives where the Audience selector is central to the flow.

This plan:

1. Updates the seed file (`tag.ts`) so that fresh environments create two separate tags — `Hindu` and `Buddhist` — instead of the combined row (source of truth).
2. Ships a one-off, transactional, idempotent migration script that, when run against an existing database, **deletes** the legacy `Hindu/Buddist` row entirely, **creates** fresh `Hindu` and `Buddhist` rows under the `Audience` parent (idempotent via upsert), and **re-tags** every template that had the combined tag with both new tags — so the end state matches what a freshly-seeded database would produce.

The script is the production-side delivery mechanism because the seed worker is gated to non-production environments (see Problem Frame).

## Problem Frame

Melissa (Slack `#nextsteps-bugs`, 2026-04-20): *"Is it possible to get the checkbox in the Global Template Library under 'Audience' that says 'Hindu/Buddist' separated out into two different checkboxes? … These two religions are pushed together. Also, Buddhist is misspelled."*

The Audience tags are seeded by `apis/api-media/src/workers/seed/service/tag/tag.ts` (`seedTags()` → `upsertTag('Audience', [...])`). The frontend (`apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/CategoriesTabPanel`) renders the children of each parent Audience tag dynamically from the `tags` GraphQL query — it does **not** hardcode `Hindu/Buddist`. So the code-level source-of-truth change is purely in the seed file.

**Critical production constraint (verified 2026-04-20):**

- `apis/api-media/src/workers/server.ts:91-98` runs the seed worker **only when `NODE_ENV !== 'production'`**.
- `infrastructure/modules/aws/ecs-task/main.tf:113-117` (and `ecs-task-job/main.tf:89-94`) **hardcode `NODE_ENV=production`** on the api-media ECS task definition. It cannot be overridden without a terraform change.
- `apis/api-media/docker-entrypoint.sh` runs `prisma migrate deploy` followed by `node ./main.js`. Neither step triggers `seedTags()`.
- `apis/api-media/db/seed.ts` (the prisma-seed target) only calls `shortLinkDomain()`, **not** `seedTags()`.
- `nx run api-media:queue-seed` enqueues a BullMQ job, but with no seed worker running in prod, the job sits in the queue forever.

→ **Conclusion:** there is no existing production path that invokes `seedTags()`. The only way to update tag data in prod is a standalone script (or manual SQL). A standalone script is safer, reviewable, tested, and idempotent, so that is the delivery mechanism.

Four templates in production currently carry the `Hindu/Buddist` tag (confirmed with the product team, 2026-04-20).

## Requirements Trace

- R1. **Delete the combined tag.** The `Hindu/Buddist` row must be removed from the `Tag` table so it no longer appears in the Audience dropdown (sourced from `tags` GraphQL query which returns every row unfiltered).
- R2. **Replace with two separate tags.** `Hindu` and `Buddhist` must exist as children of the `Audience` parent, with the correct spelling of `Buddhist`, each with a primary `TagName` in language `529` (English).
- R3. **Migrate template taggings.** Every template that was tagged with `Hindu/Buddist` must end up tagged with both `Hindu` and `Buddhist` separately — not the combined tag and not only one of the two.
- R4. **Fresh environments.** When `seedTags()` runs against an empty database, it must seed `Hindu` and `Buddhist` (not `Hindu/Buddist`).
- R5. **Safe rollout.** The migration must be run against **stage first** and validated end-to-end (UI, DB) before being run against prod.

## Scope Boundaries

- Only the `Hindu/Buddist` entry in the `Audience` list is changed. Other Audience children (`Catholic/Orthodox`, `Atheist/Agnostic`, etc.) are deliberately left as-is.
- Only the English (`languageId: '529'`) `TagName` is created for each new tag. Localized translations are explicitly out of scope — translation teams can add them later via their normal workflow.
- No schema changes to `Tag`, `TagName`, or `Tagging`.
- No frontend changes — tags are loaded dynamically from the `tags` GraphQL query.
- No changes to the seed worker trigger, `NODE_ENV` gating, or Terraform.

### Deferred to Separate Tasks

- Running the migration script against the stage database (post-merge, before prod): deploy/ops step executed by the PR author.
- Running the migration script against the production database: deploy/ops step executed after stage validation passes.

## Context & Research

### Relevant Code and Patterns

- `apis/api-media/src/workers/seed/service/tag/tag.ts` — source of truth for the Audience tag list. Uses `upsert` keyed on `name` with an empty `update: {}`.
- `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` — existing `prismaMock` pattern for seed tests; mirrored for the new `tag.spec.ts`.
- `apis/api-media/src/scripts/update-arcgt-urls.ts` — existing pattern for a one-off data-transformation script. Documented in `apis/api-media/src/scripts/README.md` and registered as `nx run api-media:update-arcgt-urls`.
- `apis/api-media/src/scripts/README.md` — docs convention for new scripts.
- `libs/prisma/media/db/schema.prisma` — `Tag { id, name @unique, parentId, service }`, `TagName { tagId, languageId, value, primary; @@unique([tagId, languageId]) }`, `Tagging { tagId, taggableId, taggableType, context; @@unique([taggableId, taggableType, tagId, context]) }`. `Tagging.tag` has `onDelete: Cascade`, so deleting a `Tag` row cascade-deletes its `Tagging` rows automatically. `TagName.tagId` FK is `ON DELETE RESTRICT` (must delete `TagName` rows before deleting their `Tag`).
- `apis/api-media/src/schema/tag/tag.ts:38-50` — exposes the `tags` GraphQL query as `findMany()` with **no filter**, so any `Tag` row surfaces in the Audience dropdown until deleted.
- `apis/api-media/src/workers/server.ts:91-98` — `NODE_ENV !== 'production'` gate on the seed worker (see Problem Frame).
- `infrastructure/modules/aws/ecs-task/main.tf:113-117` + `ecs-task-job/main.tf:89-94` — `NODE_ENV=production` hardcoded on the ECS task definition.
- `apis/api-media/db/seed.ts` — Prisma seed target; only calls `shortLinkDomain()`.
- `apis/api-media/docker-entrypoint.sh` — production container entrypoint. Runs `prisma migrate deploy` + `node ./main.js`; does not seed.

### Institutional Learnings

- No prior `docs/solutions/` entries touch Tag seeding, splitting taxonomy entries, production data migrations for the media DB, or the `Hindu/Buddist` label.

### External References

- Not required. Task is narrowly scoped.

## Key Technical Decisions

- **Delete-and-create, not rename.** Revised 2026-04-20 after clarifying goals with the product team. User's stated intent is that the old tag is **deleted**, replaced by two **separate** tags. The outcome of this approach matches a freshly-seeded database exactly — new `Tag.id`s for both `Hindu` and `Buddhist`, no vestige of the old row, fresh `Tagging` rows on both new tags. Earlier drafts of this plan recommended a rename to preserve `Tag.id`, but no external system relies on `Tag.id` stability (the GraphQL `tags` query returns current ids per call, frontend caches by name/label), so id preservation adds complexity without adding value.
- **Snapshot Taggings before delete.** `Tagging.tag` is `onDelete: Cascade`, so deleting the old `Tag` row cascade-deletes every `Tagging` pointing at it. The script reads the old tag's taggings into memory **before** deleting, then creates corresponding `Tagging` rows on both `Hindu` and `Buddhist` using the snapshot. This preserves audience targeting on all affected templates.
- **Upsert the two new tags.** Using `tag.upsert({ where: { name }, create: { ... }, update: {} })` means the script works whether or not `Hindu` and `Buddhist` already exist (e.g., from a fresh seed run in a non-prod environment). No pre-collision guard is needed. The same applies to `tagName.upsert`.
- **Single `prisma.$transaction`.** All mutations are wrapped in one interactive transaction so partial state is impossible. If any step throws, the DB returns to its pre-run state.
- **Idempotent by early exit.** The script's first action is `tag.findUnique({ where: { name: 'Hindu/Buddist' } })`. If the row no longer exists, the script logs "already migrated" and returns immediately. Safe to re-run any number of times.
- **English-only `TagName` creation.** The new `Hindu` and `Buddhist` tags get a single `TagName` row each at `languageId: '529'` (English). Localized translations are out of scope; existing localized `TagName` rows for the old tag — if any — are cascade-dropped along with the old `Tag`. If those exist, translation teams can re-add them via their normal workflow post-migration.
- **Delete order respects `ON DELETE RESTRICT`.** `TagName.tagId` FK is `RESTRICT`, so the script deletes `TagName` rows for the old tag before deleting the `Tag` row itself. `Tagging.tag` is `CASCADE`, so `Tagging` rows for the old tag auto-delete with the `Tag` row — no explicit `Tagging.deleteMany` is required.
- **Stage-first rollout.** The script must run on the stage `media` database first and be validated end-to-end (Audience dropdown shows Hindu + Buddhist without Hindu/Buddist; affected templates carry both new tags) before being run on prod. This is encoded in R5 and in the Documentation / Operational Notes section below.

## Open Questions

### Resolved During Planning

- *Q: Should the frontend change?* A: No. `CategoriesTabPanel.tsx` renders children of `Audience` dynamically.
- *Q: Should we add migration logic inside `seedTags()`?* A: No. Production doesn't run the seed; a standalone script is the only viable delivery mechanism.
- *Q: Should the script rename the old row or delete it?* A: Delete, per the clarified requirement that the combined tag is gone entirely. Delete is also semantically cleaner and naturally idempotent (upserts handle repeat runs without special casing).
- *Q: What happens if the script runs twice?* A: First run deletes `Hindu/Buddist`, creates `Hindu` + `Buddhist`, re-tags the affected templates. Second run finds no `Hindu/Buddist` row, logs "already migrated", exits — no further mutations.
- *Q: What happens if `Hindu` or `Buddhist` already exist before the script runs (e.g., a dev environment where the updated seed ran first)?* A: Upsert handles it — the existing rows are reused and the script proceeds to tag the old templates against those existing tags.
- *Q: Do we preserve existing localized `TagName` rows for `Hindu/Buddist`?* A: No. They are cascade-dropped with the old `Tag`. English-only creation is the scope.

### Deferred to Implementation

- Exact `console.log` format (mirror `update-arcgt-urls.ts`).
- Whether to log the count of affected templates or also their `taggableId`s for auditability — lean toward including counts plus a summary list of `taggableId`s so ops can verify post-run.

## Implementation Units

- [x] **Unit 1: Update the Audience seed list** *(already committed on this branch: `147150233`)*

**Goal:** Change `apis/api-media/src/workers/seed/service/tag/tag.ts` so the `Audience` children contain `Hindu` and `Buddhist` instead of `Hindu/Buddist`. Fresh environments then receive the correct tags via the seed.

**Requirements:** R2, R4

**Dependencies:** None.

**Files:**
- Modify: `apis/api-media/src/workers/seed/service/tag/tag.ts`

**Approach:**
- In the `Audience` array passed to `upsertTag`, replace the `'Hindu/Buddist'` string with two entries: `'Hindu'` and `'Buddhist'`, preserving position between `Muslim` and `Atheist/Agnostic`.

**Patterns to follow:**
- The existing array format in the same function.

**Test scenarios:**
- Covered by Unit 2's `tag.spec.ts`.

**Verification:**
- Running the seed locally against a fresh database produces `Hindu` and `Buddhist` tags under `Audience`, no `Hindu/Buddist`.

- [x] **Unit 2: Add a spec for `seedTags`** *(already committed on this branch: `147150233`)*

**Goal:** Lock in the Audience taxonomy via a new `tag.spec.ts` next to `tag.ts`.

**Requirements:** R4

**Dependencies:** Unit 1.

**Files:**
- Create: `apis/api-media/src/workers/seed/service/tag/tag.spec.ts`

**Approach:**
- Mirror `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` structure: import `prismaMock`, call `seedTags()`, assert on `prismaMock.tag.upsert` call arguments.

**Test scenarios:**
- Happy path: `seedTags()` calls `prisma.tag.upsert` with `where: { name: 'Hindu' }`.
- Happy path: `seedTags()` calls `prisma.tag.upsert` with `where: { name: 'Buddhist' }`.
- Regression guard: `seedTags()` never calls `prisma.tag.upsert` with `where: { name: 'Hindu/Buddist' }`.
- Spot-check: `seedTags()` also calls `prisma.tag.upsert` for the parent `Audience`.

**Verification:**
- `npx jest --config apis/api-media/jest.config.ts --no-coverage apis/api-media/src/workers/seed/service/tag/tag.spec.ts` passes.

- [ ] **Unit 3: Rewrite the migration script to delete-and-create**

**Goal:** Replace the currently-committed rename-based migration script with a delete-and-create implementation that matches the clarified requirements (R1, R2, R3). The previous rename approach is semantically close but leaves the old `Tag.id` in place as `Hindu`; the stated goal is for the old row to be fully gone.

**Requirements:** R1, R2, R3, R5

**Dependencies:** None — can run independently of Units 1-2, but ships in the same PR.

**Files:**
- Modify: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.ts` *(currently committed with rename logic; rewrite to delete-and-create)*
- Modify: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` *(currently committed with rename-era tests; rewrite to match new behavior)*
- (No change needed to `apis/api-media/project.json` — the `migrate-hindu-buddhist-tags` nx target is already registered.)

**Approach:**

Wrap everything in one `prisma.$transaction`.

1. `findUnique` the old tag by name. If null → log "already migrated, exiting" and return. Idempotent.
2. `findUnique` the `Audience` parent. If null → throw (indicates an unseeded or wrong database; the transaction will roll back with no changes).
3. Snapshot the old tag's `Tagging` rows into memory (`tagging.findMany({ where: { tagId: oldTag.id } })`). Log the count.
4. `upsert` the `Hindu` tag under `Audience` (`where: { name: 'Hindu' }`). Then `upsert` its primary English `TagName`. Both are idempotent — if the rows already exist from a prior partial run or a fresh seed, the upsert is a no-op.
5. `upsert` the `Buddhist` tag and its primary English `TagName` the same way.
6. If the snapshot is non-empty, `tagging.createMany` two rows per snapshot entry — one pointing at `Hindu`, one pointing at `Buddhist` — preserving `taggableId`, `taggableType`, and `context`. Use `skipDuplicates: true` so partial prior runs or existing Hindu/Buddhist taggings don't fail the insert.
7. Delete the old tag's `TagName` rows (`TagName.tagId` FK is `RESTRICT`, so this must precede the Tag delete).
8. Delete the old `Tag` row. `Tagging.tag` is `CASCADE`, so any remaining old Taggings are removed automatically.
9. Log a summary: how many templates were re-tagged, and confirmation that the old tag is gone.

No collision guards, no rename logic, no filter on `TagName.value` — the delete-and-create model makes those unnecessary.

**Technical design:** *(directional)*

    // Pseudo-steps, not final code
    const oldTag = await tx.tag.findUnique({ where: { name: 'Hindu/Buddist' } })
    if (!oldTag) return // idempotent exit

    const audience = await tx.tag.findUnique({ where: { name: 'Audience' } })
    if (!audience) throw new Error('Audience parent tag missing')

    const oldTaggings = await tx.tagging.findMany({ where: { tagId: oldTag.id } })

    const hindu = await tx.tag.upsert({
      where: { name: 'Hindu' },
      create: { name: 'Hindu', parentId: audience.id },
      update: {},
    })
    await tx.tagName.upsert({
      where: { tagId_languageId: { tagId: hindu.id, languageId: '529' } },
      create: { tagId: hindu.id, value: 'Hindu', languageId: '529', primary: true },
      update: {},
    })

    const buddhist = await tx.tag.upsert({
      where: { name: 'Buddhist' },
      create: { name: 'Buddhist', parentId: audience.id },
      update: {},
    })
    await tx.tagName.upsert({
      where: { tagId_languageId: { tagId: buddhist.id, languageId: '529' } },
      create: { tagId: buddhist.id, value: 'Buddhist', languageId: '529', primary: true },
      update: {},
    })

    if (oldTaggings.length > 0) {
      await tx.tagging.createMany({
        data: oldTaggings.flatMap(t => [
          { taggableId: t.taggableId, taggableType: t.taggableType, context: t.context, tagId: hindu.id },
          { taggableId: t.taggableId, taggableType: t.taggableType, context: t.context, tagId: buddhist.id },
        ]),
        skipDuplicates: true,
      })
    }

    await tx.tagName.deleteMany({ where: { tagId: oldTag.id } })
    await tx.tag.delete({ where: { id: oldTag.id } })

**Patterns to follow:**
- `apis/api-media/src/scripts/update-arcgt-urls.ts` — entry-point structure, `main()` with try/catch + `process.exit(1)`, `prisma.$disconnect()` in `finally`, `require.main === module` guard.
- `apis/api-media/src/workers/seed/service/tag/tag.ts` — `upsert` signatures for `Tag` and `TagName`, primary language id `'529'`.
- Existing spec at `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` — `prismaMock.$transaction.mockImplementation(async (cb: any) => cb(prismaMock))` pattern. Keep the `: any` typing — `Prisma.TransactionClient` narrowing breaks overload resolution against Prisma 7's overloaded `$transaction` signature (verified during the previous review).

**Test scenarios:**

- Happy path (templates present): Given a DB with a `Hindu/Buddist` tag under `Audience` and two `Tagging` rows referencing it, the script upserts `Hindu` and `Buddhist`, creates four new `Tagging` rows (two templates × two new tags), deletes the old `TagName` row(s), and deletes the old `Tag`. Assert: `tag.upsert` called for `Hindu` and `Buddhist` with `parentId: audience.id`; `tagging.createMany` called with 4 entries and `skipDuplicates: true`; `tagName.deleteMany` called with `{ tagId: oldTag.id }`; `tag.delete` called with `{ id: oldTag.id }`.
- Happy path (no templates): Given a DB where `Hindu/Buddist` exists but has zero `Tagging` rows, the script still upserts `Hindu` and `Buddhist` and deletes the old tag. Assert: `tagging.createMany` is **not** called; `tag.delete` is called.
- Happy path (Hindu or Buddhist already exist): Given a DB where the `Hindu` tag already exists (e.g., a dev DB where the updated seed ran first), the script's upsert reuses the existing row. Assert: `tag.upsert` returns the existing `Hindu` tag's id, and subsequent `tagging.createMany` uses that id.
- Idempotency: Running the script twice in a row — the second run finds no `Hindu/Buddist` row and exits immediately. Assert: only `tag.findUnique` is called on the second run; no mutations.
- Error path (missing `Audience`): Given a DB where the `Audience` parent doesn't exist, the script throws with a clear message and applies no changes. Assert: rejected with a message mentioning `"Audience"`; no `tag.upsert`, `tag.delete`, or `tagging.createMany` calls after the throw.
- Regression guard: The script does **not** call `tag.update` (previous rename logic must not survive the rewrite).

**Files for tests:**
- Modify: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts`

**Verification:**
- `npx jest --config apis/api-media/jest.config.ts --no-coverage apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` passes.
- Local dry-run against a dev `media` DB with a `Hindu/Buddist` tag plus 1-2 seeded template Taggings produces the expected end state (old gone, new two exist, taggings on both).

- [ ] **Unit 4: Update the README documentation**

**Goal:** Replace the existing rename-era section in `apis/api-media/src/scripts/README.md` with documentation matching the delete-and-create behavior and the **staging-first rollout procedure** (R5). Include verification SQL queries.

**Requirements:** R5

**Dependencies:** Unit 3.

**Files:**
- Modify: `apis/api-media/src/scripts/README.md`

**Approach:**
- Replace the "Migrate Hindu/Buddhist Tags" section with content covering: Usage, Environment Variables, Process (delete + create + re-tag), Idempotency, Error Handling, and a new **Rollout Procedure** subsection that documents stage-first:
  1. Run `nx run api-media:migrate-hindu-buddhist-tags` against stage `PG_DATABASE_URL_MEDIA`.
  2. Verify: log in to stage admin, open Audience checkbox list → `Hindu/Buddist` absent, `Hindu` + `Buddhist` present. Open each affected stage template and confirm both new tags appear.
  3. Include three verification SQL snippets operators can run against the DB after the script:
     - `SELECT * FROM "Tag" WHERE name = 'Hindu/Buddist';` — must return 0 rows.
     - `SELECT * FROM "Tag" WHERE name IN ('Hindu', 'Buddhist');` — must return 2 rows, both with `parentId` matching the Audience tag.
     - `SELECT "Tagging".* FROM "Tagging" JOIN "Tag" ON "Tag".id = "Tagging"."tagId" WHERE "Tag".name IN ('Hindu', 'Buddhist');` — row count must be exactly 2 × (number of templates that had the old tag).
  4. Only after stage validation passes, re-run the script against prod `PG_DATABASE_URL_MEDIA`.
  5. Repeat the same UI + SQL verifications on prod.

**Patterns to follow:**
- The `## Update Arc.gt URLs Script` section in the same README.

**Test scenarios:**
- Test expectation: none — docs-only change with no behavioral surface.

**Verification:**
- A new team member can follow the README top-to-bottom and complete the stage rollout without external context.

## System-Wide Impact

- **Interaction graph:** The `tags` GraphQL query returns one fewer row (old `Hindu/Buddist` deleted) and two more rows (`Hindu`, `Buddhist`). Net +1 row visible in the Audience dropdown. Consumers (`CategoriesTabPanel.tsx`, publisher page filters) render dynamically and require no code change.
- **Error propagation:** The script runs inside a single `prisma.$transaction` — partial state is impossible. On any throw, the DB rolls back to its pre-run state.
- **State lifecycle risks:** `Tag.id` for `Hindu` and `Buddhist` will be **new UUIDs** after the migration (not the old `Hindu/Buddist` id). Any client that cached tag ids would need to refresh, but no such cache is known — the GraphQL resolver returns ids fresh per call, and the admin UI binds to name/label, not id. If any unknown consumer does cache by id, they would need to re-fetch — flagged as a residual risk below.
- **API surface parity:** None. GraphQL schema is unchanged; only data is mutated.
- **Integration coverage:** Unit tests use prisma mocks; they do not prove the script's transaction semantics against a real DB. Compensated by the mandatory stage dry-run in R5 before prod.
- **Unchanged invariants:**
  - `Audience` parent `Tag` row is not modified.
  - Other `Audience` children are not modified.
  - No schema, GraphQL, or frontend changes.
  - The seed file behavior is independent of the migration script — either can be applied or reverted without the other.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| A consumer caches `Tag.id` externally (currently unknown) and breaks when `Hindu`/`Buddhist` get new ids | Mitigation is the stage rollout (R5): if any cache issue exists, stage will show it before prod. Rollback: the script changes are reversible via an inverse script documented in the README's Rollback section (to be added). |
| The migration is run against prod without first running on stage | R5 mandates stage-first; the README Rollout Procedure calls it out; the PR description will repeat the requirement. |
| Transaction timeout on an unexpectedly large `Tagging` set | Four templates in prod (confirmed). Stage likely has a similar or smaller count. If this assumption breaks, the transaction will roll back and we split `createMany` into batches — a small code change. |
| Someone re-introduces the combined name via a future seed change | Unit 2's spec (`tag.spec.ts`) has a regression guard that fails if `'Hindu/Buddist'` is re-added. |
| Localized `TagName` rows for the old tag (if any) are lost via cascade | Accepted: English-only is in scope; translation team re-adds as needed post-migration. |
| The rename-era committed code does not match the revised plan | Unit 3 explicitly rewrites the script + spec. Existing commits on the branch will be superseded by a new commit from Unit 3's work. |

## Documentation / Operational Notes

- **Rollout order is stage → prod.** Do not run the production migration before stage has been validated end-to-end (UI + SQL).
- **Verification after each run:**
  - Admin UI: Audience checkbox list no longer shows `Hindu/Buddist`; `Hindu` and `Buddhist` appear. Open each affected template and confirm both new tags are attached.
  - SQL: see the three verification queries under Unit 4.
- **Rollback considerations:** If something goes wrong between stage and prod, the transactional boundary means no partial state. If the issue surfaces after a successful run, an inverse migration would recreate the old tag, reattach taggings, and delete `Hindu`/`Buddhist` — tracked in the README's Rollback section but not implemented unless needed.
- **No feature flag, no monitoring changes.**

## Sources & References

- Linear ticket: [NES-1591](https://linear.app/jesus-film-project/issue/NES-1591/separate-hindubuddist-checkbox-and-fix-spelling-error) (Urgent; assignee Jian Wei Chong)
- Slack source: `#nextsteps-bugs` 2026-04-20 — Melissa Immel's message.
- PR: https://github.com/JesusFilm/core/pull/9047 (this branch; Units 1 and 2 committed, Units 3 and 4 to be rewritten per this plan).
- Related code:
  - `apis/api-media/src/workers/seed/service/tag/tag.ts`
  - `apis/api-media/src/workers/seed/service/tag/tag.spec.ts` *(new; committed)*
  - `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.ts` *(to be rewritten — Unit 3)*
  - `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` *(to be rewritten — Unit 3)*
  - `apis/api-media/src/scripts/README.md` *(to be updated — Unit 4)*
  - `apis/api-media/project.json` *(already registers `migrate-hindu-buddhist-tags`; no change)*
  - `apis/api-media/src/scripts/update-arcgt-urls.ts` (script pattern reference)
  - `apis/api-media/src/workers/server.ts` (NODE_ENV gating of seed worker)
  - `infrastructure/modules/aws/ecs-task/main.tf` + `ecs-task-job/main.tf` (hardcoded `NODE_ENV=production`)
  - `apis/api-media/docker-entrypoint.sh` (prod container entrypoint)
  - `apis/api-media/db/seed.ts` (prisma-seed; unrelated to `seedTags()`)
  - `libs/prisma/media/db/schema.prisma` (Tag, TagName, Tagging models + FK behaviors)
  - `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/CategoriesTabPanel/CategoriesTabPanel.tsx` (consumer — no change)
