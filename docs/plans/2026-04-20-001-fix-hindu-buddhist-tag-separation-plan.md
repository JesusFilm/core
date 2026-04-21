---
title: 'fix: Separate Hindu/Buddhist tag and fix spelling'
type: fix
status: active
date: 2026-04-20
deepened: 2026-04-21
---

# fix: Separate Hindu/Buddhist tag and fix spelling

## Overview

The Global Template Library surfaces an "Audience" taxonomy whose children include a combined `Hindu/Buddist` tag. The label is offensive to users because it conflates two distinct religions, and "Buddhist" is misspelled. Shannon and Lisa are running a training with Regional Strategy Leaders' wives where the Audience selector is central to the flow.

This plan:

1. Updates the seed file (`tag.ts`) so fresh environments create two separate tags — `Hindu` and `Buddhist` — instead of the combined row (source of truth for future re-seeds).
2. Ships **two** one-off migration scripts that, together, make the existing database converge on the same shape a freshly-seeded DB would have:
   - **Script 1 — api-media:** renames the legacy `Hindu/Buddist` `Tag` row to `Hindu` (preserving `Tag.id`) and upserts a new `Buddhist` `Tag` under the `Audience` parent. Media DB only.
   - **Script 2 — api-journeys-modern:** for every journey currently linked to the (renamed) Hindu tag via `JourneyTag`, adds a matching `JourneyTag` pointing at Buddhist. Reads tag IDs from media DB by name; writes to journeys DB.

Scripts must run in sequence: **Script 1 first, then Script 2**. Both are idempotent and each is wrapped in its own single-client `prisma.$transaction`.

## Problem Frame

Melissa (Slack `#nextsteps-bugs`, 2026-04-20): _"Is it possible to get the checkbox in the Global Template Library under 'Audience' that says 'Hindu/Buddist' separated out into two different checkboxes? … These two religions are pushed together. Also, Buddhist is misspelled."_

### How the data actually works — verified 2026-04-21

The admin UI surfaces Audience options from the `tags` GraphQL query, which reads the `Tag` table in the **media** database (`libs/prisma/media/db/schema.prisma`). When a user associates a tag with a template, the write path is `apis/api-journeys/src/app/modules/journey/journey.resolver.ts:797-805` — it writes to the `JourneyTag` table in the **journeys** database. `JourneyTag.tagId` is a plain `String` carrying the media-DB `Tag.id` as a bare cross-DB reference (no FK, no integrity enforcement).

The `Tagging` table in the media DB is **dormant legacy**. The schema defines the model but **no application code anywhere in `apis/`, `apps/`, or `libs/` writes to it**. Any migration that only touches `media.Tagging` will leave production template-tag relationships unchanged. A correct migration must touch `journeys.JourneyTag` instead (or in addition).

Four templates in production currently carry the `Hindu/Buddist` tag (confirmed with product team, 2026-04-20).

### Why the seed can't do the job in prod

`apis/api-media/src/workers/server.ts:91-98` runs the seed worker **only when `NODE_ENV !== 'production'`**. Both `infrastructure/modules/aws/ecs-task/main.tf:113-117` and `ecs-task-job/main.tf:89-94` hardcode `NODE_ENV=production` on the media ECS task definition. The Prisma seed target (`apis/api-media/db/seed.ts`) only calls `shortLinkDomain()` — nothing that invokes `seedTags()`. `nx run api-media:queue-seed` enqueues a BullMQ job that no prod worker consumes.

→ **Only a standalone, tested script can update tag state in prod.**

## Requirements Trace

- R1. **Remove the combined label from the dropdown.** After migration, no tag in the Audience taxonomy is labeled `Hindu/Buddist`.
- R2. **Replace with two separate tags.** `Hindu` and `Buddhist` exist as children of the `Audience` parent, with the spelling `Buddhist` correct, each with a primary `TagName` in language `529` (English).
- R3. **Migrate template taggings.** Every journey that was linked to `Hindu/Buddist` ends up linked to **both** `Hindu` and `Buddhist` via `JourneyTag` — not the combined tag, not just one.
- R4. **Fresh environments.** When `seedTags()` runs against an empty database, it seeds `Hindu` and `Buddhist` (not `Hindu/Buddist`).
- R5. **Safe rollout.** Both scripts run against **stage first** and are validated end-to-end (UI + DB) before prod.

