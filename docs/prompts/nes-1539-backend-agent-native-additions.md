# NES-1539 — Backend additions for agent-native parity

**Audience:** backend agent (api-journeys-modern + Prisma + frontend codegen)
**Source:** ce-review on PR #9143, `agent-native-reviewer` finding (P2 + P3)
**Why:** Two minor gaps where a programmatic GraphQL client has to reimplement what the UI does. Adding these closes parity and lets the UI drop a hand-rolled URL string in favor of an introspectable field.

The PR review verdict was PASS with two non-blocking adds. This prompt covers both.

---

## Change 1 (P2) — Add `Query.templateGalleryPage(id: ID!): TemplateGalleryPage`

### Problem

Today, `Query.templateGalleryPages(teamId)` returns the full list and `Query.templateGalleryPageBySlug(slug)` only returns *published* pages. There is no read-by-id query.

Consequences:
- An agent that just received a `templateGalleryPage` payload from a mutation, or wants to verify state after a side-effect, has to refetch the entire team's list to look up one row.
- An agent that only knows a draft's id can't read it directly.

### Add

A new authenticated query that mirrors the auth pattern of `templateGalleryPageDelete.mutation.ts` (look up the row to learn its `teamId`, then `isInTeam` check):

```ts
// apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPage.query.ts
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.queryField('templateGalleryPage', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const page = await prisma.templateGalleryPage.findUnique({
        ...query,
        where: { id }
      })
      if (page == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: page.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to read template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }
      return page
    }
  })
)
```

Wire it into `apis/api-journeys-modern/src/schema/templateGalleryPage/index.ts`:

```ts
import './templateGalleryPage.query'
```

### Tests

Add `templateGalleryPage.query.spec.ts` covering:
1. Authenticated user in the same team → returns the page (full Pothos field set).
2. Authenticated user NOT in the team → `extensions.code === 'FORBIDDEN'`.
3. Unknown id → `extensions.code === 'NOT_FOUND'`.
4. Unauthenticated client → auth error (mirror the patterns in `templateGalleryPages.query.spec.ts`).

### Why authenticated-only (no public variant)

Drafts must remain hidden from public traffic. The existing public surface is `templateGalleryPageBySlug` which already filters `where: { status: 'published' }`; that path is the right one for anonymous viewers. Don't duplicate.

---

## Change 2 (P3) — Add resolved `publicUrl: String` field on `TemplateGalleryPage`

### Problem

The UI currently builds the public URL inline as `${publicUrlBase}/collections/${slug}`. Two issues:
1. Every client (React, agent, mobile, ops scripts) has to know the deployment's public base URL out of band.
2. The UI doesn't actually pass `publicUrlBase` today (the prop is unused — flagged in the review and removed in commit `e3103173a`), so users can't see the URL at all.

Make the URL canonical and discoverable from introspection.

### Add

Resolved field on `TemplateGalleryPageRef` in
`apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPage.ts`:

```ts
import { env } from '../../env'

// inside `fields: (t) => ({ ...`
publicUrl: t.string({
  // Returns null for drafts so introspection can't enumerate unpublished
  // slugs via the URL alone. Published pages return the canonical
  // `${JOURNEYS_URL}/collections/${slug}`.
  nullable: true,
  resolve: (page) =>
    page.status === 'published'
      ? `${env.JOURNEYS_URL}/collections/${page.slug}`
      : null
}),
```

Use the existing `JOURNEYS_URL` env var (already declared in
`apis/api-journeys-modern/src/env.ts`) — no new config needed. Pattern
matches `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/buildJourneyUrls.ts`.

### Why null on drafts (and not "the URL the page would have")

- Anonymous viewers can already enumerate published slugs via the public
  query; that's the threat model and it's accepted. Drafts must stay opaque.
- Returning a "would-be" URL invites someone to share it before publishing,
  which would 404. Returning null forces a deliberate publish step before
  the URL exists in any client.

### Tests

Extend `templateGalleryPages.query.spec.ts` (or wherever the field
exposure is most natural) with:
1. Published page → `publicUrl === '${JOURNEYS_URL}/collections/<slug>'`
   (set `process.env.JOURNEYS_URL` in the test, mirroring the pattern in
   `templateFamilyStatsBreakdown.query.spec.ts`).
2. Draft page → `publicUrl === null`.

### Frontend follow-up (in the same PR)

Once the field ships, switch the UI from the dead `publicUrlBase` pattern
to reading `publicUrl` from the GraphQL response:

- `useTemplateGalleryPagesQuery`: add `publicUrl` to the GraphQL selection
  (`apps/journeys-admin/src/libs/useTemplateGalleryPagesQuery/useTemplateGalleryPagesQuery.ts`)
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.tsx`:
  render the public URL Stack again, sourced from `collection.publicUrl`
  (the Stack was removed in commit `e3103173a` because it was always
  unreachable; restore it now that the field exists).

---

## Workflow checklist

Per `.claude/rules/backend/database-schema-changes.md`:

- [ ] No Prisma schema change needed (resolved fields only). Skip steps 1–3.
- [ ] Step 4 (Pothos): add the query + the resolved field as above.
- [ ] Step 5: `nx generate-graphql api-journeys-modern`
- [ ] Step 6: `nx generate-graphql api-gateway`
- [ ] Step 7: `nx run-many -t codegen`
- [ ] Run the new specs and existing TemplateGalleryPage specs:
      `nx test api-journeys-modern --testPathPattern templateGalleryPage`
- [ ] Verify no schema drift in `apis/api-gateway/schema.graphql` beyond the
      two additions (one Query field + one TemplateGalleryPage field).

## Out of scope for this prompt

- The agent-native review also surfaced an optional sugar over
  `templateGalleryPageReorderTemplate` (accept `order: -1` for "append"
  or a position enum). That's pure ergonomics for agent clients and the
  current numeric API works. Defer.
