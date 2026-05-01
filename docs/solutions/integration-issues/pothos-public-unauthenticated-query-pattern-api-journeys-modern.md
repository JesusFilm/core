---
title: 'Pothos public/unauthenticated query pattern in api-journeys-modern'
category: integration-issues
date: 2026-04-29
severity: medium
module: apis/api-journeys-modern
ticket: NES-1547
tags:
  - pothos
  - graphql
  - scope-auth
  - federation
  - public-query
  - anonymous
  - api-journeys-modern
  - withAuth
related_issues:
  - NES-1547
related_docs:
  - docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md
  - docs/solutions/integration-issues/pothos-prisma-datetimefilter-null-type-mismatch.md
  - docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md
  - docs/solutions/security-issues/google-sync-missing-integration-ownership-guard.md
  - docs/solutions/security-issues/journey-acl-read-authorization-bypass-invite-requested-role.md
---

# Pothos public/unauthenticated query pattern in `api-journeys-modern`

## Problem

`api-journeys-modern` is a federated Pothos subgraph where **every existing root resolver uses `t.withAuth(...)`** — there is no precedent for serving truly anonymous (no-token) traffic. Adding the first such resolver (`templateGalleryPageBySlug` for NES-1547, the public Template Gallery Page) surfaced two non-obvious facts that cost real time during planning, deepening, and review:

1. The seemingly idiomatic `t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })` (used by `chatButton`, `stepBlock`, `adminJourney`) **rejects PublicContext requests**. It only allows authenticated users — the `isAnonymous` scope is "authenticated user without a verified email," not "no token at all."
2. Pothos `skipTypeScopes: true` looked like the right opt-out. It is not — it skips type-level scopes, of which `TemplateGalleryPage` has none. The flag is a no-op that misleadingly implies a protection is being lifted.

Symptoms during implementation:

```text
expect(received).toEqual(expected)
- Expected
+ Received

  Object {
    "data": Object { "templateGalleryPageBySlug": null },
+   "errors": Array [
+     [GraphQLError: Not authorized to resolve Query.templateGalleryPageBySlug],
+   ],
  }
```

The unauthenticated test client (no `Authorization` header) receives a scope-auth `Not authorized` error from a query the plan declared as public. Switching to `t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })` does not help — the same error appears.

## Root cause

Look at `apis/api-journeys-modern/src/schema/authScopes.ts:94-124`:

```typescript
export async function authScopes(context: Context) {
  const defaultScopes = {
    isAuthenticated: false,
    isAnonymous: false,
    isPublisher: false,
    isValidInterop: false,
    isSuperAdmin: false
  }
  switch (context.type) {
    case 'authenticated': {
      return {
        ...defaultScopes,
        isAuthenticated: context.user?.email != null,
        isAnonymous: context.user != null && context.user.email == null
        // ...
      }
    }
    case 'interop':
      return { ...defaultScopes, isValidInterop: true }
    default:
      return defaultScopes // PublicContext lands here — every scope is false
  }
}
```

Three `Context` variants are defined:

- `'public'` — no `Authorization` header at all (truly anonymous internet visitor)
- `'authenticated'` — token attached; `user.email` may or may not be set
- `'interop'` — internal service-to-service

The scopes `isAuthenticated` and `isAnonymous` are **only computed for `'authenticated'` context**. When the context is `'public'`, every named scope returns `false`. So:

- `t.withAuth({ isAuthenticated: true })` → blocks PublicContext (correct)
- `t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })` → **also blocks PublicContext** (because both are `false` for `'public'`)
- Omitting `withAuth` entirely → field has no scope requirement, runs on PublicContext → correct

`skipTypeScopes: true` is independently irrelevant here. It opts out of scopes declared on the **type** (e.g., `prismaObject('TemplateGalleryPage', { authScopes: { ... } })`). Since the new type declares no `authScopes` block, there is nothing to skip — the flag becomes documentation noise that hides the real reason the field is reachable (no `withAuth` was called).

## Solution

For a truly public, unauthenticated GraphQL field in `api-journeys-modern`:

1. **Do not call `t.withAuth(...)`.** Define the field directly via `t.prismaField` or `t.field`. The absence of any scope check is what makes it public.
2. **Do not add `skipTypeScopes: true`** unless the parent type actually has a type-level scope you need to bypass.
3. **Add a comment.** Future readers will reach for `withAuth` reflexively; explain why it's omitted.
4. **Push gatekeeping into the `where` clause.** Filter to `status: 'published'` (or whatever the public-eligible state is) inside the resolver. Drafts must never leak.
5. **Validate input shape before the DB query.** Public traffic is enumerable; reject malformed slugs with a regex before hitting Postgres.

Working pattern from [apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.ts](apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.ts):

```typescript
import { prisma } from '@core/prisma/journeys/client'
import { builder } from '../builder'
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from './generateUniqueSlug'
import { TemplateGalleryPageRef } from './templateGalleryPage'

// Public, unauthenticated query. This is the first resolver in
// api-journeys-modern that serves PublicContext requests — there is no
// `withAuth` block and no type-level scope on TemplateGalleryPage to opt
// out of. The `where: { status: 'published' }` filter is the actual
// gatekeeper: drafts and unknown slugs return null (frontend interprets
// as 404).
builder.queryField('templateGalleryPageBySlug', (t) =>
  t.prismaField({
    type: TemplateGalleryPageRef,
    nullable: true,
    args: { slug: t.arg.string({ required: true }) },
    resolve: async (query, _parent, args) => {
      const { slug } = args
      // Reject malformed slugs before hitting the DB — bounds enumeration
      // and probing cost for anonymous traffic.
      if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
        return null
      }
      return await prisma.templateGalleryPage.findFirst({
        ...query,
        where: { slug, status: 'published' }
      })
    }
  })
)
```