## Scope Boundaries

- Only the `Hindu/Buddist` entry in the `Audience` seed list is changed. Other Audience children (`Catholic/Orthodox`, `Atheist/Agnostic`, etc.) are untouched.
- Only the primary English (`languageId: '529'`) `TagName` is updated/created. Non-English localized `TagName` rows — if any exist — are intentionally left in place (the legacy English row is renamed; non-English rows keep their existing localized values attached to the renamed tag). Translation teams may add `Buddhist` translations via their normal workflow. See verification SQL in the README for how to inspect existing localized rows.
- The dormant `media.Tagging` table is explicitly **not** touched. Future maintainers should not re-introduce it.
- No schema changes to `Tag`, `TagName`, `JourneyTag`, `Tagging`, or any other table.
- No frontend changes — tags are loaded dynamically from the `tags` GraphQL query and `journey.journeyTags`.
- No changes to the seed worker trigger, `NODE_ENV` gating, or Terraform.

### Deferred to Separate Tasks

- Running Script 1 and Script 2 against the **stage** databases (post-merge, before prod): ops step executed by the PR author / senior engineer.
- Running Script 1 and Script 2 against the **production** databases: ops step executed after stage validation passes.
- **Optional future PR split.** For now, both scripts live on this PR with `tag.ts`. The user may later move the scripts to a separate throwaway PR so they don't remain in `main` after execution. That split is a follow-up housekeeping task, not a blocker for this work.

## Context & Research

### Relevant Code and Patterns

- `apis/api-media/src/workers/seed/service/tag/tag.ts` — source of truth for the Audience tag list.
- `apis/api-media/src/workers/seed/service/taxonomy/taxonomy.spec.ts` — existing `prismaMock` pattern for seed tests; mirrored for the new `tag.spec.ts`.
- `apis/api-media/src/scripts/update-arcgt-urls.ts` — one-off script pattern for api-media: `main()` with try/catch + `process.exit(1)`, `prisma.$disconnect()` in `finally`, `require.main === module` guard.
- `apis/api-media/src/scripts/README.md` — docs convention for api-media scripts.
- `apis/api-journeys-modern/src/scripts/fix-cross-team-visitors.ts` — existing cross-DB-aware one-off script pattern in api-journeys-modern: dry-run default with `--apply` flag, per-record logging, summary stats, structured result objects.
- `apis/api-journeys-modern/src/scripts/fix-cross-team-visitors.spec.ts` + `apis/api-journeys-modern/test/prismaMock.ts` — existing spec/mock pattern for api-journeys-modern scripts.
- `apis/api-journeys/src/app/modules/journey/journey.resolver.ts:797-805` — canonical write path for `JourneyTag`: `tx.journeyTag.deleteMany({ where: { journeyId } })` followed by `tx.journeyTag.createMany({ data: tagIds.map(tagId => ({ journeyId, tagId })) })`.
- `libs/prisma/journeys/db/schema.prisma` — `JourneyTag { id, tagId, journeyId; @@unique([journeyId, tagId]) }` (no FK on `tagId`; cross-DB reference to `media.Tag.id`).
- `libs/prisma/media/db/schema.prisma` — `Tag { id, name @unique, parentId, service }`, `TagName { tagId, languageId, value, primary; @@unique([tagId, languageId]) }`. `TagName.tagId` FK is `ON DELETE RESTRICT`.
- `apis/api-media/src/schema/tag/tag.ts:38-50` — exposes the `tags` GraphQL query as `findMany()` unfiltered. Any `Tag` row in media surfaces in the Audience dropdown until deleted.
- `apis/api-media/src/workers/server.ts:91-98` — `NODE_ENV !== 'production'` gate on the seed worker.
- `infrastructure/modules/aws/ecs-task/main.tf:113-117` + `ecs-task-job/main.tf:89-94` — `NODE_ENV=production` hardcoded on the ECS task definition.

