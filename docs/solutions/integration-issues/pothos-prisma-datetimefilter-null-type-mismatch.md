---
title: 'Pothos-to-Prisma DateTimeFilter null type mismatch'
category: integration-issues
date: 2026-03-24
severity: medium
module: apis/api-media, apis/api-languages
tags: [graphql, pothos, prisma, typescript, type-mismatch, nullable, filter-input]
related_issues: []
related_docs:
  - docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md
  - docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md
---

# Pothos-to-Prisma DateTimeFilter Null Type Mismatch

## Problem

When defining optional input fields in a Pothos `inputType` and passing the inferred type directly to a Prisma `where` clause, TypeScript raises **TS2322**: `null is not assignable to Date | undefined`.

```
error TS2322: Type '{ gte?: Date | null; lte?: Date | null }' is not assignable
to type 'DateTimeFilter<"Video">'.
  Types of property 'gte' are incompatible.
    Type 'Date | null | undefined' is not assignable to type 'Date | undefined'.
```

## Root Cause

Pothos and Prisma have different nullable semantics for optional fields:

| Library    | `required: false` infers as | Meaning                                                                     |
| ---------- | --------------------------- | --------------------------------------------------------------------------- |
| **Pothos** | `T \| null \| undefined`    | Field can be absent, explicitly null, or a value                            |
| **Prisma** | `T \| undefined`            | Field can be absent or a value; `null` is **not** accepted in filter inputs |

A simple `!= null` guard on the outer filter object is insufficient because the **inner fields** (`gte`, `lte`) can still be `null` after the guard passes.

## Solution

Create a `toPrismaDateTimeFilter()` helper that strips `null` from inner fields using nullish coalescing (`??`):

```typescript
// In builder.ts
export const DateTimeFilter = builder.inputType('DateTimeFilter', {
  fields: (t) => ({
    gte: t.field({ type: 'DateTime', required: false }),
    lte: t.field({ type: 'DateTime', required: false })
  })
})

type DateTimeFilterInput = typeof DateTimeFilter.$inferInput

export function toPrismaDateTimeFilter(filter: DateTimeFilterInput | null | undefined): { gte?: Date; lte?: Date } | undefined {
  if (filter == null) return undefined
  return { gte: filter.gte ?? undefined, lte: filter.lte ?? undefined }
}
```

Usage in resolvers (consistent pattern):

```typescript
// Build a Prisma filter object, assign converted value
const filter: Prisma.VideoWhereInput = {}
filter.updatedAt = toPrismaDateTimeFilter(where?.updatedAt)
// Prisma ignores undefined values, so this is safe when no filter provided
```

### Why `?? undefined` works

The nullish coalescing operator `??` returns the right-hand operand when the left is `null` or `undefined`. This converts Pothos's `Date | null | undefined` to Prisma's `Date | undefined`:

- `new Date('2025-01-01') ?? undefined` → `Date` (passes through)
- `null ?? undefined` → `undefined` (strips null)
- `undefined ?? undefined` → `undefined` (no-op)

## Investigation Steps

1. **Direct pass-through** — Passed Pothos `$inferInput` directly to Prisma `where` → TS2322 on null
2. **Outer null guard** — Added `if (filter != null)` check → still fails because `filter.gte` can be `null`
3. **Object.keys length check** — Built intermediate object, checked for empty → worked but unnecessarily complex
4. **Nullish coalescing** — Used `filter.gte ?? undefined` → clean, minimal, correct

## Prevention

- **Pattern**: When passing any Pothos `inputType` field to Prisma `where`, always convert via a helper that strips `null`. This applies to any scalar filter, not just `DateTime`.
- **Consistency**: Use the same filter assignment pattern across all resolvers (direct property assignment to a `Prisma.XxxWhereInput` object) rather than mixing patterns.
- **Codegen sync**: After renaming filter fields, regenerate all downstream types (gql.tada via `nx run shared-gql:codegen`, Apollo Client globalTypes via app-specific codegen scripts).
- **Test coverage**: Add filter-specific tests for every entity that accepts a new filter input, asserting both the Prisma call shape and response serialization.

## Cross-References

- [Federation Subgraph Scalar Registration Prerequisites](./federation-subgraph-scalar-registration-hidden-prerequisites.md) — covers the prerequisite of registering `DateTime` scalar per-subgraph before this filter can work
- [Pothos Query Parameter Ignored](../logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md) — related Pothos + Prisma gotcha with `_query` parameter in `prismaField` resolvers
