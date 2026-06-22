---
title: "fix: Surface historical Cloudflare uploads by backfilling CloudflareImage.isAi"
type: fix
status: active
date: 2026-06-22
---

# fix: Surface historical Cloudflare uploads by backfilling CloudflareImage.isAi

## Summary

Backfill the nullable `CloudflareImage.isAi` column to `false` for all pre-existing rows and harden the column (`@default(false)`, `NOT NULL`) so the `getMyCloudflareImages` listing — gated behind the new media-library flag — once again returns historical uploads in both the Custom and AI tabs.

---

## Problem Frame

The flag-gated media library lets a user see all their Cloudflare uploads. Only assets uploaded after ~2026-05-06 appear; every older upload is invisible even though the rows still exist.

Root cause (diagnosed): migration `20260506045451_add_is_ai_to_cloudflare_image` added `isAi BOOLEAN` with **no default and no backfill**, so every row created before it has `isAi = NULL`. New write paths set `isAi` explicitly (`false` for direct uploads at [image.ts:192](apis/api-media/src/schema/cloudflare/image/image.ts:192) / [:225](apis/api-media/src/schema/cloudflare/image/image.ts:225), `true` for AI at [image.ts:262](apis/api-media/src/schema/cloudflare/image/image.ts:262) and [segmind.ts:37](apis/api-media/src/schema/segmind/segmind.ts:37)). The resolver applies `...(isAi != null ? { isAi } : {})` ([image.ts:107](apis/api-media/src/schema/cloudflare/image/image.ts:107)), and the frontend always sends a concrete boolean (`CustomImage` → `isAi={false}`, `AIGallery` → `isAi={true}`). Because Prisma's `where: { isAi: false }` compiles to `"isAi" = false`, which excludes `NULL`, historical rows match neither tab.

---

## Requirements

- R1. Historical `CloudflareImage` rows (currently `isAi = NULL`) appear in the Custom tab of the media library after the fix.
- R2. The `isAi` column can no longer hold `NULL`, preventing recurrence of the invisible-row class of bug.
- R3. The change ships as a safe, reviewable production data migration in the `media` Prisma domain.
- R4. No regression to existing `isAi: true` / `isAi: false` filtering or the team-merged read path.

---

## Scope Boundaries

- Not changing the `getMyCloudflareImages` resolver logic — it is correct once the data is non-null.
- Not changing the GraphQL nullability of the `isAi` field (stays `nullable: true`) — see Key Technical Decisions.
- Not touching `MuxVideo` (no equivalent nullable-filter bug; its listing has no `isAi` predicate).
- Not altering the media-library feature flag, pagination, or Apollo cache policy.

### Deferred to Follow-Up Work

- Auditing other late-added nullable boolean columns for the same filter-excludes-NULL pattern: separate review, not this PR.

---

## Context & Research

### Relevant Code and Patterns

- Schema: [libs/prisma/media/db/schema.prisma:37](libs/prisma/media/db/schema.prisma:37) — `isAi Boolean?`.
- Resolver: [apis/api-media/src/schema/cloudflare/image/image.ts:101-112](apis/api-media/src/schema/cloudflare/image/image.ts:101).
- GraphQL exposure: [image.ts:74](apis/api-media/src/schema/cloudflare/image/image.ts:74) — `t.exposeBoolean('isAi', { nullable: true })`.
- Write paths that set `isAi`: image.ts:192/225/262, segmind.ts:37.
- Migration dir + naming: `libs/prisma/media/db/migrations/<timestamp>_<name>/migration.sql` (e.g. `20260506045451_add_is_ai_to_cloudflare_image`).
- Existing resolver tests: [apis/api-media/src/schema/cloudflare/image/image.spec.ts:162-392](apis/api-media/src/schema/cloudflare/image/image.spec.ts:162) (`getMyCloudflareImages` — covers `isAi: true`, `isAi: false`, null arg, and team merge).
- Workflow rule: `.claude/rules/backend/database-schema-changes.md` (media domain → project `prisma-media`, env `PG_DATABASE_URL_MEDIA`).

### Institutional Learnings

