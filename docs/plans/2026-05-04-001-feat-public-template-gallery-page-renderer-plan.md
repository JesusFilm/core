---
title: 'feat(journeys): NES-1552 Public template gallery page renderer'
type: feat
status: completed
date: 2026-05-04
ticket: NES-1552
branch: siyangcao/nes-1552-public-gallery-page-renderer-template-galleryslug
parent_branch: siyangcao/nes-1547-backend-template-gallery-page-api
---

# NES-1552 — Public template gallery page renderer at `/template-gallery/[slug]`

## Overview

Build the public-facing landing page that anyone with a gallery link can view (no login). The page is server-rendered for SEO via Next.js Incremental Static Regeneration (ISR). It fetches gallery metadata using the new `templateGalleryPageBySlug(slug)` query (added in NES-1547 on the parent branch) and per-template details via the existing public `journey(id, idType)` resolver. It renders the gallery title, description, creator (name + avatar), an optional media embed (YouTube/Loom), and a grid of template cards. Each card has a "Use" button that redirects to `admin.nextstep.is/?useTemplate=<journeyId>` (the NES-1608 deep link, which is not yet implemented in admin — this ticket only wires the redirect URL).

## Problem Statement / Motivation

Mission-partners need a shareable, branded landing page that bundles a curated set of templates around a theme (e.g. "Easter outreach"). Today they share individual journey templates one at a time. The backend API was completed in NES-1547. NES-1552 is the public renderer so partners can share a single URL like `https://your.nextstep.is/template-gallery/easter-2026` to anyone — believer or not, logged in or not — and have visitors land on a polished page that lists the curated templates and offers a one-click path into the admin "Use this template" flow.

## Proposed Solution

Add a new Next.js page route in `apps/journeys` at `pages/home/template-gallery/[slug].tsx`. The page uses `getStaticProps` with `getStaticPaths` (`paths: []`, `fallback: 'blocking'`) and `revalidate: 60` — the same ISR pattern used by the existing public journey route at [apps/journeys/pages/home/[journeySlug].tsx](apps/journeys/pages/home/[journeySlug].tsx).

In `getStaticProps`:

1. Validate the slug against `[a-z0-9-]+` and a length cap before any network call (mirrors the resolver guard, avoids wasted requests on garbage routes).
2. Query `templateGalleryPageBySlug(slug)` via the existing public Apollo SSR client ([apps/journeys/src/libs/apolloClient/apolloClient.ts](apps/journeys/src/libs/apolloClient/apolloClient.ts)). This call also returns the ordered `templates: Journey[]` relation, so a single round-trip covers gallery metadata + ordered template ids.
3. If the result is `null`, return `{ notFound: true }` (the resolver returns `null` for missing/malformed/unpublished — we collapse all three into 404).
4. For each template id, run the existing public `GET_JOURNEY` query (using `IdType.databaseId`) in parallel via `Promise.allSettled` so a single template error does not nuke the whole page. Filter out rejected/null results before passing to the page.
5. Compose `serverSideTranslations` and `getFlags()` like the sibling route, and render.

A second route at `pages/[hostname]/template-gallery/[slug].tsx` is **out of scope** for this ticket — template galleries are intentionally only served from the root domain `your.nextstep.is`. Custom-domain visitors should not see template gallery pages. The middleware at [apps/journeys/middleware.ts](apps/journeys/middleware.ts:43-51) rewrites only the root domain into `/home/...`, so placing the route under `home/` is sufficient and isolates it from custom domains.

The page UI is composed of small purpose-built components under [libs/journeys/ui/src/components/TemplateGalleryView/](libs/journeys/ui/src/components/TemplateGalleryView/) (new directory):

- `TemplateGalleryView` — top-level layout container.
- `TemplateGalleryHeader` — title, description, creator name + avatar.
- `TemplateGalleryMedia` — optional media embed (YouTube or Loom; iframe-based, no third-party JS required).
- `TemplateGalleryGrid` — responsive MUI Grid wrapping reused `TemplateGalleryCard` components from [libs/journeys/ui/src/components/TemplateGalleryCard/TemplateGalleryCard.tsx](libs/journeys/ui/src/components/TemplateGalleryCard/TemplateGalleryCard.tsx). Cards already render thumbnail, title, description, and language. We override the click target so each card navigates to `https://admin.nextstep.is/?useTemplate=<journey.id>` (in a new tab).
- `TemplateGalleryEmptyState` — shown when `templates.length === 0`.

A feature flag check (`templateGalleryPage`) is **not** added (no flag exists yet). A clearly labelled comment is left in `getStaticProps` where the flag check would be inserted, per the user requirement.

