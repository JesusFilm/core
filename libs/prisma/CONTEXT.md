# Prisma (persistence kernel)

Not a domain — the shared persistence layer of the API contexts: one Prisma schema per context-owned logical database, plus the conventions for generating clients, migrating, and seeding them. Each subdirectory (`journeys`, `media`, `languages`, `users`, `analytics`) is the storage of _another_ bounded context; this lib owns only the persistence vocabulary below.

## Language

**Cluster**:
The single Aurora PostgreSQL instance per Environment (`jfp-core` — see the Infrastructure context) that all Logical Databases live in.
_Avoid_: "the database" (ambiguous — see Logical Database)

**Logical Database**:
One named database inside the Cluster, owned by exactly one API context: `journeys`, `media`, `languages`, `users`, plus Plausible's own database for analytics. The unit of ownership and of connection URL (`PG_DATABASE_URL_<DOMAIN>`).

**Schema (two meanings)**:
A **Prisma schema** is a `schema.prisma` file targeting exactly one Logical Database; the **Postgres schema** is always `public`. Say "Prisma schema" or "Postgres schema" — never bare "schema" — when the distinction matters.

**Client**:
The generated, per-context PrismaClient singleton (`@core/prisma/<domain>/client`). Clients are not interchangeable: model names recur across contexts (a `Language` type exists in more than one), and importing the wrong client compiles but reads the wrong database.
_Avoid_: "the prisma client" without naming the domain

**Migration**:
A timestamp-named SQL migration owned by the context's Prisma schema; applied with `migrate deploy` on the production path. Only the four owned schemas migrate — the Introspected Schema never does.

**Squashed Baseline**:
The `000000000000_squashed_migrations` baseline that the journeys and media histories were collapsed into; existing databases mark it applied rather than running it.

**Introspected Schema**:
The analytics special case: its Prisma schema is _pulled_ (`db pull`) from Plausible Analytics' externally-managed database, never migrated or seeded from here. Its models look foreign on purpose — snake*case names, bigint autoincrement ids — because Plausible's Elixir stack owns the DDL.
\_Avoid*: treating analytics like the owned schemas (it has no migrations to write)

**Seed**:
The journeys-only bootstrap data (teams, NUA templates, onboarding, Playwright user access), re-run when its manual version marker is bumped. No other schema seeds.

**Pothos Types**:
The generated GraphQL-integration types emitted alongside every Client — the coupling point between a context's persistence and its Pothos schema layer.

### Terminology traps

**Cross-context reads**:
The Clients do not respect context boundaries at runtime: api-journeys reads the `users` and `media` databases directly (auth scopes, deletion checks, email/cleanup workers), and api-media reads `languages` and `journeys` (hasVideos flag, journeys access). The context map's "references by id, resolved by federation" story describes the GraphQL surface only — the persistence layer takes shortcuts. When discussing ownership, say whether you mean the API boundary or the database boundary.

**Directory name ≠ deployable**:
Subdirectories are named by domain (`journeys`), Nx projects by `prisma-<domain>`, imports by `@core/prisma/<domain>`; none of these are the API's name (`api-journeys`), and `api-gateway`/`api-journeys-modern` own no schema here at all.

**Dev database naming (analytics)**:
In local dev the analytics Client points at `plausible_db` while introspect/reset targets a database named `analytics` — same context, two local database names.
