---
title: 'fix: empty Manage Editors dialog due to Pothos _query bypass in adminJourney resolver'
type: fix
status: active
date: 2026-03-23
---

# fix: empty Manage Editors dialog due to Pothos \_query bypass in adminJourney resolver

## Enhancement Summary

**Deepened on:** 2026-03-23
**Sections enhanced:** 7
**Research agents used:** Architecture Strategist, Performance Oracle, Security Sentinel, Code Simplicity Reviewer, Data Integrity Guardian, Best Practices Researcher, Context7 (Pothos docs)

### Key Improvements

1. Confirmed two-query approach is architecturally sound via Pothos docs (no built-in mechanism to merge auth includes with `query`)
2. Identified response cache fix as a **security requirement** (not optional) — `session: () => null` leaks data across users
3. Added error handling for `findUniqueOrThrow` TOCTOU edge case
4. Documented why `select`-based fields crash but `t.relation` fields don't (Pothos fallback behavior)

### New Considerations Discovered

- The `session: () => null` response cache pattern is a systemic vulnerability affecting all unlisted authenticated queries — recommend separate audit ticket
- `journeyAiTranslate.ts` has the same `_query` ignore pattern — flag as tech debt
- A comment explaining the two-query pattern is needed to prevent future "simplification" that reintroduces the bug

---

## Overview

The "Manage Editors" dialog (`AccessDialog`) shows an empty editor list for all users (owners, editors, team managers, team members). The root cause is that the `adminJourney` query resolver ignores the Pothos `_query` parameter, preventing nested `select` directives from being applied to the Prisma query. This causes `UserTeam.journeyNotification` to throw an `INTERNAL_SERVER_ERROR`, and Apollo Client's default `errorPolicy: 'none'` discards the entire valid response.

## Problem Statement

**Bug path (confirmed via network inspection):**

1. `adminJourney.query.ts:22` ignores Pothos `_query` — uses `_query` prefix, never spreads it
2. `userTeam.ts:31-39` defines `journeyNotification` with a `select` directive that injects `journeyNotifications` into `_query`
3. Since `_query` is skipped, `journeyNotifications` is never loaded from Prisma
4. Field resolver does `journeyNotifications[0]` on `undefined` → `INTERNAL_SERVER_ERROR` at path `journey.team.userTeams[0].journeyNotification`
5. Apollo Client (default `errorPolicy: 'none'`) sees `errors` in the response → discards all `data`
6. `AccessDialog` receives `data === undefined` → renders empty lists

**Secondary issue:** `Query.adminJourney` is not listed in the response cache's `ttlPerSchemaCoordinate` in `yoga.ts`, meaning error responses may be cached and served to other users (`session: () => null` means all users share one cache).

**Separate issue (not in scope):** CORS errors from `preview.json` cross-origin redirect — unrelated to the empty editor list.

### Research Insights: Why `select` crashes but `t.relation` doesn't