- `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md`: on P3006 shadow-DB drift, generate the migration by diffing the live local DB (`prisma migrate diff --from-config-datasource`) rather than replaying history; and distrust `nx codegen` cache hits after a gateway-schema change (use `--skip-nx-cache`). Both apply if the migration step or codegen misbehaves.

---

## Key Technical Decisions

- **Single migration does both backfill and constraint.** Prisma never emits data backfills, and `ALTER COLUMN ... SET NOT NULL` fails while `NULL` rows exist. So the generated `migration.sql` must be hand-edited to run `UPDATE "CloudflareImage" SET "isAi" = false WHERE "isAi" IS NULL;` **before** the `SET NOT NULL` statement. Order is load-bearing.
- **Backfill value is `false`.** Every historical row predates the AI-generation feature, so it is by definition a non-AI upload. `false` is semantically correct and surfaces them in the Custom tab.
- **Keep GraphQL `isAi` `nullable: true`.** Making the DB column `NOT NULL` does not require changing the Pothos exposure. Leaving it nullable avoids a breaking contract change, avoids regenerating GraphQL + running `nx codegen` across six frontend projects, and sidesteps the codegen-cache pitfall in the learning doc. The resolver and frontend already tolerate the field, and post-migration the value is simply never `NULL`. **Consequence: no GraphQL/codegen steps (Steps 4-7 of the schema-change rule) are needed.**
- **Resolver unchanged.** `...(isAi != null ? { isAi } : {})` is correct once data is non-null; adding a `{ isAi: { not: true } }`-style OR would be dead defensiveness against a state the constraint now forbids.

---

## Open Questions

### Resolved During Planning

- Should the GraphQL field become non-nullable too? No — keep `nullable: true` to avoid a breaking change and codegen churn (see Key Technical Decisions).
- Backfill value? `false` — historical rows predate the AI feature.

### Deferred to Implementation

- Whether `prisma-migrate` generates the `SET DEFAULT` and `SET NOT NULL` statements in a safe order, or emits a warning about existing NULLs — confirm against the generated SQL and reorder/inject the `UPDATE` as needed.
- Whether making the Prisma field non-nullable (client type `boolean` instead of `boolean | null`) trips TypeScript in specs that mock `isAi: null` (e.g. image.spec.ts:92/196/419/473/601). If `tsc` complains, update those mocks to `false`. Runtime behavior of those resolvers is unaffected.

---

## Implementation Units

- U1. **Backfill and harden `CloudflareImage.isAi`**

**Goal:** Eliminate `NULL` `isAi` values and make the column `NOT NULL DEFAULT false`, so historical uploads become visible and the bug cannot recur.

**Requirements:** R1, R2, R3

**Dependencies:** None

**Files:**
- Modify: `libs/prisma/media/db/schema.prisma` (change `isAi Boolean?` → `isAi Boolean @default(false)`)
- Create: `libs/prisma/media/db/migrations/<timestamp>_backfill_and_require_cloudflare_image_is_ai/migration.sql`
- (Generated) Modify: `libs/prisma/media/generated/**` via `nx prisma-generate prisma-media`

**Approach:**
1. Edit the schema field to `isAi Boolean @default(false)` (drop the `?`).
2. Generate the migration with `nx prisma-migrate prisma-media` (use the non-interactive `--name` form from the schema-change rule if the env is non-interactive; if P3006 drift hits, fall back to `prisma migrate diff --from-config-datasource` per the learning doc).
3. **Hand-edit the generated `migration.sql`** so statements run in this order: (a) `UPDATE "CloudflareImage" SET "isAi" = false WHERE "isAi" IS NULL;`, (b) `ALTER COLUMN "isAi" SET DEFAULT false;`, (c) `ALTER COLUMN "isAi" SET NOT NULL;`. Confirm the `UPDATE` precedes `SET NOT NULL`.
4. Run `nx prisma-generate prisma-media` to refresh the client types.

**Execution note:** This migration mutates production data. Keep the SQL minimal and idempotent (the `WHERE "isAi" IS NULL` guard makes re-runs no-ops). Verify the final SQL by reading it back before applying.