## Technical Considerations

### Architecture impacts

- New page in an existing Next.js app — no new infra, no new env vars, no migrations.
- No backend changes. All data fetching uses existing public resolvers.
- Bumps the surface area of the public Apollo client by one query. The client is already configured for `ssrMode` and tolerates missing auth headers (see learning [docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md](docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md)).
- Image domains for creator avatars and template thumbnails are already whitelisted in [apps/journeys/next.config.js:12-30](apps/journeys/next.config.js).

### Performance implications

- ISR with `revalidate: 60` matches the existing public route's cadence — a published gallery is regenerated at most once a minute per node and served from cache otherwise. SEO-critical and zero-runtime cost on hot paths.
- Parallel template fetches use `Promise.allSettled` not `Promise.all` to avoid one failing journey aborting the page render. Because each template is fetched independently, network latency is bounded by the slowest single request (typical: 5-15 templates per gallery, sub-second).
- We do **not** fetch the full journey block tree per template — only the fields the card needs (`id`, `slug`, `title`, `description`, `primaryImageBlock`, `language`, `customizable`, `website`, `createdAt`). A new lightweight fragment lives next to the page and shares the existing `IMAGE_FIELDS` shape.

### Security considerations

- Page is public by design. No PII rendered beyond what mission-partners explicitly publish (creator name, optional avatar).
- Apollo client used for SSR uses the unauthenticated path. We do **not** propagate request cookies to the GraphQL gateway from `getStaticProps` (ISR caches per slug, not per visitor — sending visitor cookies would poison the shared cache).
- Slug validation up front prevents pathological inputs from hitting the gateway.
- We set `errorPolicy: 'all'` on the per-template fetches (per learning [docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md](docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md)) so a partial GraphQL error degrades gracefully.
- The "Use" button opens `admin.nextstep.is/?useTemplate=<id>` in a new tab with `rel="noopener noreferrer"`. The destination URL is constructed from `journey.id` only — no user-controlled fragment is injected.

### SEO

- `NextSeo` block: `title`, `description`, OpenGraph (image = creator avatar fallback or first template thumbnail), Twitter summary card. Unlike `[journeySlug].tsx`, **do not** set `noindex` — public template galleries are explicitly meant to be discoverable.
- Canonical URL points to `https://your.nextstep.is/template-gallery/<slug>`.

## System-Wide Impact

- **Interaction graph**: `/template-gallery/[slug]` → middleware rewrites to `/home/template-gallery/[slug]` → `getStaticProps` calls Apollo SSR client → gateway → `templateGalleryPageBySlug` resolver → Prisma. Per-template parallel calls hit `journey(id, idType)` resolver. No callbacks, observers, or background jobs fired.
- **Error propagation**: Resolver `null` → `notFound: true` → Next.js 404 page. Network/transport errors during `templateGalleryPageBySlug` re-throw and produce a 500 (Next.js default) so monitoring catches infra failures, not silent blank pages. Per-template errors are caught and the offending card is filtered from the grid.
- **State lifecycle risks**: None — this is a read-only page. ISR cache invalidation is handled by the existing `/api/revalidate` route already deployed in `apps/journeys`.
- **API surface parity**: The `journeyAcl(Read)` path on the public `journey(id)` resolver already permits reads when `template === true && status === 'published'`. This is the same path the existing public template view in `journeys-admin` uses. No ACL change needed.
- **Integration test scenarios**:
  1. Cold request to `/template-gallery/easter-2026` with no cookies → 200, full page rendered, `<title>` set, OG tags present.
  2. Request to `/template-gallery/<unpublished-slug>` → 404.
  3. Request to `/template-gallery/<malformed_slug!!>` → 404 without a gateway round-trip.
  4. Gallery exists but has zero published templates → 200, empty-state message shown, gallery title/description still rendered.
  5. Gallery has 5 templates, one is unexpectedly unreadable (e.g. soft-deleted between query and re-fetch) → 4 cards render, page does not 500.

## Acceptance Criteria