### Institutional Learnings

- No prior `docs/solutions/` entries touch Tag seeding, splitting taxonomy entries, cross-DB tag migrations, or the `Hindu/Buddist` label.

### External References

- Not required.

## Key Technical Decisions

- **Rename + extend, across two databases.** Renaming the legacy media `Tag` row to `Hindu` preserves `Tag.id`, so all existing `JourneyTag` rows carrying that id automatically resolve to "Hindu" the instant Script 1 commits. This avoids the class of bugs where `JourneyTag` rows reference a tag that has been deleted — which would happen under a delete-and-create approach because `JourneyTag.tagId` has no FK to enforce integrity.
- **Split per service.** Script 1 lives with `api-media` (writes only to media DB). Script 2 lives with `api-journeys-modern` (writes only to journeys DB). Each script is transactional within its single Prisma client. They are not wrapped in a single cross-DB transaction (not possible — different clients, different connections).
- **Script 2 reads media by tag name, not by id.** Script 2 does `media.tag.findUnique({ where: { name: 'Hindu' } })` and the same for Buddhist. This keeps Script 2 self-contained and restartable after Script 1 — it doesn't need to know any tag UUIDs in advance.
- **Script 2 is decoupled from Script 1's early-exit state.** Script 2 works whether Script 1 has been run once or ten times, because Script 2 only looks for "Hindu" and "Buddhist" in media. The legacy `Hindu/Buddist` row being absent is not a precondition for Script 2.
- **Intermediate-state is brief and acceptable.** Between Script 1's commit and Script 2's commit, affected templates appear tagged only with Hindu. Run both scripts back-to-back to minimize this window. Users viewing templates during the window see "Hindu" instead of "Hindu/Buddist" — not wrong, just incomplete.
- **Collision guard in Script 1.** If a `Hindu` row already exists in media (e.g., created by a fresh seed run in a dev environment before the migration runs), the rename would throw `P2002`. Script 1 handles this by detecting the pre-existing row, deleting its `TagName` rows and the `Tag` row (safe — no `JourneyTag` referrers to it yet because nothing was ever named "Hindu" before this work), then proceeding with the rename.
- **Dry-run default for Script 2.** Following the `fix-cross-team-visitors` precedent, Script 2 defaults to a dry run that reports what it _would_ do without writing. `--apply` commits the writes. Script 1 does not need dry-run — it's fully transactional and its footprint in the media DB is bounded and reviewable from the test assertions.
- **English-only TagName updates.** Script 1 updates the `TagName` row at `languageId: '529'` (English) only. Non-English localized rows remain attached to the renamed tag and keep their localized values. Out of scope for this migration. See the verification SQL in the README for inspecting what exists.
- **No touching `media.Tagging`.** Dormant table, unused by application code. Explicit exclusion.

## Open Questions

### Resolved During Planning

- _Q: Where does the admin UI read/write template tags?_ A: Reads via `tags` GraphQL query (media `Tag` + `TagName`) joined to `journey.journeyTags` (journeys `JourneyTag`). Writes via `journey.resolver.ts:797-805` — `JourneyTag` only. `media.Tagging` is never touched.
- _Q: Is `Tagging` in media actually used?_ A: No. Grep for `prisma.tagging` / `.tagging.` returns zero application-code matches. Dormant legacy.
- _Q: Rename the legacy Tag or delete + create?_ A: Rename. Preserves `Tag.id`, keeps existing `JourneyTag` references valid without requiring any journeys-DB work for the Hindu side. Script 2 is purely additive (adds Buddhist JourneyTags on top).
- _Q: What happens if Script 2 runs before Script 1?_ A: Script 2's precondition check (`findUnique` on Hindu + Buddhist in media) fails with a clear error message directing the operator to run Script 1 first.
- _Q: What happens if Script 1 runs twice?_ A: First run renames. Second run's `findUnique({ name: 'Hindu/Buddist' })` returns null → early exit.
- _Q: What happens if Script 2 runs twice?_ A: `createMany({ skipDuplicates: true })` honoring `@@unique([journeyId, tagId])` makes repeated runs a no-op.
- _Q: What if a journey already has Buddhist tagged (manual edit between runs)?_ A: `skipDuplicates` handles it. Script 2 adds only the missing rows.

