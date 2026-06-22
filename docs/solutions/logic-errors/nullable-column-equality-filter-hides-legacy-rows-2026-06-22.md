---
title: 'Late-added nullable column + equality filter silently hides legacy rows'
date: 2026-06-22
category: logic-errors
module: api-media
problem_type: logic_error
component: database
symptoms:
  - Media library only showed assets uploaded after the feature landed; all older uploads were invisible
  - Rows existed in the DB and matched on userId, but never appeared in the picker
  - Only assets created after the new column was added showed up in either tab
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [prisma, sql-null, nullable-column, graphql-resolver, cloudflare-image, media-library, three-valued-logic]
---

# Late-added nullable column + equality filter silently hides legacy rows

## Problem

`CloudflareImage.isAi` was added as a nullable column with no value for existing rows, then the media-library picker filtered on it with `isAi = false` (Custom tab) / `isAi = true` (AI tab). Because `NULL = false` is **not** true in SQL three-valued logic, every pre-existing upload (`isAi = NULL`) matched neither tab and vanished from the picker — even though the rows existed and matched on `userId`.

## Symptoms

- The flag-gated media library only showed assets uploaded after the `isAi` column landed (~2026-05-06).
- Historical uploads were invisible in both the Custom and AI tabs.
- The rows were present in `CloudflareImage` and owned by the caller's `userId` — they were silently filtered out, not missing.

## What Didn't Work

- **Backfilling the data + hardening the column** (`UPDATE "CloudflareImage" SET "isAi" = false WHERE "isAi" IS NULL` then `ALTER COLUMN "isAi" SET DEFAULT false, SET NOT NULL`). This *is* correct SQL and passed locally, but was abandoned because:
  - A full-table `UPDATE` plus `SET NOT NULL` takes an `ACCESS EXCLUSIVE` lock + validation scan on the production table — risky under load.
  - It did not reliably apply on **stage**: api-media runs `prisma migrate deploy` in `docker-entrypoint.sh` under `set -e`. A migration that errors (lock/timeout) aborts the entrypoint, ECS rolls back to the previous image, and the rows are left un-backfilled — while the app still serves, so the bug silently persists. (The symptom "only post-deploy uploads show" is identical whether the migration never applied or a userId mismatch exists — don't assume which without checking `_prisma_migrations` / a row's `userId`.)
- **Assuming the existing `...(isAi != null ? { isAi } : {})` already handled null.** It checks the *argument*, not the *column*. The frontend always sends a concrete boolean (`false`/`true`), so the `{}` (no-filter) branch never fires for the picker, and the column-null rows stay excluded.

## Solution

Handle `null` in the read path instead of mutating data. The Custom tab means "everything that isn't explicitly AI", so match `false` **or** `null`:

```ts
// apis/api-media/src/schema/cloudflare/image/image.ts — getMyCloudflareImages
// before:
where: {
  ...(teamId != null
    ? { OR: [{ userId: user.id }, { teamId }] }
    : { userId: user.id }),
  ...(isAi != null ? { isAi } : {}) // isAi=false → `isAi = false` → excludes NULL rows
}

// after:
where: {
  AND: [
    teamId != null
      ? { OR: [{ userId: user.id }, { teamId }] }
      : { userId: user.id },
    isAi === true
      ? { isAi: true }
      : isAi === false
        ? { OR: [{ isAi: false }, { isAi: null }] } // null counts as not-AI
        : {}
  ]
}
```

Two details that matter:

- **Top-level `AND`.** The userId/team predicate already uses an `OR` key, and a Prisma `where` object can't hold two `OR` keys. Wrapping both predicates in a top-level `AND` array lets the null-tolerant `isAi` clause carry its own `OR` without colliding.
- **`isAi` stays `Boolean?`** — no schema change, no migration, no codegen. Net diff was just the resolver + its spec.

## Why This Works

The bug is SQL three-valued logic: `NULL = false → NULL` (treated as "no match" by `WHERE`). The data approach fixes it by removing the `NULL`s; the read approach fixes it by asking for `false OR NULL` so `NULL` rows are explicitly included. For this domain "a `null` upload is just a non-AI upload" is permanently true, so coalescing `null → not-AI` at query time is a complete fix, not a patch — and it carries zero data-mutation risk.

## Prevention

- **When you add a nullable column that a query will filter by equality, decide up front how legacy (`NULL`) rows should behave.** Either backfill them or make the read tolerate `NULL` (`{ OR: [{ col: value }, { col: null }] }`, or `col IS NOT <other-value>`). A bare `col = value` filter silently drops every legacy row.
- **Prefer the read-side fix over a data migration when "null means default" is permanently true** for that column. It avoids `ACCESS EXCLUSIVE` locks on large production tables and the silent-rollback failure mode of entrypoint migrations under `set -e`.
- **If you must backfill + `SET NOT NULL` on a hot table**, split it: batched `UPDATE`, then `ADD CONSTRAINT ... CHECK (col IS NOT NULL) NOT VALID` → `VALIDATE CONSTRAINT` (weaker lock) → `SET NOT NULL`. And verify it actually applied (`_prisma_migrations.finished_at`, `count(*) WHERE col IS NULL`) — an entrypoint migration can fail and roll back while the app stays up.
- **Test with an actual `NULL` row.** Add a case asserting a legacy `null`-column row is returned by the "default" query. Mock-based unit tests that only check the generated `where` won't catch the SQL-null semantics, but they do lock in the `OR [value, null]` predicate.
- **Distinguish arg-null from column-null.** `arg != null ? { col: arg } : {}` gates on the request, not the stored value; it does not make a stored `NULL` behave like the default.

## Related Issues

- PR: [JesusFilm/core#9323](https://github.com/JesusFilm/core/pull/9323)
- Linear: NES-1744 (bug), NES-1627 (added the un-backfilled `isAi` column)
- Plan: `docs/plans/2026-06-22-001-fix-cloudflare-image-isai-backfill-plan.md`