**Patterns to follow:** Existing media migrations under `libs/prisma/media/db/migrations/`; the `media` domain rows of `.claude/rules/backend/database-schema-changes.md`.

**Test scenarios:**
- Test expectation: none for the migration SQL itself (pure schema + data migration). Correctness is verified by: the migration applying cleanly against a DB containing `NULL` rows, and the column reporting `NOT NULL` afterward (see Verification).

**Verification:**
- Migration applies locally with no error; `\d "CloudflareImage"` (or introspection) shows `isAi boolean not null default false`.
- A pre-seeded row with `isAi = NULL` reads back as `false` after migration.
- `nx prisma-generate prisma-media` succeeds and the client type for `isAi` is non-nullable.

- U2. **Confirm resolver behavior and existing tests still hold**

**Goal:** Prove the listing now returns previously-`NULL` rows in the Custom tab and that `isAi: true` / `isAi: false` / team-merge filtering is unregressed.

**Requirements:** R1, R4

**Dependencies:** U1

**Files:**
- Modify (if needed): `apis/api-media/src/schema/cloudflare/image/image.spec.ts`

**Approach:**
- The resolver code is unchanged. Add/confirm a regression test asserting that a Custom-tab query (`isAi: false`) returns rows that were historically `NULL` — i.e. after backfill they are `false` and therefore match. Since the spec mocks Prisma, the meaningful assertion is that the `where` clause for `isAi: false` is what surfaces backfilled rows; document the data-level nature of the fix in a test comment so future readers don't re-introduce a nullable column.
- If making the field non-nullable breaks any spec mock typed with `isAi: null`, update those mocks to `false`.

**Patterns to follow:** Existing `getMyCloudflareImages` test block at image.spec.ts:162-392.

**Test scenarios:**
- Happy path: query with `isAi: false` returns the (now-backfilled) rows; `where` is `{ userId, isAi: false }`. (Existing test at image.spec.ts:306 already asserts this `where`; keep it green.)
- Edge case: query with `isAi: true` still returns only AI rows (image.spec.ts:294 stays green).
- Edge case: null `isAi` arg still omits the filter (image.spec.ts:318 stays green).
- Integration: team-merged predicate with `isAi` still composes correctly (image.spec.ts:358 stays green).

**Verification:**
- `npx vitest run --config apis/api-media/vitest.config.mts 'apis/api-media/src/schema/cloudflare/image/image.spec.ts' --coverage=false` passes.

---

## System-Wide Impact

- **Interaction graph:** Only `getMyCloudflareImages` (and `videoImages`, which already passes `isAi: null` through) read this column for filtering. No callbacks/middleware affected.
- **State lifecycle risks:** One-time full-table `UPDATE` on `CloudflareImage`. On a large table this takes a brief write lock; acceptable for a backfill. The `WHERE "isAi" IS NULL` guard makes the statement idempotent.
- **API surface parity:** GraphQL contract unchanged (`isAi` stays `nullable: true`); no consumer codegen required.
- **Unchanged invariants:** Resolver logic, feature flag, pagination, Apollo cache policy, and all write paths are untouched. The fix is purely data + constraint.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `SET NOT NULL` runs before the backfill and the migration fails | Hand-order the SQL: `UPDATE` first, then `SET DEFAULT`, then `SET NOT NULL`; read the SQL back before applying. |
| Backfill locks a large `CloudflareImage` table in production | Single bounded `UPDATE`; coordinate deploy timing if the table is very large. Idempotent guard allows safe retry. |
| Prisma shadow-DB drift (P3006) blocks migration generation | Use `prisma migrate diff --from-config-datasource` per `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md`. |
| Non-nullable client type breaks spec mocks using `isAi: null` | Update affected mocks to `false` (deferred-to-implementation item). |

---

## Sources & References

- Diagnosis thread (this session): root cause in `getMyCloudflareImages` + `isAi = NULL`.
- Workflow rule: `.claude/rules/backend/database-schema-changes.md`
- Learning: `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md`
- Code: `apis/api-media/src/schema/cloudflare/image/image.ts`, `libs/prisma/media/db/schema.prisma`
