---
title: 'Prisma 7 + Nx schema-change gotchas: shadow-DB drift and stale codegen cache'
date: 2026-06-02
category: workflow-issues
module: api-journeys-modern
problem_type: workflow_issue
component: development_workflow
severity: high
related_components:
  - database
  - tooling
applies_when:
  - Creating a Prisma 7 migration when the local shadow-DB migration history is drifted
  - Regenerating GraphQL types with nx codegen after an upstream gateway-schema change
symptoms:
  - nx prisma-migrate fails with P3006 on an unrelated historical migration
  - schema-to-schema prisma migrate diff silently returns empty SQL
  - nx run-many -t codegen serves stale cached output missing a newly added GraphQL field
root_cause: missing_workflow_step
resolution_type: workflow_improvement
tags:
  - prisma-7
  - migrate-diff
  - shadow-database
  - nx-cache
  - codegen
  - gql-tada
  - schema-change
  - pothos
---

# Prisma 7 + Nx schema-change gotchas: shadow-DB drift and stale codegen cache

## Context

Adding a field/model to a Prisma schema and surfacing it through GraphQL in this Nx + Prisma 7 + Pothos + gql.tada monorepo hits two independent workflow traps in the standard `schema.prisma` → `nx prisma-migrate` → `generate-graphql` → gateway compose → `nx codegen` pipeline. Both surfaced during NES-1706 (the `TemplateGalleryPageMedia` work). The happy-path procedure is documented in `.claude/rules/backend/database-schema-changes.md`; this captures the two failure modes that rule does not yet cover.

## Guidance

### Gotcha 1 — `nx prisma-migrate` fails with P3006 (drifted shadow-DB history)

The local journeys DB already matches the committed schema, but its recorded migration history is locally inconsistent, so anything that replays history fails:

- `nx prisma-migrate prisma-journeys` → **P3006**: a historical migration (e.g. `20260504212913_replace_creator_image_block_with_scalars`) "failed to apply cleanly to the shadow database" (`constraint ... does not exist`). The failing migration is unrelated to your change.
- `prisma migrate deploy` → replays the whole inconsistent history and dies with `type "MessagePlatform" already exists`.
- A pure file-to-file `prisma migrate diff --from-schema OLD --to-schema NEW --script` silently returns **empty** SQL — do not rely on it. (Prisma 7 also removed `--from-schema-datamodel`/`--to-schema-datamodel`; the flags are now `--from-schema`/`--to-schema`.)

**Fix — diff the *live local DB* against the new schema** (it ignores history entirely). Run from inside the prisma project dir so `prisma.config.ts` autoloads, with the DB URL exported:

```bash
cd libs/prisma/journeys
export PG_DATABASE_URL_JOURNEYS='postgresql://postgres:postgres@db:5432/journeys?schema=public'
pnpm exec prisma migrate diff \
  --from-config-datasource prisma.config.ts \
  --to-schema db/schema.prisma \
  --script
```

This emits exactly the additive SQL to bring the live DB to the new schema. Then:

1. Write the SQL into a new migration dir, stripping Prisma's "Loaded Prisma config"/update banner (keep from the first `-- CreateEnum`/`-- CreateTable`):
   ```bash
   mkdir -p db/migrations/<YYYYMMDDHHMMSS>_<name>
   # → db/migrations/<YYYYMMDDHHMMSS>_<name>/migration.sql
   ```
2. Apply it to the local DB (devcontainer host `db:5432`, `postgres`/`postgres`):
   ```bash
   PGPASSWORD=postgres psql -h db -U postgres -d journeys -v ON_ERROR_STOP=1 \
     -f db/migrations/<YYYYMMDDHHMMSS>_<name>/migration.sql
   ```
3. Record it so future `migrate` runs don't re-apply it (checksum = SHA-256 of the file):
   ```sql
   INSERT INTO _prisma_migrations
     (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
   VALUES ('<uuid>', '<sha256 of migration.sql>', now(), '<dir name>', now(), 1);
   ```
4. Regenerate the client: `nx prisma-generate prisma-journeys`.

Before committing, **confirm the SQL is purely additive** (one `CREATE TABLE`/`CREATE TYPE`/index/FK; no `DROP`/`ALTER` of existing columns). Destructive statements mean the diff picked up unintended drift — stop and investigate.

### Gotcha 2 — `nx run-many -t codegen` serves a stale cache hit

After editing the Pothos schema, re-running `generate-graphql` (subgraph + gateway), and running `nx run-many -t codegen`, Nx logged:

```
Nx read the output from the cache instead of running the command for 1 out of 7 tasks.
```

The new input field was present in `apis/api-gateway/schema.graphql` but **missing** from the generated TypeScript input types in `apis/api-journeys/src/__generated__/graphql.ts` and `libs/shared/gql/src/__generated__/graphql-env.d.ts`. Downstream, frontend gql.tada documents passing the field would fail typecheck against the stale `graphql-env.d.ts`.

**Fix — bust the cache after a schema ripple:**

```bash
nx run-many -t codegen --skip-nx-cache
```

After this the field appears, e.g. `media?: InputMaybe<TemplateGalleryPageMediaInput>`.

## Why This Matters

- **Gotcha 1:** the shadow-DB and `migrate deploy` paths both replay the *recorded migration history*, which is locally drifted. `migrate diff --from-config-datasource ... --to-schema ...` introspects the *current live database state* and computes the delta to the target schema — bypassing history. Because the live DB already matches the committed schema, the delta is exactly your additive change. Manually inserting the `_prisma_migrations` row marks it applied so it won't be re-run. (The pure file-to-file diff returned empty in this invocation; the live DB is the only reliable `--from` reference here.)
- **Gotcha 2:** Nx caches task outputs keyed on declared inputs. The `codegen` task's cache key did not capture the freshly-composed gateway `schema.graphql`, so Nx replayed an earlier (pre-field) run and silently shipped stale generated types. A cache hit is not evidence that an upstream gateway-schema change was picked up.

## When to Apply

- Any Prisma schema change against a domain whose local migration history is drifted (P3006 on an unrelated migration).
- Any change that crosses the `generate-graphql` → gateway compose → `codegen` boundary — bust the cache or verify the generated artifacts before trusting them.

## Examples

Verify the generated artifacts actually contain the new field instead of trusting a cache hit:

```bash
grep -n "media" apis/api-journeys/src/__generated__/graphql.ts
grep -n "media" libs/shared/gql/src/__generated__/graphql-env.d.ts
```

## Related

- `.claude/rules/backend/database-schema-changes.md` — the happy-path schema-change workflow (Steps 1–7). These two gotchas are the troubleshooting extensions of Step 3 (`prisma-migrate`) and Step 7 (`codegen`); the rule does not yet mention P3006 drift, the `migrate diff` workaround, or `--skip-nx-cache`.
- `docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md` — NES-1547; has a tangential one-line mention of `prisma migrate diff` for drifted local DBs (different flags, no P3006/manual-apply detail).
