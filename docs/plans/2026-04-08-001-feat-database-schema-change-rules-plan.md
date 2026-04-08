---
title: "feat: Add database schema change workflow rules for Claude and Cursor"
type: feat
status: completed
date: 2026-04-08
---

# feat: Add database schema change workflow rules for Claude and Cursor

## Overview

Create Claude and Cursor rule files that document the end-to-end workflow for database schema changes in this Nx monorepo. The rules auto-activate when editing Prisma schema files, GraphQL SDL files, or Pothos schema files, guiding the AI through the complete sequence: schema edit -> Prisma generate -> migrate -> GraphQL schema generation -> gateway composition -> frontend codegen.

## Problem Frame

The team has an Obsidian note documenting the steps needed after modifying the database schema. This institutional knowledge needs to be embedded in the development tools (Claude Code and Cursor) so AI assistants automatically follow the correct workflow. The note currently only covers "adding a new field to api-journeys" but the workflow applies more broadly to all schema change types (enums, nullable changes, new models, new queries) and all five prisma domains.

## Requirements Trace

- R1. Claude rule file that auto-triggers on prisma/graphql file changes
- R2. Cursor rule file with equivalent content in `.mdc` format
- R3. Cover all schema change types: new fields, new enums, nullable changes, new models, field type changes, new queries/mutations
- R4. Generalize across all prisma domains (journeys, users, analytics, languages, media), not hardcode journeys
- R5. Document both api-journeys (SDL-first/Rover, needs running server) and modern APIs (Pothos/static, no server needed)
- R6. Include troubleshooting for common errors (non-interactive environment, prisma generate failures)
- R7. Include the codegen step for all affected frontend projects

## Scope Boundaries

- NOT creating an invokable command/skill (slash command) — this is contextual guidance that auto-triggers
- NOT documenting E2E testing or deployment workflows — only the local dev schema change loop
- NOT covering database seeding or data backfills — only DDL schema changes and the resulting codegen cascade

## Context & Research

### Relevant Code and Patterns

**Prisma libraries** (5 domains, identical target structure):

| Domain | Nx Project | Schema Path | DB URL Env Var |
|--------|-----------|-------------|----------------|
| journeys | `prisma-journeys` | `libs/prisma/journeys/db/schema.prisma` | `PG_DATABASE_URL_JOURNEYS` |
| users | `prisma-users` | `libs/prisma/users/db/schema.prisma` | `PG_DATABASE_URL_USERS` |
| analytics | `prisma-analytics` | `libs/prisma/analytics/db/schema.prisma` | `PG_DATABASE_URL_ANALYTICS` |
| languages | `prisma-languages` | `libs/prisma/languages/db/schema.prisma` | `PG_DATABASE_URL_LANGUAGES` |
| media | `prisma-media` | `libs/prisma/media/db/schema.prisma` | `PG_DATABASE_URL_MEDIA` |

Each has identical targets: `prisma-generate`, `prisma-migrate`, `prisma-reset`, `prisma-validate`, `prisma-studio`.

**Prisma domain → API mapping:**

| Prisma Domain | APIs That Use It |
|---------------|-----------------|
| journeys | `api-journeys`, `api-journeys-modern` (shared) |
| users | `api-users` |
| analytics | `api-analytics` |
| languages | `api-languages` |
| media | `api-media` |

**GraphQL generation** (two distinct approaches):

- **api-journeys (legacy, SDL-first)**: `.graphql` files at `apis/api-journeys/src/app/**/*.graphql`. `nx generate-graphql api-journeys` runs `@apollo/rover` introspection — **requires the server running on port 4001**. Needs `nf start` or `nx serve api-journeys`.
- **All other APIs (Pothos, code-first)**: Schema code at `apis/<api>/src/schema/`. `nx generate-graphql <api>` runs `GENERATE_SCHEMA=true` static export — **no running server needed**.
- **api-gateway**: `nx generate-graphql api-gateway` uses Hive to compose all subgraph schemas into `apis/api-gateway/schema.graphql`.

**Frontend codegen** (7 projects depend on gateway schema):
- `api-journeys`, `journeys-admin`, `journeys`, `watch`, `resources`, `journeys-ui`, `shared-gql`
- All triggered via `nx run-many -t codegen`

**Existing rule formats**:
- Claude path-scoped: `paths:` array in YAML frontmatter, organized in subdirectories (`backend/`, `frontend/`, `infra/`)
- Cursor: `description:`, `globs:`, `alwaysApply:` frontmatter, `.mdc` extension, flat in `.cursor/rules/`
- Both maintain similar content; some carry `<!-- Keep in sync with ... -->` comments

### Institutional Learnings

None found in `docs/solutions/`.

## Key Technical Decisions

- **Path-scoped rule (not `.dev.md`)**: The rule should auto-activate when editing schema/graphql files, not be always-loaded into context. This avoids context bloat for unrelated work while ensuring the AI sees it exactly when needed.
- **Placed in `backend/` subdirectory for Claude**: Follows existing convention (`backend/apis.md`, `backend/workers.md`).
- **Generalized with a domain lookup table**: Rather than hardcoding journeys commands, the rule uses the `prisma-<domain>` pattern and a lookup table so it works for any domain.
- **Decision matrix for change types**: A table showing which steps are needed for each change type (schema-only vs schema+graphql vs graphql-only) helps the AI skip unnecessary steps.
- **Separate sections for SDL-first vs Pothos**: api-journeys has a fundamentally different `generate-graphql` workflow (needs running server for Rover) that must be clearly called out.
- **One rule file each**: Not splitting into multiple rules per scenario — a single comprehensive rule with clear sections is more maintainable and avoids partial-load issues.

