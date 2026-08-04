# APIs — Convention Guide

GraphQL API layer for the NextSteps platform, composed via Apollo Federation.

| Service        | Framework             | Role                                                                        |
| -------------- | --------------------- | --------------------------------------------------------------------------- |
| `api-journeys` | GraphQL Yoga + Pothos | Journeys API — code-first schema, scope auth                                |
| `api-gateway`  | GraphQL Hive Gateway  | Federation gateway — composes subgraphs, JWT validation, header propagation |

## Shared conventions

### Prisma

- ORM for all database access — **no raw SQL** (except `prisma.$queryRaw` when necessary).
- Schema: `libs/prisma/journeys/db/schema.prisma`
- Migrations: `libs/prisma/journeys/db/migrations/` — timestamped SQL files, one atomic change each.
- Soft deletes via `deletedAt` field on blocks, journeys, and other entities. Always filter `where: { deletedAt: null }` in queries.
- Generate client: `pnpm dlx nx run prisma-journeys:prisma-generate` after schema changes.
- Import from `@core/prisma/journeys/client`.

### Database schema changes (Prisma → GraphQL → codegen)

**Applies when:** Making changes to Prisma schemas, GraphQL types/queries/mutations, or Pothos schema definitions. This includes adding fields, adding enums, changing nullability, adding models, renaming fields, or adding new queries/mutations.

#### Prisma Domain Reference

| Domain    | Nx Project         | Schema Path                              | DB URL Env Var              | APIs Using This Domain                                                        |
| --------- | ------------------ | ---------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| journeys  | `prisma-journeys`  | `libs/prisma/journeys/db/schema.prisma`  | `PG_DATABASE_URL_JOURNEYS`  | `api-journeys`                                                                |
| users     | `prisma-users`     | `libs/prisma/users/db/schema.prisma`     | `PG_DATABASE_URL_USERS`     | `api-users`                                                                   |
| analytics | `prisma-analytics` | `libs/prisma/analytics/db/schema.prisma` | `PG_DATABASE_URL_ANALYTICS` | `api-analytics` (uses `prisma-introspect`, not `prisma-migrate` — see Step 3) |
| languages | `prisma-languages` | `libs/prisma/languages/db/schema.prisma` | `PG_DATABASE_URL_LANGUAGES` | `api-languages`                                                               |
| media     | `prisma-media`     | `libs/prisma/media/db/schema.prisma`     | `PG_DATABASE_URL_MEDIA`     | `api-media`                                                                   |

#### Which Steps Do I Need?

| Change Type                              | Prisma Steps (1-3) |     GraphQL Steps (4-7)      |
| ---------------------------------------- | :----------------: | :--------------------------: |
| New field (exposed in GraphQL)           |        Yes         |             Yes              |
| New field (internal only)                |        Yes         |              No              |
| New enum                                 |        Yes         |             Yes              |
| Change nullability                       |        Yes         | Yes (if field is in GraphQL) |
| New model/table                          |        Yes         |       Yes (if exposed)       |
| Rename/change field type                 |        Yes         | Yes (if field is in GraphQL) |
| New query or mutation (no schema change) |         No         |             Yes              |
| GraphQL-only change (no DB change)       |         No         |             Yes              |

#### Workflow

##### Prisma Steps (schema changes only)

**Step 1: Edit the Prisma schema**

Edit the relevant `schema.prisma` file from the domain reference table above.

**Step 2: Generate Prisma client**

```bash
nx prisma-generate prisma-<domain>
```

**Step 3: Create and run migration**

```bash
nx prisma-migrate prisma-<domain>
```

This creates a SQL migration file with a timestamped name and runs it against your local database.

> **Exception:** The `analytics` domain does not use migrations. Its database is managed externally. Use `nx prisma-introspect prisma-analytics` to pull the current schema instead of running `prisma-migrate`.

CI enforces this: the `prisma-migration-check` job fails any PR that edits a `schema.prisma` without adding a migration in the same domain. If the edit genuinely needs no migration (comments, formatting), add the `skip-migration-check` label to the PR and re-run the failed job.

##### GraphQL Steps (when the change affects GraphQL)

**Step 4: Update GraphQL type definitions**

This differs by API:

- **api-journeys (Pothos):** Edit the Pothos schema code in `apis/api-journeys/src/schema/`. The types are defined in TypeScript.
- **Other APIs (Pothos):** Edit the Pothos schema code in `apis/<api>/src/schema/`.

**Step 5: Generate GraphQL schema for each affected API**

Run `generate-graphql` for **every API whose GraphQL type definitions you updated in Step 4**:

```bash
nx generate-graphql <api-name>
```

For example, if you changed the journeys schema:

```bash
nx generate-graphql api-journeys
```

**Step 6: Recompose the gateway schema**

```bash
nx generate-graphql api-gateway
```

