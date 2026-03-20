---
name: create-api-journeys-override
description: >-
  Create an override for a query, mutation, or resolver field from api-journeys
  (NestJS) in api-journeys-modern (Pothos + GraphQL Yoga) using Apollo
  Federation @override. Use when the user says "create override for <name>",
  or asks to migrate, override, or move any resolver from api-journeys to
  api-journeys-modern.
---

# Create Override from api-journeys to api-journeys-modern

## Architecture

| | api-journeys (legacy) | api-journeys-modern (target) |
|---|---|---|
| Path | `apis/api-journeys/` | `apis/api-journeys-modern/` |
| Stack | NestJS, schema-first GraphQL | Pothos code-first, GraphQL Yoga |
| Federation | Subgraph | Subgraph with `@override` directives |
| DB | Shared Prisma schema at `libs/prisma/journeys/` | Same |

Overrides use `override: { from: 'api-journeys' }` in the Pothos field definition, which emits `@override(from: "api-journeys")` in the Federation schema.

## Steps

### 1. Read the source resolver in api-journeys

Find the resolver under `apis/api-journeys/src/app/modules/`. Identify:
- **Type**: query, mutation, or field resolver
- **Args and input types**
- **Authorization logic** (CASL guards, ability checks)
- **Database operations** (direct Prisma calls vs service methods)
- **Post-mutation side effects** (e.g. `recalculate()`, `setJourneyUpdatedAt`)

### 2. Find or create Pothos types

**Input types** may already exist in api-journeys-modern under `inputs/` directories. Search for them first.

If not found, create following the Pothos pattern:

```typescript
import { builder } from '../../../builder'

export const ExampleInput = builder.inputType('ExampleInput', {
  fields: (t) => ({
    fieldName: t.string({ required: false }),
  })
})
```

Export from the domain's `inputs/index.ts`.

**Object types** (return types) may also exist. If not, create as either a Pothos `prismaObject` or plain `objectType` depending on the domain.

### 3. Create the override file

File naming convention:
- Mutations: `<fieldName>.mutation.ts`
- Queries: `<fieldName>.query.ts`

Use `builder.mutationField` or `builder.queryField` accordingly.

---

#### Mutation template (block domain)

For block-related mutations, use the shared block service:

```typescript
import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { ExampleBlock } from './example'
import { ExampleBlockUpdateInput } from './inputs'

builder.mutationField('exampleBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: ExampleBlock,
    nullable: true,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ExampleBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      await authorizeBlockUpdate(id, context.user)
      return await update(id, { ...input })
    }
  })
)
```

Conventions:
- `authorizeBlockCreate` for creates, `authorizeBlockUpdate` for updates
- `update()` from `../service` handles action upsert, `setJourneyUpdatedAt`, `recalculateJourneyCustomizable`
- `nullable: true` for updates (errors return null), `nullable: false` for creates
- Keep the deprecated `journeyId` arg for backwards compat

---

#### Mutation template (non-block domain)

For non-block mutations, use direct Prisma calls and domain-specific auth:

```typescript
import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { ExampleInput } from './inputs'
import { ExampleRef } from './example'

builder.mutationField('exampleUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: ExampleRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        input: t.arg({ type: ExampleInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        // auth + prisma logic here
      }
    })
)
```

Use `.prismaField()` when the return type is a Prisma model ref and you want automatic relation resolution; use `.field()` otherwise.

---

#### Query template

```typescript
import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { ExampleRef } from './example'

builder.queryField('exampleQuery', (t) =>
  t.withAuth({ isAuthenticated: true, isAnonymous: true }).prismaField({
    type: ExampleRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      // auth + prisma logic here
    }
  })
)
```

### 4. Register the override

Add the import to the domain's `index.ts`:

```typescript
import './exampleUpdate.mutation'
```

Verify the domain index is imported in `src/schema/schema.ts`.

### 5. Create the test file

Name: `<fieldName>.<query|mutation>.spec.ts`

**Block mutation test template:**

```typescript
import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: jest.fn()
}))

describe('exampleBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MUTATION = graphql(`
    mutation ExampleBlockUpdate($id: ID!, $input: ExampleBlockUpdateInput!) {
      exampleBlockUpdate(id: $id, input: $input) {
        id
        journeyId
      }
    }
  `)

  const { fetchBlockWithJourneyAcl } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  // Required test cases:
  // - succeeds when authorized
  // - returns FORBIDDEN when unauthorized
  // - handles all optional fields
})
```

**Query test template:**

```typescript
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('exampleQuery', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const QUERY = graphql(`
    query Example($id: ID!) {
      example(id: $id) {
        id
      }
    }
  `)

  // Required test cases:
  // - returns data when authorized
  // - returns error when not found
  // - returns error when unauthorized
})
```

### 6. Regenerate schema and test

```bash
nx run api-journeys-modern:generate-graphql
nx test api-journeys-modern --testPathPattern="<fieldName>"
```

### 7. Customizable fields check

If the resolver modifies `customizable` on a block or action, ensure `recalculateJourneyCustomizable()` is called. The block service's `update()` handles this automatically. See `.cursor/rules/customizable-blocks.mdc`.

## Block Service Reference

`apis/api-journeys-modern/src/schema/block/service.ts`:

| Function | Purpose |
|---|---|
| `authorizeBlockCreate(journeyId, user)` | Check user can create blocks in the journey |
| `authorizeBlockUpdate(blockId, user)` | Fetch block + ACL, check user can update |
| `validateParentBlock(parentBlockId, journeyId)` | Ensure parent block exists in journey |
| `getSiblingsInternal(journeyId, parentBlockId, tx)` | Get sibling blocks for ordering |
| `update(id, input)` | Full block update (action upsert, journey timestamp, customizable recalc) |
| `removeBlockAndChildren(block, tx)` | Soft-delete block and reorder siblings |
| `setJourneyUpdatedAt(tx, block)` | Update journey's `updatedAt` timestamp |

## Existing Overrides

| Field | Type | File |
|---|---|---|
| `cardBlockCreate` | mutation | `src/schema/block/card/cardBlockCreate.mutation.ts` |
| `cardBlockUpdate` | mutation | `src/schema/block/card/cardBlockUpdate.mutation.ts` |
| `buttonBlockCreate` | mutation | `src/schema/block/button/buttonBlockCreate.mutation.ts` |
| `buttonBlockUpdate` | mutation | `src/schema/block/button/buttonBlockUpdate.mutation.ts` |
| `adminJourney` | query | `src/schema/journey/adminJourney.query.ts` |
| `adminJourneys` | query | `src/schema/journey/adminJourneys.query.ts` |
| `getUserRole` | query | `src/schema/userRole/getUserRole.query.ts` |
| `journeyProfileUpdate` | mutation | `src/schema/journeyProfile/journeyProfileUpdate.mutation.ts` |