### Deferred to Implementation

- Exact `console.log` format for each script (mirror existing patterns).
- Whether Script 2 logs per-journey actions or aggregate counts (lean aggregate with a "templates affected" list for auditability).

## Implementation Units

- [x] **Unit 1: Update the Audience seed list** _(committed on this branch: `147150233`)_

**Goal:** Change `apis/api-media/src/workers/seed/service/tag/tag.ts` so the `Audience` children contain `Hindu` and `Buddhist` instead of `Hindu/Buddist`. Fresh environments then receive the correct tags via the seed.

**Requirements:** R2, R4

**Files:**

- Modify: `apis/api-media/src/workers/seed/service/tag/tag.ts`

**Verification:**

- Running the seed locally against a fresh database produces `Hindu` and `Buddhist` tags under `Audience`, no `Hindu/Buddist`.

- [x] **Unit 2: Add a spec for `seedTags`** _(committed on this branch: `147150233`)_

**Goal:** Lock in the Audience taxonomy via a new `tag.spec.ts` next to `tag.ts`.

**Files:**

- Create: `apis/api-media/src/workers/seed/service/tag/tag.spec.ts`

**Verification:**

- `npx jest --config apis/api-media/jest.config.ts --no-coverage apis/api-media/src/workers/seed/service/tag/tag.spec.ts` passes.

- [ ] **Unit 3: Rewrite Script 1 (api-media) to rename + upsert**

**Goal:** Replace the currently-committed delete-and-create implementation of `migrate-hindu-buddhist-tags.ts` with a rename-and-upsert flow that preserves `Tag.id` so existing `journeys.JourneyTag` rows remain valid.

**Requirements:** R1, R2 (partial — Hindu side), R5

**Dependencies:** None. Ships in the same PR as Units 1-2.

**Files:**

- Modify: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.ts`
- Modify: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` (see Unit 3b below)
- (No change needed to `apis/api-media/project.json` — the `migrate-hindu-buddhist-tags` nx target is already registered.)

**Approach:**

Wrap everything in one `prisma.$transaction` against the **media** client only.

1. `findUnique` the legacy `Hindu/Buddist` tag. If null → log "already migrated, exiting" and return (idempotent).
2. `findUnique` the `Audience` parent. If null → throw (the DB is not a validly-seeded media DB).
3. **Collision guard:** `findUnique({ name: 'Hindu' })`. If a row exists with a different id than the legacy tag, delete its `TagName` rows and then delete the `Tag` row. This is safe because no `JourneyTag` row can reference a tag that was only ever named "Hindu" (nothing in prod/stage ever had that name until this migration). Only local dev can produce this state.
4. Rename the legacy row: `tag.update({ where: { id: legacyTag.id }, data: { name: 'Hindu' } })`. `Tag.id` is preserved.
5. Update the primary English `TagName`: `tagName.updateMany({ where: { tagId: legacyTag.id, languageId: '529' }, data: { value: 'Hindu' } })`. Filter on `languageId`, not `value`, so we always hit the primary English row regardless of its current text.
6. `upsert` a new `Buddhist` tag under `Audience` and its primary English `TagName` at `languageId: '529'`. Upsert makes Script 1 safe to re-run in environments where Buddhist already exists.
7. Log a summary of mutations performed.

**Technical design:** _(directional)_