Per Pothos Prisma plugin documentation (Context7, [pothos-graphql.dev](https://pothos-graphql.dev/docs/plugins/prisma)):

- **`select` on a field** (used by `UserTeam.journeyNotification`): Tells Pothos to add data to the parent's `query` parameter. If the parent resolver ignores `query`, the data is simply **missing** — no fallback, no separate query. The field resolver receives `undefined` and crashes.
- **`t.relation`** (used by `UserJourney.journeyNotification`): Has **automatic fallback** — "If pre-loading is not possible... Pothos will automatically issue efficient fallback queries (e.g., `findUnique`) to resolve the missing data, often batched for performance."

This is why the bug only manifests for **journeys that have a team** — the crash is in `UserTeam.journeyNotification` (uses `select`), while `UserJourney.journeyNotification` (uses `t.relation`) works independently via fallback.

## Proposed Solution

**Two-query approach** — the safest strategy that preserves ACL integrity:

1. Keep the existing Prisma query with ACL includes for the authorization check (unchanged)
2. After ACL passes, issue a second `findUniqueOrThrow` spreading the Pothos `query` parameter
3. Add `'Query.adminJourney': 0` to the response cache `ttlPerSchemaCoordinate`

This matches the established codebase pattern where `adminJourneys` (plural) at `adminJourneys.query.ts:80` correctly spreads `...query` into its Prisma call. The two-query approach is preferred over deep-merging `_query` with ACL includes because:

- ACL requires `userJourneys: true` and `team: { include: { userTeams: true } }` — full relation loads
- Pothos `_query` may contain `select` directives that narrow fields, which could strip ACL-required fields
- Deep-merging `include` and `select` is fragile and error-prone — Prisma does not allow both at the same level
- The extra DB round-trip is acceptable for a single-record query gated behind user interaction

### Research Insights: Why alternatives were rejected

**Deep-merge `query` with ACL includes (rejected):** Per Pothos docs and best practices research, the `query` object may use `select` mode instead of `include`, making merging non-trivial. There is no official Pothos API or utility for this. Prisma forbids mixing `select` and `include` at the same level.

**Refactor to `journeyReadAccessWhere` in WHERE clause (rejected):** This is Pattern B in the Pothos community, preferred for list queries. For single-entity lookups, it conflates NOT_FOUND and FORBIDDEN into one error, losing diagnostic value. The `adminJourneys` (plural) query correctly uses Pattern B; `adminJourney` (singular) should use the two-query pattern (Pattern A) — which is what this fix implements.

**Single query with merged includes (security reviewer suggestion):**

```typescript
prisma.journey.findUnique({ ...query, where, include: { ...query.include, userJourneys: true, ... } })
```

This would fail if Pothos generates `select` instead of `include` — Prisma throws when both are present at the same level. The two-query approach avoids this structural conflict entirely.

### Research Insights: Performance Impact

Per performance analysis: **1-3ms additional latency** from the second `findUnique` by PK/unique index. Both queries reuse the same Prisma connection from the pool. The second query hits a hot page (already in PostgreSQL buffer pool from the first query). This is well within the 200ms budget for a user-interaction-gated query.

## Technical Considerations

### ACL Integrity

The ACL check (`journeyAcl`) depends on `journey.userJourneys[].userId` and `journey.team.userTeams[].userId` being fully loaded. The first query (ACL query) must continue to use hardcoded includes. The second query (data query) uses `query` from Pothos, which only includes what the GraphQL client requested.

**Security finding:** The `_query` parameter is safe to use in the second query. Per security audit, Pothos generates it from the GraphQL schema definition, not from raw client input. A client cannot request fields or relations not exposed in the schema.

### UserJourney.journeyNotification vs UserTeam.journeyNotification

These use different Pothos mechanisms:

- `UserTeam.journeyNotification` — uses `select:` directive (requires `query` propagation) — **this is what breaks**
- `UserJourney.journeyNotification` — uses `t.relation()` (triggers a separate Prisma query) — **works independently**

This means the bug only manifests for **journeys that have a team**. Journeys with only individual editors (no team) may not exhibit the bug because `UserJourney.journeyNotification` resolves via a separate query.

### Response Cache (SECURITY REQUIREMENT)

`yoga.ts` line 82-98 configures `useResponseCache` with `session: () => null` (shared cache). `Query.adminJourneys` has TTL 0 but `Query.adminJourney` is missing.

**Security audit finding — HIGH RISK:** With `session: () => null`, cached responses for `adminJourney` could be served to ALL users regardless of their permissions. If User A (with access) queries a journey and the result is cached, User B (without access) could receive User A's cached response, bypassing the ACL check. This is a credible high-risk exposure given the shared session keying — unless the gateway or response cache plugin adds additional cache key context beyond `session()`. Adding `'Query.adminJourney': 0` is the correct defensive measure regardless, since it is cheap and eliminates the risk.

**Broader concern:** Any authenticated query NOT listed in `ttlPerSchemaCoordinate` with TTL 0 has the same cross-user data leak vulnerability. Recommend a separate audit ticket.

### TOCTOU Edge Case

The journey could theoretically be deleted between the ACL query and the data query. The `findUniqueOrThrow` would throw a raw Prisma `NotFoundError` rather than a clean GraphQL error. **Mitigation:** wrap in try-catch to produce a clean NOT_FOUND error. The window is microseconds — not a security concern, but the error handling should be clean.

### NES-1481 Interaction

The NES-1481 fix (in review on branch `jianweichong/nes-1481-fix-inviterequested-role-bypasses-journey-read-acl`) tightens `read()` in `journey.acl.ts` to deny `inviteRequested` users. This is orthogonal — NES-1481 restricts who can call the query, NES-1480 fixes data loading for those who can. No conflicts.

**Note:** NES-1481 fixes the `read()` ACL function. NES-1480 fixes the Pothos `_query` bypass. These are two completely different code paths addressing two different bugs. Even with NES-1481 merged, the `journeyNotification` crash would still occur for authorized users (owners, editors, team members) because the `_query` is still ignored.

## System-Wide Impact

### Other Resolvers with Same Pattern

`journeyAiTranslate.ts:599` also ignores `_query`. It has the same class of bug but hasn't surfaced yet because its return type's nested fields may not use `select` directives. Flag as tech debt — separate ticket.

`getUserRole.query.ts` also ignores `query` but `UserRole` has no relations with `select` directives — no impact.

### API Surface Parity

Only `adminJourney` (singular) is affected. `adminJourneys` (plural) already uses `...query` correctly.

### Codebase Pattern Consistency

Per repo research, the established correct pattern (used by majority of resolvers) is to spread `...query` into Prisma calls. Only 2-3 resolvers ignore `_query`, and `adminJourney` is the only one where it causes a user-visible bug.

## Acceptance Criteria

- [ ] **Primary fix:** `adminJourney` resolver spreads Pothos `query` into a second Prisma call after ACL check
- [ ] **Cache fix:** Add `'Query.adminJourney': 0` to `ttlPerSchemaCoordinate` in `yoga.ts`
- [ ] **Rename:** Change `_query` to `query` in the resolver signature (matches codebase convention)
- [ ] **No try-catch:** Let `findUniqueOrThrow` throw naturally if the record vanishes (matches codebase conventions)
- [ ] **Comment:** Add inline comment explaining the two-query pattern and why `query` is not used in the ACL fetch
- [ ] **Test: nested field resolution** — query `adminJourney` requesting `team { userTeams { journeyNotification(journeyId: $id) } }` and verify no errors + data returned
- [ ] **Test: journey without team** — query `adminJourney` for a teamless journey and verify `userJourneys` with `journeyNotification` resolves correctly
- [ ] **Test: ACL still enforced** — verify FORBIDDEN is still thrown for users without access after the refactor
- [ ] **Existing tests pass** — all existing `adminJourney.query.spec.ts` tests continue to pass

## Implementation Plan

### Phase 1: Backend fix (`adminJourney.query.ts`)

**File:** `apis/api-journeys-modern/src/schema/journey/adminJourney.query.ts`

```typescript
// BEFORE (line 22-47):
resolve: async (_query, _parent, args, context) => {
  const where = ...
  const journey = await prisma.journey.findUnique({
    where,
    include: {
      userJourneys: true,
      team: { include: { userTeams: true } }
    }
  })
  if (journey == null) throw new GraphQLError(...)
  if (!journeyAcl(Action.Read, journey, context.user)) throw new GraphQLError(...)
  return journey
}

// AFTER:
resolve: async (query, _parent, args, context) => {
  const where: Prisma.JourneyWhereUniqueInput =
    args.idType === 'slug'
      ? { slug: String(args.id) }
      : { id: String(args.id) }

  // Fetch with ACL-required includes for authorization check.
  // This is intentionally a separate query from the data fetch below
  // because Pothos query may contain select directives that would
  // strip the relations needed for journeyAcl().
  const journeyForAcl = await prisma.journey.findUnique({
    where,
    include: {
      userJourneys: true,
      team: { include: { userTeams: true } }
    }
  })

  if (journeyForAcl == null)
    throw new GraphQLError('journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })

  if (!journeyAcl(Action.Read, journeyForAcl, context.user))
    throw new GraphQLError('user is not allowed to view journey', {
      extensions: { code: 'FORBIDDEN' }
    })

  // Fetch with Pothos query for correct nested field resolution
  // (select directives like UserTeam.journeyNotification require this)
  return prisma.journey.findUniqueOrThrow({ ...query, where })
}
```

### Phase 2: Response cache fix (`yoga.ts`)

**File:** `apis/api-journeys-modern/src/yoga.ts`

Add `'Query.adminJourney': 0` to `ttlPerSchemaCoordinate` alongside the existing `'Query.adminJourneys': 0` entry.

### Phase 3: Tests (`adminJourney.query.spec.ts`)

**File:** `apis/api-journeys-modern/src/schema/journey/adminJourney.query.spec.ts`

Add tests:

1. **Nested `journeyNotification` on `userTeams`** — mock `findUnique` for ACL (returns journey with owner userJourney + team), mock `findUniqueOrThrow` for data query (returns full journey with team.userTeams including journeyNotifications). Verify response includes `team.userTeams[0].journeyNotification` without errors.

2. **Journey without team** — mock journey with `team: null` and `userJourneys` with owner. Verify response returns journey data correctly.

3. **Update existing happy-path tests** — current tests only mock `findUnique`. After the two-query refactor, all existing happy-path tests (`should return journey by slug`, `should return journey by databaseId`, `should allow team members`) must ALSO mock `findUniqueOrThrow` to return the journey data, or they will fail.

4. **ACL still denies unauthorized users** — verify existing FORBIDDEN test still passes with the two-query approach (the first `findUnique` returns journey, ACL rejects, second `findUniqueOrThrow` is never called).

5. **Verify `findUniqueOrThrow` receives Pothos `query` parameter** — assert that the second Prisma call includes the Pothos-generated `include`/`select` via `expect.objectContaining`.

6. **TOCTOU edge case (optional)** — mock `findUnique` to return journey (ACL passes), mock `findUniqueOrThrow` to throw. Verify error propagates naturally (no masking).

## Dependencies & Risks

| Risk                                                          | Severity     | Mitigation                                                                                              |
| ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| Extra DB round-trip per `adminJourney` call                   | Low          | Expected low overhead (single additional indexed lookup on hot page); validate via APM if needed        |
| `findUniqueOrThrow` throws if journey deleted between queries | Low          | Let it throw naturally (INTERNAL_SERVER_ERROR); microsecond TOCTOU window, matches codebase conventions |
| Cached error responses persist after fix deployed             | Medium       | TTL 0 prevents future caching; existing cached errors expire with default TTL                           |
| Response cache leaks data across users (pre-existing)         | **Critical** | TTL 0 fixes `adminJourney`; recommend separate audit for all unlisted authenticated queries             |

## Out of Scope

- **CORS error from `preview.json`** — separate bug, different code path
- **Frontend `errorPolicy` hardening** — defense-in-depth change; the backend fix resolves the root cause
- **`journeyAiTranslate.ts` `_query` fix** — same pattern, separate ticket
- **`getUserRole.query.ts` `_query` fix** — no impact since `UserRole` has no `select`-based relations
- **Broader `session: () => null` cache audit** — systemic vulnerability, separate ticket
- **Extracting a `withJourneyAcl` helper** — recommended if more singular queries with in-memory ACL are added; not needed for one resolver

## Sources

- **Bug:** `apis/api-journeys-modern/src/schema/journey/adminJourney.query.ts:22` — ignores `_query`
- **Crash site:** `apis/api-journeys-modern/src/schema/userTeam/userTeam.ts:38-39` — `journeyNotifications[0]` on undefined
- **Reference pattern:** `apis/api-journeys-modern/src/schema/journey/adminJourneys.query.ts:80` — correctly spreads `...query`
- **Response cache:** `apis/api-journeys-modern/src/yoga.ts:82-98` — missing `adminJourney` TTL
- **Frontend consumer:** `apps/journeys-admin/src/components/AccessDialog/AccessDialog.tsx:29-72` — the GraphQL query
- **ACL:** `apis/api-journeys-modern/src/schema/journey/journey.acl.ts` — `journeyAcl()` and `journeyReadAccessWhere()`
- **Pothos docs:** [prismaField query parameter](https://pothos-graphql.dev/docs/plugins/prisma) — canonical `...query` spread pattern
- **Pothos docs:** [select vs relation fallback behavior](https://pothos-graphql.dev/docs/plugins/prisma/relations) — `select` has no fallback, `t.relation` does
- **Linear:** [NES-1480](https://linear.app/jesus-film-project/issue/NES-1480)
- **Related:** [NES-1481](https://linear.app/jesus-film-project/issue/NES-1481) — inviteRequested ACL fix (in review)