## Open Questions

### Resolved During Planning

- **Rule or command?**: Rule. The workflow is contextual guidance that should auto-trigger when editing relevant files, not a manually invoked action.
- **Does api-journeys-modern need separate prisma steps?**: No. It shares `prisma-journeys`. Schema changes for both APIs happen in `libs/prisma/journeys/db/schema.prisma`. But `generate-graphql` must be run for **both** `api-journeys` and `api-journeys-modern` when the journeys schema changes affect GraphQL.
- **Which `generate-graphql` targets need running for a journeys schema change?**: If the change is exposed in GraphQL, run `generate-graphql` for every API that uses the affected prisma domain. For journeys, that means both `api-journeys` and `api-journeys-modern`, plus `api-gateway`.

### Deferred to Implementation

- Exact wording may be refined during review.

## Implementation Units

- [ ] **Unit 1: Create Claude rule file**

**Goal:** Create a path-scoped Claude rule that documents the database schema change workflow.

**Requirements:** R1, R3, R4, R5, R6, R7

**Dependencies:** None

**Files:**
- Create: `.claude/rules/backend/database-schema-changes.md`

**Approach:**
- YAML frontmatter with `paths:` covering prisma schema, graphql SDL, and Pothos schema files
- Content sections in workflow order:
  1. "Applies when" trigger description
  2. Domain lookup table (prisma project name, schema path, env var, associated APIs)
  3. Decision matrix — which steps are needed per change type
  4. Step-by-step workflow: Schema edit -> `prisma-generate` -> `prisma-migrate` -> GraphQL updates -> `generate-graphql` (per API) -> `generate-graphql api-gateway` -> `nx run-many -t codegen`
  5. api-journeys-specific notes (SDL files, Rover introspection, server must be running)
  6. api-journeys-modern notes (Pothos code-first, static generation, shares prisma-journeys)
  7. Troubleshooting: non-interactive environment error, prisma generate failures, env var issues

**Patterns to follow:**
- `.claude/rules/backend/apis.md` — YAML frontmatter with `paths:` array
- `.claude/rules/running-tests.dev.md` — command documentation style with tables, examples, and "Common mistakes to avoid"

**Test expectation:** none — documentation/configuration file

**Verification:**
- File has valid YAML frontmatter with `paths:` array
- All 5 prisma domains are generalizable from the lookup table
- Both SDL-first (api-journeys) and Pothos (modern APIs) workflows are documented
- Troubleshooting covers non-interactive env error and prisma generate failure
- Decision matrix covers: new field, new enum, nullable change, new model, new query/mutation, graphql-only change

- [ ] **Unit 2: Create Cursor rule file**

**Goal:** Create an equivalent Cursor rule with the same workflow content in `.mdc` format.

**Requirements:** R2, R3, R4, R5, R6, R7

**Dependencies:** Unit 1 (content is shared, adapted to Cursor format)

**Files:**
- Create: `.cursor/rules/database-schema-changes.mdc`

**Approach:**
- Cursor frontmatter: `description:`, `globs:`, `alwaysApply: false`
- `globs:` pattern matching the Claude `paths:` values
- Content mirrors the Claude rule
- Include `<!-- Keep in sync with .claude/rules/backend/database-schema-changes.md -->` sync comment
- Reference base rule: `- @base.mdc` (following existing pattern from `apis.mdc`)

**Patterns to follow:**
- `.cursor/rules/apis.mdc` — frontmatter format and base rule reference
- `.cursor/rules/qa-requirements.dev.mdc` — contextual guidance style

**Test expectation:** none — documentation/configuration file

**Verification:**
- File has valid Cursor frontmatter with `globs:` patterns
- Content is functionally equivalent to the Claude rule
- Sync comment references the Claude rule file path

## System-Wide Impact

- **Interaction graph:** Rules are loaded by Claude Code / Cursor when editing matching files. No runtime code impact.
- **API surface parity:** The two rule files (Claude + Cursor) should be kept in sync. A sync comment at the top of each signals this.
- **Unchanged invariants:** Existing rules (`backend/apis.md`, `backend/workers.md`) are not modified. The new rule complements them — `apis.md` covers general backend coding style, this rule covers the procedural schema change workflow.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Rule files drift out of sync (Claude vs Cursor) | Sync comments in both files. Content is nearly identical, only frontmatter differs. |
| Prisma target names change | Rule uses generalizable `prisma-<domain>` pattern with lookup table |
| Path patterns too broad (triggering on irrelevant files) | Scoped to `*.prisma`, `*.graphql`, and `*/schema/**/*.ts` — narrow enough to avoid false positives |
| New APIs added in future | Lookup table pattern is extensible; new domains just add a row |

## Sources & References

- Prisma config: `libs/prisma/journeys/project.json`, `libs/prisma/users/project.json`
- GraphQL generation: `apis/api-journeys/project.json`, `apis/api-journeys-modern/project.json`, `apis/api-gateway/project.json`
- Existing Claude rules: `.claude/rules/backend/apis.md`, `.claude/rules/running-tests.dev.md`
- Existing Cursor rules: `.cursor/rules/apis.mdc`, `.cursor/rules/qa-requirements.dev.mdc`
- Procfile: `Procfile` (nf start services)