### Spec the public path explicitly

The matching spec uses `getClient()` with no `headers.authorization` to exercise the PublicContext path:

```typescript
// apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.spec.ts
const publicClient = getClient() // no auth header → PublicContext

it('returns a published page to an unauthenticated visitor', async () => {
  prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
    id: 'p1',
    title: 'Hello',
    slug: 'hello',
    status: 'published'
  } as any)
  const result = await publicClient({
    /* ... */
  })
  expect(result.data.templateGalleryPageBySlug).toEqual({
    /* ... */
  })
})
```

This guards against a future contributor "fixing" the resolver by adding a `withAuth` block — the public spec will start failing immediately.

### Defense-in-depth for nested public reads

A public root resolver can still leak through nested fields if the child types declare `withAuth` or rely on team membership. Confirm what the public consumer asks for:

- `TemplateGalleryPageRef.team` — `t.relation('team', { nullable: false })` — `Team` has no field-level `withAuth`. Verified safe.
- `TemplateGalleryPageRef.templates` — resolves to `[JourneyRef]`. The `templates` field's `select.where` filters at read time to `{ template: true, status: 'published' }`, and the resolve callback enforces `journey.teamId === page.teamId`. Even if a journey was transferred to another team or had its `template` flag flipped after being added, the public page never exposes it.
- `TemplateGalleryPageRef.creatorImageBlock` — must be validated as same-team **at write time** (Create/Update mutations). See `validateCreatorImageBlock.ts`.

## Why the existing `$any: { isAuthenticated, isAnonymous }` precedent does not apply

`adminJourney`, `chatButton`, `stepBlock`, etc. use `t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })` to allow both authenticated team members AND post-signup-pre-email-verification users. Both branches require an attached Firebase token — the `'authenticated'` Context. Anonymous internet visitors with no token at all are out of scope for those endpoints and correctly rejected.

If you are adding a resolver where the consumer **always has a token** (e.g., a journey editor interaction before email verification), use the `$any` pattern. If you are adding a resolver where the consumer **may have no token at all** (a public landing page, a slug-addressable share URL, a marketing page), omit `withAuth`.

## Prevention

1. **When designing a new resolver, ask: can this be hit before the user logs in?** If yes, the resolver is public and must omit `withAuth`. If no, choose between `isAuthenticated`, `isInTeam`, `isAnonymous`, etc. as appropriate.
2. **Add a comment near every public resolver explaining the deliberate `withAuth` omission.** Without it, the next contributor will reflexively add one to "match the pattern" and silently break public traffic.
3. **Always include a public-context spec** — instantiate `getClient()` with no `Authorization` header and assert the resolver returns data, not a `Not authorized` error. This is the only fast feedback that prevents regression.
4. **Avoid `skipTypeScopes: true` as a "make it public" lever.** Reach for it only when you actually have a type-level scope to bypass.
5. **Read [authScopes.ts](apis/api-journeys-modern/src/schema/authScopes.ts) before designing auth on a new resolver.** The `Context` discriminated union and the `default → defaultScopes` fallthrough is the source of truth; intuition from sibling resolvers can mislead.

## Pre-merge checklist for any new public resolver in `api-journeys-modern`

- [ ] No `withAuth` call on the field
- [ ] No `skipTypeScopes` flag (or a comment explaining why it's needed)
- [ ] `where` clause filters to the public-eligible state (e.g., `status: 'published'`)
- [ ] Input args validated with regex/length/charset before the DB query
- [ ] Spec uses `getClient()` with no `Authorization` header and asserts a successful response
- [ ] Nested fields on the returned type were checked — none reach for team auth
- [ ] PR description flags this as a new public surface for federation reviewers

## Related findings (NES-1547 implementation, same PR)

These came up alongside the public-resolver pattern and are worth knowing:

- **Test mockUser shape gotcha.** `isAuthenticated` requires `context.user.email != null`. Test mocks that omit `email` (e.g., `{ id, firstName, emailVerified }`) will be classified as `isAnonymous`, not `isAuthenticated`. Use the `customDomain.query.spec.ts:18-26` shape: `{ id, email, emailVerified, firstName, lastName, imageUrl, roles }`.
- **TOCTOU on validation outside transactions.** When fetching a row, validating ownership of a foreign-key id, then writing — keep the validation inside `prisma.$transaction(async tx => ...)` and pass `tx` to the validator. Validating against the live `prisma` client opens a window where the validated resource can be transferred to another team between SELECT and UPDATE.
- **`nanoid` default alphabet leaks `_` into slugs.** If a slug-generation fallback uses `nanoid(6)`, characters like `_` will fail the public-query regex (`[a-z0-9-]`). Use `customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)` to constrain the alphabet.
- **`prisma migrate diff` for drifted local DBs.** When `prisma migrate dev` rejects due to unrelated drift on the local Postgres instance, generate the migration SQL via `prisma migrate diff --from-schema=<old> --to-schema=<new> --script -o <migration.sql>` instead. The output is identical to what `migrate dev` would have produced and can be committed safely; CI/devcontainer applies it cleanly.