This uses Hive to compose all subgraph schemas into `apis/api-gateway/schema.graphql`.

> If `nf start` is already running, the `gateway-watcher` process handles this automatically.

**Step 7: Run frontend codegen**

```bash
nx run-many -t codegen
```

This regenerates TypeScript types for all frontend projects that depend on the gateway schema: `journeys-admin`, `journeys`, `watch`, `resources`, `journeys-ui`, and `shared-gql`.

#### Troubleshooting

##### "Environment is non-interactive" error during migration

If `nx prisma-migrate prisma-<domain>` fails with:

```text
Error: Prisma Migrate has detected that the environment is non-interactive, which is not supported.
```

Run the migration manually by combining the database URL env var with the prisma command:

```bash
PG_DATABASE_URL_<DOMAIN>=postgresql://postgres:postgres@db:5432/<domain>?schema=public bash -c 'pnpm exec prisma migrate dev --config libs/prisma/<domain>/prisma.config.ts --name "$(date +"%Y%m%d%H%M%S")"'
```

The `--name` flag is required to avoid an interactive prompt for the migration name. The database URL above uses the default devcontainer values (`db` hostname, `postgres`/`postgres` credentials) — substitute your actual values if your local setup differs.

For example, for the journeys domain:

```bash
PG_DATABASE_URL_JOURNEYS=postgresql://postgres:postgres@db:5432/journeys?schema=public bash -c 'pnpm exec prisma migrate dev --config libs/prisma/journeys/prisma.config.ts --name "$(date +"%Y%m%d%H%M%S")"'
```

##### `P3006`: a historical migration fails to apply to the shadow database

If `nx prisma-migrate prisma-<domain>` fails with `P3006` on a migration **unrelated to your change** (e.g. `constraint ... does not exist`), or `prisma migrate deploy` dies replaying history (e.g. `type "X" already exists`), the local migration history has drifted. Don't replay history — generate the migration by diffing the **live local DB** against the new schema (run from the prisma project dir so `prisma.config.ts` autoloads):

```bash
cd libs/prisma/<domain>
export PG_DATABASE_URL_<DOMAIN>=postgresql://postgres:postgres@db:5432/<domain>?schema=public
pnpm exec prisma migrate diff --from-config-datasource prisma.config.ts --to-schema db/schema.prisma --script
```

