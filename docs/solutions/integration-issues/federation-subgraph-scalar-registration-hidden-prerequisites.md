---
title: 'Adding updatedAt timestamps and updatedSince filtering to GraphQL subgraphs'
category: integration-issues
date: '2026-03-24'
tags:
  - graphql
  - pothos
  - prisma
  - apollo-federation
  - datetime-scalar
  - schema-migration
  - backward-compatibility
module: 'apis/api-languages, apis/api-media'
symptom: 'DateTime fields fail to serialize in api-languages subgraph; spec overclaims migration scope; breaking changes introduced silently via arg replacement and default limits'
root_cause: >
  The api-languages Pothos builder lacked a DateTime scalar registration
  (DateTimeResolver import, Scalars generic entry, and addScalarType call),
  which is a prerequisite for any DateTime field exposure but was not called
  out in the implementation spec. Additionally, the spec incorrectly stated
  that all 9 entities needed updatedAt columns added via Prisma migration,
  when only the Country model was missing it. Finally, the spec proposed
  replacing existing query arguments with a `where` filter input, which would
  have been a breaking change to downstream consumers.
---

## Problem

When adding `updatedAt` timestamps and `updatedSince` filtering to GraphQL entities across multiple subgraphs in a Pothos + Prisma + Apollo Federation codebase, several non-obvious prerequisites and pitfalls emerged that the original specification did not account for. These ranged from missing scalar registrations in specific subgraphs to unnecessary migration work and accidental breaking changes.

## Root Cause

The issues stem from a combination of factors inherent to federated GraphQL architectures:

1. **Subgraph independence**: Each subgraph maintains its own Pothos builder with its own scalar registrations. A scalar available in one subgraph (api-media) is not automatically available in another (api-languages). The lack of a shared builder configuration means each subgraph must independently declare every scalar it uses.

2. **Schema assumption drift**: The specification was written against an assumed state of the database rather than the actual state. Over time, most models had already gained `updatedAt` columns through prior work, but the spec was never reconciled against the live Prisma schemas.

3. **Additive vs. replacement API design**: The natural instinct to "clean up" an existing query signature by replacing positional arguments with a structured `where` input creates a breaking change for all existing consumers of that query.

## Solution

### 1. Register the DateTime scalar in every subgraph that needs it

Before exposing any `DateTime` field or accepting a `DateTime` input argument, the subgraph's Pothos builder must have the scalar registered. The three-step pattern is:

```typescript
// 1. Import the resolver from graphql-scalars
import { DateTimeResolver } from 'graphql-scalars'

// 2. Declare the scalar in the builder's generic type map
Scalars: {
  DateTime: {
    Input: Date
    Output: Date
  }
}

// 3. Register the scalar on the builder instance
builder.addScalarType('DateTime', DateTimeResolver)
```

This is safe across federation boundaries. In Apollo Federation v2.6, scalars are inherently shareable and do not require explicit `@shareable` directives.

### 2. Audit the actual schema before writing migrations

Run a direct check against the Prisma schema files to determine which models genuinely lack the column:

```bash
# For each model, check whether updatedAt already exists
# Use sed to extract the full model block (handles models of any length)
sed -n '/^model Country {/,/^}/p' schema.prisma | grep updatedAt
```

In this case, only 1 of 9 models (Country) was missing `updatedAt`. The remaining 8 already had `updatedAt DateTime @default(now()) @updatedAt`, eliminating 8 unnecessary migrations.

### 3. Add new arguments alongside existing ones -- never replace

Instead of replacing the existing query signature:

```graphql
# Breaking: removes existing args consumers depend on
countries(where: CountriesFilter!): [Country!]!
```

Add the new argument as an optional addition:

```graphql
# Non-breaking: existing calls continue to work unchanged
countries(ids: [ID!], term: String, where: CountriesFilter): [Country!]!
```

In GraphQL, new optional arguments are always non-breaking. Existing clients that do not pass `where` are unaffected.

### 4. Keep scope boundaries strict during implementation

Resist the temptation to bundle adjacent improvements (default query limits, pagination on unbounded queries) into a feature PR. These are behavioral changes that can silently break consumers. Each behavioral change belongs in its own PR with its own review and rollout plan.

### 5. Review staged diffs for unintended linter modifications

Before committing, inspect the full diff for changes introduced by auto-formatting or linting rather than by intentional edits. A common case: linters removing `as any` casts that exist deliberately to access runtime-injected properties not present in the static type:

```typescript
// SAFETY: _requestedLanguageId is injected at runtime in resolveReference
const requestedLanguageId = (video as any)._requestedLanguageId as string | undefined
```

Run `git diff --staged` and scan for removals or modifications you did not make yourself.

## Key Patterns

- **Scalar registration is per-subgraph**: In a federated architecture, never assume a scalar available in one subgraph exists in another. Treat each subgraph's builder as an independent type system.

- **Verify before generating**: Always diff the specification against the actual codebase state before producing migrations or schema changes. Stale assumptions in a spec can multiply into unnecessary work.

- **Additive-only public API changes**: Treat any GraphQL query or mutation signature used by external consumers as a public contract. New optional arguments and new fields are safe. Removing, renaming, or restructuring existing arguments is a breaking change.

- **One behavioral change per PR**: Feature additions (new fields, new filters) and behavioral modifications (default limits, changed sort orders) must ship separately. Mixing them obscures the blast radius of each change.

- **Linter trust but verify**: Automated tooling is a net positive, but its changes must be reviewed with the same scrutiny as hand-written code. Runtime-injected properties and intentional type assertions should be preserved and annotated with `// SAFETY:` comments.

## Prevention Checklist

- [ ] If a new field type (DateTime, BigInt, etc.) is introduced in a subgraph, confirm the Pothos builder in _that specific subgraph_ has the scalar registered
- [ ] For every migration in a spec, verify the column/table doesn't already exist in the actual Prisma schema before writing the migration
- [ ] Any modification to existing query arguments must be classified as breaking or non-breaking before implementation
- [ ] Compare the PR diff against the original ticket -- flag any behavioral change not explicitly requested and split into a separate PR
- [ ] After running linter auto-fixes, search the diff for removed type assertions (`as any`, `as unknown`) and verify each removal is safe

## Related

- `docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md` -- Related Pothos + Prisma gotcha (different failure mode but same domain)