- [ ] Route `apps/journeys/pages/home/template-gallery/[slug].tsx` exists and renders for `your.nextstep.is/template-gallery/<slug>`.
- [ ] Page is server-rendered (visible in `view-source`) for SEO; uses ISR with `revalidate: 60` and `fallback: 'blocking'`.
- [ ] `templateGalleryPageBySlug` is called once with the slug; result is checked for `null` and 404 returned in that case.
- [ ] Slug is validated against `^[a-z0-9-]+$` with a max length matching the resolver's `SLUG_MAX_LENGTH` before any network call.
- [ ] Per-template `GET_JOURNEY` calls run in parallel with `Promise.allSettled`; rejected/null entries are filtered out.
- [ ] Renders gallery title, description, creator name, creator avatar (when present).
- [ ] Renders an embedded media player when `mediaUrl` is a recognised YouTube or Loom URL; gracefully omits the embed when the URL is empty or unrecognised.
- [ ] Renders a responsive grid of template cards (xs=1 col, sm=2, md=3, lg=4). Each card shows thumbnail, title, description (truncated), and language.
- [ ] Each card's "Use" button targets `https://admin.nextstep.is/?useTemplate=<journey.id>` and opens in a new tab with `rel="noopener noreferrer"`.
- [ ] Empty-state message is shown when the gallery has zero published templates (gallery info still rendered).
- [ ] `NextSeo` is configured with title, description, canonical URL, OpenGraph image, Twitter summary card; **no** `noindex`.
- [ ] A clearly labelled comment marks the location where a future `templateGalleryPage` feature flag check would be inserted.
- [ ] Unit / integration tests pass for: rendering happy path, 404 for missing slug, 404 for malformed slug, empty templates state, partial template-fetch failure.
- [ ] No new TypeScript or ESLint errors in `apps/journeys`.

## Implementation Plan

### File: `apps/journeys/pages/home/template-gallery/[slug].tsx`

The Next.js page. `getStaticProps`, `getStaticPaths`, and the React component live here.

```tsx
// apps/journeys/pages/home/template-gallery/[slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'
import { TemplateGalleryView } from '@core/journeys/ui/TemplateGalleryView'

import { GetTemplateGalleryPage, GetTemplateGalleryPageVariables, GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage, GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../__generated__/GetTemplateGalleryPage'
import { GetJourney, GetJourneyVariables, GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getFlags } from '../../../src/libs/getFlags'
import { isValidGallerySlug } from '../../../src/libs/isValidGallerySlug'

import { GET_TEMPLATE_GALLERY_PAGE } from '../../../src/libs/useTemplateGalleryPageQuery'

interface TemplateGalleryPageProps {
  gallery: TemplateGalleryPage
  templates: Journey[]
}

function TemplateGalleryPageRoute({ gallery, templates }: TemplateGalleryPageProps): ReactElement {
  return (
    <>
      <NextSeo
        title={gallery.title}
        description={gallery.description ?? undefined}
        canonical={`https://your.nextstep.is/template-gallery/${gallery.slug}`}
        openGraph={{
          type: 'website',
          title: gallery.title,
          description: gallery.description ?? undefined,
          url: `https://your.nextstep.is/template-gallery/${gallery.slug}`,
          images:
            gallery.creatorImageBlock?.src != null
              ? [
                  {
                    url: gallery.creatorImageBlock.src,
                    width: gallery.creatorImageBlock.width,
                    height: gallery.creatorImageBlock.height,
                    alt: gallery.creatorImageBlock.alt
                  }
                ]
              : []
        }}
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <TemplateGalleryView gallery={gallery} templates={templates} />
    </>
  )
}

export const getStaticProps: GetStaticProps<TemplateGalleryPageProps> = async (context) => {
  // FEATURE FLAG: insert `templateGalleryPage` flag check here once the flag is added.
  // When the flag is OFF, return { notFound: true }.

  const slug = context.params?.slug?.toString() ?? ''
  if (!isValidGallerySlug(slug)) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale ?? 'en', ['apps-journeys', 'libs-journeys-ui'], i18nConfig))
      },
      notFound: true,
      revalidate: 60
    }
  }

  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetTemplateGalleryPage, GetTemplateGalleryPageVariables>({
    query: GET_TEMPLATE_GALLERY_PAGE,
    variables: { slug },
    errorPolicy: 'all'
  })

  const gallery = data?.templateGalleryPageBySlug
  if (gallery == null) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale ?? 'en', ['apps-journeys', 'libs-journeys-ui'], i18nConfig))
      },
      notFound: true,
      revalidate: 60
    }
  }

  const templates = await fetchTemplatesInOrder(apolloClient, gallery.templates ?? [])

  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(context.locale ?? 'en', ['apps-journeys', 'libs-journeys-ui'], i18nConfig)),
      gallery,
      templates
    },
    revalidate: 60
  }
}