Write the emitted SQL (minus Prisma's banner) to `db/migrations/<timestamp>_<name>/migration.sql`, apply it with `psql -v ON_ERROR_STOP=1 -f`, then record it in `_prisma_migrations` (checksum = `sha256sum` of the file) so it isn't re-applied. Confirm the SQL is purely additive. A plain file-to-file `migrate diff --from-schema OLD --to-schema NEW` can silently return empty — use `--from-config-datasource`. Full procedure: `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md`.

##### "Running generate... Error" after migration

If the migration succeeds but prisma generate fails, run it separately:

```bash
nx prisma-generate prisma-<domain>
```

##### `nx codegen` serves stale output (cache hit)

If `nx run-many -t codegen` logs "read the output from the cache" and the generated types (e.g. `libs/shared/gql/src/__generated__/graphql-env.d.ts`) are missing a field that **is** present in `apis/api-gateway/schema.graphql`, the codegen cache key didn't capture the upstream gateway-schema change. Re-run with the cache disabled:

```bash
nx run-many -t codegen --skip-nx-cache
```

See `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md`.

##### `codegen` fails at schema load: `Directive "deprecated" may not be used on INPUT_FIELD_DEFINITION`

The frontend codegen targets that use the legacy `apollo client:codegen` CLI (`journeys`, `journeys-admin`, `journeys-ui`, `resources`, `watch`) reject `@deprecated` on input fields and arguments — their bundled validator predates graphql-js 15.5, and the failure is all-or-nothing at schema load. `generate-graphql` and the gateway compose (Steps 5–6) pass; only Step 7 fails. Do not add `deprecationReason` to Pothos **input** fields — express the deprecation in the field `description` text instead, and keep `@deprecated` on output fields (legal in every consumer).

See `docs/solutions/build-errors/apollo-codegen-deprecated-directive-input-field-2026-06-08.md`.

#### Common Mistakes to Avoid

- **Do NOT edit `schema.graphql` directly** in any API — it is auto-generated. Edit the Pothos schema code instead. The `graphql-schema-check` CI job regenerates every schema and fails on any diff, so stale or hand-edited schema files fail CI rather than merging silently.
- **Do NOT forget `generate-graphql api-gateway`** after updating any subgraph schema — the gateway supergraph must be recomposed.
- **Do NOT forget `nx run-many -t codegen`** — frontend TypeScript types will be stale until codegen runs.
- **Do NOT skip generating for all APIs that share a prisma domain** — when multiple APIs share one Prisma schema, regenerate GraphQL for each of them.
- **Do NOT trust a `codegen` cache hit after a gateway-schema change** — `nx run-many -t codegen` can replay stale output; run with `--skip-nx-cache` or grep the generated artifacts for the new field.
- **Do NOT add `deprecationReason` to Pothos input fields** — the legacy apollo CLI codegen consumers fail at schema load; put the deprecation in the field description instead (see Troubleshooting).

### GraphQL Federation

- `api-journeys` is a **Federation 2.6 subgraph**.
- Use `@key` directives for entity resolution, `@shareable` for fields exposed by multiple subgraphs.
- Gateway composes schemas at runtime — no manual stitching.

### Authentication

- Firebase JWT tokens parsed from `Authorization: JWT <token>` header.
- User roles fetched from `UserRole` table in Prisma.
- Three context types: `authenticated` (JWT user), `interop` (service-to-service), `public` (anonymous).

### Logging

- Pino logger everywhere.
- Pretty-print in dev, structured JSON in production.

### Testing

- `api-journeys`: Vitest + `vitest-mock-extended` for Prisma mocking.
- `mockDeep<PrismaClient>()` for deep mocks.

## api-journeys (Pothos + Yoga)

### Schema organization

```
apis/api-journeys/src/
  schema/
    builder.ts                     # Pothos SchemaBuilder with plugins
    journey/
      journey.ts                   # builder.prismaObject('Journey', {...})
      journey.acl.ts               # Function-based auth (no CASL)
      journey.acl.spec.ts
      adminJourney.query.ts        # Query field definition
      adminJourney.query.spec.ts
      inputs/                      # GraphQL input types
    block/
    action/
    enums/
    ...
  lib/
    recalculateJourneyCustomizable/  # Customizable sync logic
  workers/                         # Async tasks
  yoga.ts                          # Yoga server setup with plugins
  index.ts                         # HTTP server entry point
```

### Key patterns

- **Schema:** Code-first via Pothos — `builder.prismaObject()`, `builder.queryField()`, `builder.mutationField()`.
- **Plugins:** Tracing, ScopeAuth, Prisma, Relay, WithInput, Directives, Federation.
- **Auth:** Scope auth plugin with function-based checks — `journeyAcl(action, journey, user)`.
- **Prisma access:** Direct import from `@core/prisma/journeys/client` — no service wrapper.
- **Caching:** `@graphql-yoga/plugin-response-cache` (in-memory).

### Test pattern

```typescript
import { prismaMock } from '../../../test/prismaMock'

describe('recalculateJourneyCustomizable', () => {
  beforeEach(() => {
    prismaMock.chatButton.findMany.mockResolvedValue([])
  })

  it('should set customizable to true when conditions met', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(baseJourney)
    await recalculateJourneyCustomizable('journeyId')
    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: true }
    })
  })
})
```

---

## api-gateway (Hive Gateway)

Minimal configuration — **no resolver logic**. Purely composes subgraphs.

- Config: `gateway.config.ts` and `src/common.config.ts`
- JWT validation: Firebase JWKS with RS256
- Header propagation: `user-agent`, `x-forwarded-for`, `x-graphql-client-name`, `interop-token`
- Special case: `authorization` header forwarded only to `api-analytics` subgraph
- Health check: `/health` endpoint

Changes here are rare. When they happen, review for:

- Header propagation correctness (missing headers break downstream services)
- JWT configuration accuracy
- Subgraph naming consistency

---

## Critical: customizable blocks sync rule

**This is a guardrail — violations are Critical in reviews.**

When adding or modifying a `customizable` field on a block or action type, the recalculation logic in `apis/api-journeys/src/lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable.ts` must be updated. The logic checks:

1. **Editable text fields:** `journeyCustomizationDescription` is non-empty AND `journeyCustomizationFields` count > 0
2. **Customizable link actions:** ButtonBlock, RadioOptionBlock, VideoBlock, or VideoTriggerBlock with `action.customizable === true` AND `action.blockId == null` (excludes NavigateToBlockAction)
3. **Customizable media:** ImageBlock or VideoBlock with `block.customizable === true`
4. **Chat buttons:** `chatButton.customizable === true`

Any mutation that modifies `customizable` on a block, action, or chat button **must call the recalculation function** after the database write.

---

## ACL

Authorization uses pure functions — `journeyAcl(action, journey, user): boolean`. When modifying access rules, verify with tests.

---

## Quality gates

```bash
# api-journeys
pnpm dlx nx run api-journeys:lint
pnpm dlx nx run api-journeys:type-check
pnpm dlx nx run api-journeys:test
pnpm dlx nx run api-journeys:generate-graphql  # regenerate schema
pnpm dlx nx run api-journeys:subgraph-check    # validate against Hive

# Prisma
pnpm dlx nx run prisma-journeys:prisma-generate       # after schema changes
```
