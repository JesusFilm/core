# APIs — Convention Guide

GraphQL API layer for the NextSteps platform. Three services share the Prisma journeys database and are composed via Apollo Federation.

| Service               | Framework                  | Role                                                                        |
| --------------------- | -------------------------- | --------------------------------------------------------------------------- |
| `api-journeys`        | NestJS + Apollo Federation | Legacy API — resolvers, modules, CASL auth                                  |
| `api-journeys-modern` | GraphQL Yoga + Pothos      | Modern API — code-first schema, scope auth                                  |
| `api-gateway`         | GraphQL Hive Gateway       | Federation gateway — composes subgraphs, JWT validation, header propagation |

## Shared conventions

### Prisma

- ORM for all database access — **no raw SQL** (except `prisma.$queryRaw` when necessary).
- Schema: `libs/prisma/journeys/db/schema.prisma`
- Migrations: `libs/prisma/journeys/db/migrations/` — timestamped SQL files, one atomic change each.
- Soft deletes via `deletedAt` field on blocks, journeys, and other entities. Always filter `where: { deletedAt: null }` in queries.
- Generate client: `pnpm dlx nx run prisma-journeys:prisma-generate` after schema changes.
- Both APIs import from `@core/prisma/journeys/client`.

### GraphQL Federation

- Both `api-journeys` and `api-journeys-modern` are **Federation 2.6 subgraphs**.
- Use `@key` directives for entity resolution, `@shareable` for fields exposed by multiple subgraphs.
- Gateway composes schemas at runtime — no manual stitching.

### Authentication

- Firebase JWT tokens parsed from `Authorization: JWT <token>` header.
- User roles fetched from `UserRole` table in Prisma.
- Three context types: `authenticated` (JWT user), `interop` (service-to-service), `public` (anonymous).

### Logging

- Pino logger everywhere — `nestjs-pino` in legacy, direct Pino in modern.
- Pretty-print in dev, structured JSON in production.

### Testing

- Jest + `jest-mock-extended` for Prisma mocking.
- `mockDeep<PrismaClient>()` or `mockDeep<PrismaService>()` for deep mocks.
- Tests run with `runInBand` in api-journeys-modern (sequential, no parallelization).

---

## api-journeys (NestJS)

### Module organization

```
apis/api-journeys/src/app/
  app.module.ts                    # Root NestJS module
  lib/
    prisma.service.ts              # PrismaClient wrapper (injected as provider)
    CaslAuthModule/                # CASL-based authorization
    decorators/                    # @CurrentUser, @FromPostgresql, etc.
  modules/
    journey/                       # One directory per domain entity
      journey.module.ts            # NestJS module
      journey.resolver.ts          # @Resolver with @Query/@Mutation
      journey.graphql              # SDL schema file
      journey.acl.ts               # CASL access rules
      journey.resolver.spec.ts     # Tests
      journeyCustomizable.service.ts  # Customizable sync logic
    block/                         # 27 block types
    action/                        # Action types
    ...
```

### Key patterns

- **Schema:** SDL-first (`.graphql` files) with `@Resolver` decorators.
- **DI:** NestJS module system — providers, imports, exports.
- **Auth:** CASL library with `@UseGuards(AppCaslGuard)` and `@CaslPolicy(entityAcl)`.
- **Prisma access:** Through injected `PrismaService` wrapper.
- **Async jobs:** BullMQ queues (e.g., `api-journeys-revalidate`).

### Test pattern

```typescript
const module: TestingModule = await Test.createTestingModule({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyResolver, { provide: PrismaService, useValue: mockDeep<PrismaService>() }, { provide: BlockService, useValue: mockDeep<BlockService>() }]
}).compile()
```

---

## api-journeys-modern (Pothos + Yoga)

### Schema organization

```
apis/api-journeys-modern/src/
  schema/
    builder.ts                     # Pothos SchemaBuilder with plugins
    journey/
      journey.ts                   # builder.prismaObject('Journey', {...})
      journey.acl.ts               # Function-based auth (no CASL)
      journey.acl.spec.ts
      adminJourney.query.ts        # Query field definition
      adminJourney.query.spec.ts
      inputs/                      # GraphQL input types
    block/                         # 26 block types
    action/                        # 15 action types
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

When adding or modifying a `customizable` field on a block or action type, the recalculation logic **must be updated in both APIs**:

| API    | Location                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------- |
| Legacy | `apis/api-journeys/src/app/modules/journey/journeyCustomizable.service.ts` → `recalculate()`        |
| Modern | `apis/api-journeys-modern/src/lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable.ts` |

These two implementations must produce identical results. The logic checks:

1. **Editable text fields:** `journeyCustomizationDescription` is non-empty AND `journeyCustomizationFields` count > 0
2. **Customizable link actions:** ButtonBlock, RadioOptionBlock, VideoBlock, or VideoTriggerBlock with `action.customizable === true` AND `action.blockId == null` (excludes NavigateToBlockAction)
3. **Customizable media:** ImageBlock or VideoBlock with `block.customizable === true`
4. **Chat buttons:** `chatButton.customizable === true`

Any mutation that modifies `customizable` on a block, action, or chat button **must call the recalculation function** after the database write.

---

## ACL parity

Authorization logic differs in implementation but must produce the same access decisions:

- **Legacy (api-journeys):** CASL library with Prisma conditions — `can(Action.Update, 'Journey', { ... })`
- **Modern (api-journeys-modern):** Pure functions — `journeyAcl(action, journey, user): boolean`

When modifying access rules, update both implementations and verify with tests.

---

## Quality gates

```bash
# api-journeys
pnpm dlx nx run api-journeys:lint
pnpm dlx nx run api-journeys:type-check
pnpm dlx nx run api-journeys:test

# api-journeys-modern
pnpm dlx nx run api-journeys-modern:lint
pnpm dlx nx run api-journeys-modern:type-check
pnpm dlx nx run api-journeys-modern:test
pnpm dlx nx run api-journeys-modern:generate-graphql  # regenerate schema
pnpm dlx nx run api-journeys-modern:subgraph-check    # validate against Hive

# Prisma
pnpm dlx nx run prisma-journeys:prisma-generate       # after schema changes
```