async function fetchTemplatesInOrder(apolloClient: ReturnType<typeof createApolloClient>, ordered: GalleryTemplate[]): Promise<Journey[]> {
  const results = await Promise.allSettled(
    ordered.map(({ id }) =>
      apolloClient.query<GetJourney, GetJourneyVariables>({
        query: GET_JOURNEY,
        variables: { id, idType: IdType.databaseId },
        errorPolicy: 'all'
      })
    )
  )
  return results.map((r) => (r.status === 'fulfilled' ? r.value.data?.journey : null)).filter((j): j is Journey => j != null)
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking'
})

export default TemplateGalleryPageRoute
```

### File: `apps/journeys/src/libs/isValidGallerySlug/isValidGallerySlug.ts`

Tiny pure helper. Mirrors the resolver guard.

```ts
const SLUG_REGEX = /^[a-z0-9-]+$/
const SLUG_MAX_LENGTH = 100 // align with backend resolver

export function isValidGallerySlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_REGEX.test(slug)
}
```

### File: `apps/journeys/src/libs/useTemplateGalleryPageQuery/useTemplateGalleryPageQuery.ts`

The query document. Located alongside other query helpers in `apps/journeys/src/libs/`.

```ts
import { gql } from '@apollo/client'

export const GET_TEMPLATE_GALLERY_PAGE = gql`
  query GetTemplateGalleryPage($slug: String!) {
    templateGalleryPageBySlug(slug: $slug) {
      id
      slug
      title
      description
      creatorName
      mediaUrl
      publishedAt
      creatorImageBlock {
        id
        src
        alt
        width
        height
      }
      templates {
        id
      }
    }
  }
`
```

> The full template card data (thumbnail, language, etc.) is fetched per id via the existing `GET_JOURNEY` query — keeps this query lean and reuses generated types.

### File: `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryView.tsx`

Top-level layout. MUI Container + Stack.

```tsx
// Composition only — wraps Header, Media, Grid (or EmptyState).
```

### File: `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryHeader/TemplateGalleryHeader.tsx`

Title (`Typography variant="h2"`), description (`Typography variant="body1"`), creator strip (Avatar + name).

### File: `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryMedia/TemplateGalleryMedia.tsx`

Iframe embed. Detects YouTube (`youtube.com/watch?v=`, `youtu.be/`) and Loom (`loom.com/share/`) URLs and rewrites to embed URLs. Returns `null` for unrecognised URLs.

```tsx
function toEmbedUrl(url: string): string | null {
  const yt = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
  if (yt != null) return `https://www.youtube.com/embed/${yt[1]}`
  const loom = url.match(/^(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([\w-]+)/)
  if (loom != null) return `https://www.loom.com/embed/${loom[1]}`
  return null
}
```

> Iframe attributes: `loading="lazy"`, `allowFullScreen`, `referrerPolicy="strict-origin-when-cross-origin"`, 16:9 aspect ratio via MUI `Box`.

### File: `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryGrid/TemplateGalleryGrid.tsx`

MUI Grid (xs=12, sm=6, md=4, lg=3). Maps `templates` to a card. Each card wraps `TemplateGalleryCard` and overrides the click handler to navigate to the admin URL.

```tsx
const adminBase = process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? 'https://admin.nextstep.is'
const useUrl = `${adminBase}/?useTemplate=${journey.id}`
// <a href={useUrl} target="_blank" rel="noopener noreferrer">
```

> If `TemplateGalleryCard` prop API does not allow overriding navigation, wrap the card in a clickable `Link` and render the existing card with `priority={index === 0}` for above-the-fold image priority.

### File: `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryEmptyState/TemplateGalleryEmptyState.tsx`

Centered `Stack` with an icon and a translated message ("This gallery has no templates yet").

### Test files

- `apps/journeys/pages/home/template-gallery/[slug].spec.tsx` — page-level tests using `@testing-library/react` and Apollo mocks. Cover: happy path render, 404 on null gallery, 404 on malformed slug (exercise `getStaticProps` directly), empty templates list, partial template fetch failure.
- `apps/journeys/src/libs/isValidGallerySlug/isValidGallerySlug.spec.ts` — boundary tests (empty, too long, uppercase, underscore, valid).
- `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryView.spec.tsx` — renders title/description/creator, shows empty state, renders grid with N cards.
- `libs/journeys/ui/src/components/TemplateGalleryView/TemplateGalleryMedia/TemplateGalleryMedia.spec.tsx` — recognises YouTube + Loom URLs, returns null for unsupported, sets `loading="lazy"`.

### Codegen

After adding `GET_TEMPLATE_GALLERY_PAGE`, regenerate the `__generated__/GetTemplateGalleryPage.ts` types via the project's standard codegen workflow (the same step that produced `__generated__/GetJourney.ts`). Confirm the generated types include `templateGalleryPageBySlug` as a nullable field.

## Success Metrics

- Page returns 200 with full HTML in `view-source` for any published gallery slug.
- Page returns 404 for unknown / unpublished / malformed slugs.
- p95 SSR time under 800ms for galleries with up to 12 templates (parallel fetches dominated by gateway latency).
- Lighthouse Best Practices and SEO scores ≥ 95 on a representative gallery URL.

## Dependencies & Risks

### Dependencies

- **Parent branch `siyangcao/nes-1547-backend-template-gallery-page-api`** must merge before this PR is reviewable end-to-end. Day-to-day local work is fine — we branched from it.
- The admin `?useTemplate=<id>` deep link (NES-1608) does not yet exist. We wire the redirect URL anyway; clicking "Use" from this gallery before NES-1608 ships will land on the admin home with an unhandled query param (no harm done).
- No new env vars. `NEXT_PUBLIC_JOURNEYS_ADMIN_URL` already exists in the deployment environment.

### Risks

- **Risk:** A custom-domain customer might want gallery pages on their own domain.
  - **Mitigation:** Out of scope. If raised post-launch, add a parallel `pages/[hostname]/template-gallery/[slug].tsx` that gates on a per-team capability — separate ticket.
- **Risk:** Slug regex on the resolver could drift from the frontend guard, causing a frontend 404 for a slug the backend would accept (or vice versa).
  - **Mitigation:** Slug regex and length cap kept in a single named helper; comment links to the resolver.
- **Risk:** Per-template parallel fetches might cause N+1 fan-out under load.
  - **Mitigation:** Galleries have a small bounded number of templates (NES-1547 backend has no documented hard cap, but UX caps at ~24). ISR caches the rendered HTML for 60s, so fan-out only happens on revalidation.
- **Risk:** Loom/YouTube embed iframes can produce mixed-content warnings if `mediaUrl` is `http://`.
  - **Mitigation:** `toEmbedUrl` always rewrites to `https://`.

## Sources & References

### Internal references

- Parent backend ticket — [NES-1547 backend resolver](apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.ts)
- Sibling SSR pattern — [apps/journeys/pages/home/[journeySlug].tsx](apps/journeys/pages/home/[journeySlug].tsx)
- Apollo SSR client — [apps/journeys/src/libs/apolloClient/apolloClient.ts](apps/journeys/src/libs/apolloClient/apolloClient.ts)
- Existing card component — [libs/journeys/ui/src/components/TemplateGalleryCard/TemplateGalleryCard.tsx](libs/journeys/ui/src/components/TemplateGalleryCard/TemplateGalleryCard.tsx)
- Hostname middleware — [apps/journeys/middleware.ts](apps/journeys/middleware.ts)
- Public journey query — [libs/journeys/ui/src/libs/useJourneyQuery/useJourneyQuery.ts](libs/journeys/ui/src/libs/useJourneyQuery/useJourneyQuery.ts)
- 404 helper pattern — [apps/journeys/src/libs/isJourneyNotFoundError/](apps/journeys/src/libs/isJourneyNotFoundError/)

### Institutional learnings

- [docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md](docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md) — confirms resolver returns `null` for missing/malformed/unpublished and is reachable without an auth token.
- [docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md](docs/solutions/logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md) — informs `errorPolicy: 'all'` choice on per-template fetches so a partial GraphQL error does not blank the page.
- [docs/solutions/security-issues/journey-acl-read-authorization-bypass-invite-requested-role.md](docs/solutions/security-issues/journey-acl-read-authorization-bypass-invite-requested-role.md) — informs per-template error tolerance: ACL surface on `journey(id)` is sensitive to template/published flags.

### Conventions

- Frontend code rules — [.claude/rules/frontend/apps.md](.claude/rules/frontend/apps.md) (MUI over raw HTML, early returns, accessibility on all interactive elements, `handle` prefix for event handlers).
- Jest test rules — [.claude/rules/running-jest-tests.md](.claude/rules/running-jest-tests.md) (`npx jest` with `--no-coverage` and an explicit config path).

## Out of Scope

- The admin `?useTemplate=<id>` deep-link handler (NES-1608).
- The `templateGalleryPage` feature flag wiring.
- Template gallery rendering on custom-domain hosts.
- Internationalisation strings beyond the standard `apps-journeys` and `libs-journeys-ui` namespaces.
- Analytics events on the gallery page (will be added in a follow-up ticket once the page ships).