```
// Pseudo-steps, not final code
const legacy = await tx.tag.findUnique({ where: { name: 'Hindu/Buddist' } })
if (legacy == null) return // idempotent exit
const audience = await tx.tag.findUnique({ where: { name: 'Audience' } })
if (audience == null) throw new Error('Audience parent missing')

const existingHindu = await tx.tag.findUnique({ where: { name: 'Hindu' } })
if (existingHindu != null && existingHindu.id !== legacy.id) {
  await tx.tagName.deleteMany({ where: { tagId: existingHindu.id } })
  await tx.tag.delete({ where: { id: existingHindu.id } })
}

await tx.tag.update({ where: { id: legacy.id }, data: { name: 'Hindu' } })
await tx.tagName.updateMany({
  where: { tagId: legacy.id, languageId: '529' },
  data: { value: 'Hindu' },
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
```

**Patterns to follow:**

- `apis/api-media/src/scripts/update-arcgt-urls.ts` — script entry point + main() error handling.
- `apis/api-media/src/workers/seed/service/tag/tag.ts` — upsert signatures, language `'529'`, `primary: true`.

**Test scenarios:** see Unit 3b.

**Verification:**

- `npx jest --config apis/api-media/jest.config.ts --no-coverage apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` passes.
- Local dry-run against a dev media DB with a `Hindu/Buddist` tag produces the expected end state (renamed to Hindu, Buddhist created, no new JourneyTag rows — that's Script 2's job).

- [ ] **Unit 3b: Rewrite Script 1 spec**

**Goal:** Cover the rename+upsert flow including collision handling, idempotency, preconditions, and regression guards.

**Requirements:** R2 (partial), R5

**Dependencies:** Unit 3.

**Files:**

- Modify: `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts`

**Test scenarios:**

- Happy path: legacy tag exists, no pre-existing Hindu → rename legacy to Hindu, update its primary English TagName, upsert Buddhist + its TagName. Assert: `tag.update` called with `data: { name: 'Hindu' }` on legacy.id; `tagName.updateMany` called with `where: { tagId: legacy.id, languageId: '529' }`; `tag.upsert` called for Buddhist with `parentId: audience.id`.
- Happy path: pre-existing Hindu exists with a different id → Script 1 deletes its TagName rows and the Tag, then proceeds with the rename. Assert: `tagName.deleteMany` called with the pre-existing Hindu's id; `tag.delete` called; rename still happens; final state matches the clean path.
- Idempotency: legacy tag is absent → Script 1 exits early. Assert: no `tag.update`, `tag.upsert`, or `tagName.*` mutation calls.
- Error path: Audience parent missing → throw. Assert: rejected with a message mentioning `"Audience"`; no mutations.
- Regression guard: Script 1 never calls `prisma.tagging.*` (the dormant table must not come back).
- Regression guard: Script 1 never calls `tag.delete` on the legacy tag (it renames; it doesn't delete the legacy row).

**Patterns to follow:**

- Existing spec using `prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock))`. Keep the `: any` typing — `Prisma.TransactionClient` narrowing breaks overload resolution against Prisma 7's overloaded `$transaction` signature (verified during the previous review).

**Verification:**

- Test run passes.

- [ ] **Unit 4: Create Script 2 (api-journeys-modern) to extend JourneyTag**

**Goal:** Add a new script that, for every `JourneyTag` currently pointing at the Hindu tag, creates a matching `JourneyTag` pointing at Buddhist. Reads tag IDs from media DB by name; writes to journeys DB only.

**Requirements:** R3, R5

**Dependencies:** Ships in the same PR as Units 1-3. Runtime sequencing: must run after Script 1 against the same environment.

**Files:**

- Create: `apis/api-journeys-modern/src/scripts/extend-hindu-buddhist-templates.ts`
- Create: `apis/api-journeys-modern/src/scripts/extend-hindu-buddhist-templates.spec.ts`
- Modify: `apis/api-journeys-modern/project.json` (register new nx target `extend-hindu-buddhist-templates`)

**Approach:**

Use both Prisma clients (media for reads, journeys for writes). Do not wrap the journeys writes in the same transaction as the media reads — they're different clients. Instead, wrap only the journeys-side mutations in a journeys `$transaction`.

1. Read the Hindu and Buddhist tag IDs from media by name (`media.prisma.tag.findUnique({ where: { name: 'Hindu' } })` and same for Buddhist).
2. **Precondition check:** if either tag is missing in media, throw with a clear message like "Run the api-media migrate-hindu-buddhist-tags script first." No mutations attempted.
3. Find all `journeys.JourneyTag` rows where `tagId === hindu.id`. This is the list of journeys that need Buddhist added.
4. If list is empty, log and exit.
5. Inside a `journeys.prisma.$transaction`, `createMany({ data, skipDuplicates: true })` with `@@unique([journeyId, tagId])` handling duplicates. Build `data` as `{ journeyId, tagId: buddhist.id }` for each journey in the list.
6. Log per-journey what was added and an aggregate count.
7. Support `--apply` flag (default dry-run, following `fix-cross-team-visitors` convention). In dry-run, skip the `createMany` call and log what would be inserted.
8. `require.main === module` guard + `prisma.$disconnect()` on both clients in `finally`.

**Technical design:** _(directional)_

```
// Pseudo-steps, not final code
const hindu = await mediaPrisma.tag.findUnique({ where: { name: 'Hindu' } })
const buddhist = await mediaPrisma.tag.findUnique({ where: { name: 'Buddhist' } })
if (hindu == null || buddhist == null) {
  throw new Error('Missing Hindu or Buddhist tag — run the api-media migration first')
}

const journeyTags = await journeysPrisma.journeyTag.findMany({
  where: { tagId: hindu.id },
  select: { journeyId: true },
})

if (!dryRun && journeyTags.length > 0) {
  await journeysPrisma.$transaction(async (tx) => {
    await tx.journeyTag.createMany({
      data: journeyTags.map((jt) => ({ journeyId: jt.journeyId, tagId: buddhist.id })),
      skipDuplicates: true,
    })
  })
}
```

**Patterns to follow:**

- `apis/api-journeys-modern/src/scripts/fix-cross-team-visitors.ts` — entry point, `--apply` flag, summary logging, per-record status lines, structured result.

**Execution note:** Test-first is not required, but the spec ships in the same PR.

**Test scenarios:**

- Happy path (4 journeys): media has Hindu and Buddhist; journeys has 4 JourneyTag rows with tagId = Hindu. With `--apply`, Script 2 creates 4 new JourneyTag rows with tagId = Buddhist. Assert: `createMany` called with 4 entries, `skipDuplicates: true`; all entries have `tagId === buddhist.id`.
- Happy path (dry-run): same state but without `--apply`. Assert: `createMany` is **not** called. Script logs "would insert N rows".
- Edge case (no journeys tagged): media has Hindu and Buddhist; journeys has zero JourneyTag rows with tagId = Hindu. Script logs "no journeys to update" and exits. Assert: `createMany` is not called.
- Idempotency: running Script 2 twice with `--apply`. Second run finds same 4 journeys, but `skipDuplicates: true` on the `@@unique([journeyId, tagId])` constraint means no new rows are inserted. Assert: createMany's return `{ count: 0 }` in the second run is handled cleanly.
- Error path (Hindu missing): media has no Hindu tag. Script throws with a message mentioning "Run the api-media migration first". Assert: no journeys-DB mutations.
- Error path (Buddhist missing): media has Hindu but no Buddhist. Same as above.
- Regression guard: Script 2 never calls `journeyTag.deleteMany` or `tag.delete` (purely additive on journeys-side; never touches media-side except for reads).

**Verification:**

- `npx jest --config apis/api-journeys-modern/jest.config.ts --no-coverage apis/api-journeys-modern/src/scripts/extend-hindu-buddhist-templates.spec.ts` passes.

- [ ] **Unit 5: Update api-media README with rollout procedure for both scripts**

**Goal:** Replace the existing "Migrate Hindu/Buddhist Tags" section with documentation covering the **two-script cross-service rollout** — Script 1 from api-media, Script 2 from api-journeys-modern — including stage-first procedure and verification SQL against both databases.

**Requirements:** R5

**Dependencies:** Units 3 and 4.

**Files:**

- Modify: `apis/api-media/src/scripts/README.md`

**Approach:**

- Explain that the full migration requires running BOTH scripts in order: first `nx run api-media:migrate-hindu-buddhist-tags`, then `nx run api-journeys-modern:extend-hindu-buddhist-templates --apply`.
- Document the `--apply` flag on Script 2 (dry-run by default).
- Rollout Procedure: stage first, run Script 1, run Script 2 (dry-run), inspect output, run Script 2 with `--apply`, verify UI + DB. Only then repeat against prod.
- Verification SQL for both DBs:
  - **media:** `Hindu/Buddist` row count (expect 0), `Hindu` + `Buddhist` row count (expect 2 with correct parentId), TagName inspection query (for scoping non-English row decision).
  - **journeys:** count of `JourneyTag` with `tagId = <Hindu.id>` (expect N), count with `tagId = <Buddhist.id>` (expect same N), join query showing every affected journeyId has both.

**Patterns to follow:**

- The `## Update Arc.gt URLs Script` section in the same README.

**Test scenarios:**

- Test expectation: none — docs-only change with no behavioral surface.

**Verification:**

- A new operator can follow the README top-to-bottom and complete the stage rollout without external context.

## System-Wide Impact

- **Interaction graph:** the media `tags` query returns two tag rows after the migration (Hindu, Buddhist) instead of one (Hindu/Buddist). The `journey.journeyTags` relation has one additional row per previously-affected journey. Consumers (`CategoriesTabPanel`, publisher page, template filter UI) render dynamically — no code change needed.
- **Cross-database consistency:** the two scripts are not in a shared transaction (impossible across Prisma clients). Script 1 commits first. If Script 2 fails mid-way, re-running it completes the job (idempotent). Between Script 1 and Script 2 commits, affected templates show Hindu only — brief, acceptable.
- **Error propagation:** Script 1's single media `$transaction` provides atomicity per-script. Script 2's `createMany({ skipDuplicates: true })` provides idempotency. Each script fails closed.
- **State lifecycle risks:** `JourneyTag.tagId` for the legacy Hindu/Buddist UUID remains valid throughout the migration because Script 1 renames (doesn't delete). No orphan `JourneyTag` rows are ever created.
- **API surface parity:** None. Schema, GraphQL surface, and write-paths in `journey.resolver.ts` are unchanged.
- **Integration coverage:** Unit tests use prisma mocks; they don't prove transactional correctness against real DBs. Compensated by the mandatory stage dry-run + `--apply` two-step for Script 2.
- **Unchanged invariants:**
  - The `Audience` parent `Tag` row is not modified.
  - Other `Audience` children (Catholic/Orthodox, Atheist/Agnostic, etc.) are not modified.
  - `Tag.id` for the legacy Hindu/Buddist row is **preserved** (now labeled Hindu).
  - `media.Tagging` is not touched (dormant legacy).
  - `journey.resolver.ts` write path is unchanged.

## Risks & Dependencies

| Risk                                                                        | Mitigation                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script 2 run before Script 1                                                | Script 2's precondition check throws with a clear message directing the operator to run Script 1 first.                                                                                                                                             |
| Script 1 commits but Script 2 fails                                         | Re-run Script 2. Idempotent. Brief intermediate state (affected templates show Hindu only) until Script 2 succeeds. Document running both back-to-back.                                                                                             |
| Pre-existing Hindu row in media (dev environment that ran the updated seed) | Collision guard in Script 1 deletes the stub before renaming the legacy row.                                                                                                                                                                        |
| Someone edits a template's tags during migration                            | `journey.resolver.ts` writes to `JourneyTag` using the tagId of whatever the admin picks. During Script 1, the legacy tag's id is preserved — any in-flight write with that id remains valid. `skipDuplicates` in Script 2 handles concurrent adds. |
| Localized TagName rows carry the old combined label post-migration          | Accepted scope boundary. English-only. Translation team can re-translate as a follow-up. Verification SQL in the README lets operators inspect what exists.                                                                                         |
| Cross-DB reference (JourneyTag.tagId → media.Tag.id) relies on id stability | Script 1 preserves `Tag.id` via rename. No orphan references possible.                                                                                                                                                                              |
| Dev local DBs may have drifted from prod/stage in ways we can't predict     | Both scripts are idempotent and safe to re-run. Local dev is not a release surface.                                                                                                                                                                 |

## Documentation / Operational Notes

- **Rollout order is stage → prod, and within each environment: Script 1 → Script 2.**
- Scripts live on the current PR for initial review. Per the user's direction, they may later be moved to a separate throwaway PR; that's a follow-up task, not a blocker.
- **Senior engineer ownership.** Mike (per team directory) is the recommended operator for running the scripts in stage and prod because of his infra/data/backend scope.
- **Verification after each script + environment:** see the SQL queries documented in `apis/api-media/src/scripts/README.md`. UI check: open the Audience checkbox list in admin; confirm `Hindu/Buddist` is absent and `Hindu` + `Buddhist` are present; open each affected template and confirm both new tags are attached (after Script 2).
- **Rollback considerations:** Script 1 — rename Hindu back to Hindu/Buddist, delete Buddhist tag (if no JourneyTags point at it). Script 2 — delete JourneyTag rows with tagId = Buddhist.id. Both reversible. Not implementing inverse scripts up-front; documented as a manual procedure.

## Sources & References

- Linear ticket: [NES-1591](https://linear.app/jesus-film-project/issue/NES-1591/separate-hindubuddist-checkbox-and-fix-spelling-error)
- Slack source: `#nextsteps-bugs` 2026-04-20 — Melissa Immel's request.
- PR: https://github.com/JesusFilm/core/pull/9047 (this branch). Units 1, 2 committed; Units 3, 3b, 4, 5 to be rewritten per this plan.
- Related code:
  - `apis/api-media/src/workers/seed/service/tag/tag.ts`
  - `apis/api-media/src/workers/seed/service/tag/tag.spec.ts`
  - `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.ts` _(to be rewritten — Unit 3)_
  - `apis/api-media/src/scripts/migrate-hindu-buddhist-tags.spec.ts` _(to be rewritten — Unit 3b)_
  - `apis/api-journeys-modern/src/scripts/extend-hindu-buddhist-templates.ts` _(to be created — Unit 4)_
  - `apis/api-journeys-modern/src/scripts/extend-hindu-buddhist-templates.spec.ts` _(to be created — Unit 4)_
  - `apis/api-journeys-modern/project.json` _(to modify — Unit 4 adds nx target)_
  - `apis/api-media/src/scripts/README.md` _(to update — Unit 5)_
  - `apis/api-journeys-modern/src/scripts/fix-cross-team-visitors.ts` (pattern reference)
  - `apis/api-media/src/scripts/update-arcgt-urls.ts` (pattern reference)
  - `apis/api-journeys/src/app/modules/journey/journey.resolver.ts:797-805` (JourneyTag canonical write path)
  - `libs/prisma/journeys/db/schema.prisma` (JourneyTag model)
  - `libs/prisma/media/db/schema.prisma` (Tag, TagName, dormant Tagging models)
  - `apis/api-media/src/workers/server.ts` (NODE_ENV gating of seed worker)
  - `infrastructure/modules/aws/ecs-task/main.tf` + `ecs-task-job/main.tf` (hardcoded NODE_ENV=production)
