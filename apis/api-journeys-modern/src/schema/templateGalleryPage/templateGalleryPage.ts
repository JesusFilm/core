import { builder } from '../builder'

import { TemplateGalleryPageStatus } from './enums'
import { TemplateGalleryItemRef } from './templateGalleryItem'

// `shareable` is intentionally omitted: TemplateGalleryPage is owned
// exclusively by api-journeys-modern and is not federated with the legacy
// api-journeys subgraph. Setting `shareable: true` (the sibling default)
// would falsely advertise that another subgraph may also resolve this type.
export const TemplateGalleryPageRef = builder.prismaObject(
  'TemplateGalleryPage',
  {
    description:
      'A team-curated, slug-addressable public landing page that bundles a hand-picked, hand-ordered list of template journeys. The slug is mutable post-publish — changing it breaks any external links to the old URL. `publishedAt` is monotonic: stamped only on the first publish, never re-stamped on subsequent unpublish/republish, and never cleared. `creatorImageSrc` and `creatorImageAlt` are plain string columns (not a Block FK) — the avatar URL survives independently of any owning Block.',
    fields: (t) => ({
      id: t.exposeID('id', {
        nullable: false,
        description: 'Stable UUID identifier.'
      }),
      title: t.exposeString('title', {
        nullable: false,
        description: 'Display title shown in admin UI and on the public page.'
      }),
      description: t.exposeString('description', {
        nullable: false,
        description:
          'Long-form description shown on the public page. Defaults to empty string.'
      }),
      slug: t.exposeString('slug', {
        nullable: false,
        description:
          'URL-safe identifier. The public page is reached at `/template-gallery/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.'
      }),
      status: t.expose('status', {
        type: TemplateGalleryPageStatus,
        nullable: false,
        description:
          '`draft` hides the page from the public renderer; `published` exposes it via `templateGalleryPageBySlug`.'
      }),
      creatorName: t.exposeString('creatorName', {
        nullable: false,
        description:
          'Display name of the team or person credited as the page creator.'
      }),
      creatorImageSrc: t.exposeString('creatorImageSrc', {
        nullable: true,
        description:
          'Optional https URL of the creator avatar image. Plain string (not a Block FK) — survives independently of any owning Block. https-only on write.'
      }),
      creatorImageAlt: t.exposeString('creatorImageAlt', {
        nullable: true,
        description: 'Optional alt text for the creator avatar.'
      }),
      mediaUrl: t.exposeString('mediaUrl', {
        nullable: true,
        description:
          'Optional https URL of a hero/cover media asset shown on the public page. https-only on write.'
      }),
      publishedAt: t.expose('publishedAt', {
        type: 'DateTimeISO',
        nullable: true,
        description:
          'Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.'
      }),
      createdAt: t.expose('createdAt', {
        type: 'DateTimeISO',
        nullable: false
      }),
      updatedAt: t.expose('updatedAt', {
        type: 'DateTimeISO',
        nullable: false
      }),
      team: t.relation('team', {
        nullable: false,
        description:
          'Owning team. The page is hard-deleted when the team is deleted.'
      }),
      // Templates are ordered by `order` ascending. Read-time filter
      // (security H2): even if a journey was transferred to another team or
      // its `template` flag was flipped to false after being added to the
      // gallery, only same-team published templates surface here.
      // - The SQL `where` filters non-template / non-published rows out.
      // - The in-memory filter enforces parent.teamId equality (Pothos does
      //   not let `select.where` reference the parent).
      //
      // Type is `[TemplateGalleryItemRef]` — a narrow public DTO over the
      // Journey row — NOT `[JourneyRef]`. This caps the PublicContext
      // anonymous-reachable surface to the fields the public renderer
      // actually consumes; see templateGalleryItem.ts for the rationale.
      //
      // We deliberately use `include: { journey: true }` rather than
      // `nestedSelection(true)`. nestedSelection only selects Pothos-exposed
      // scalars + client-requested fields, and Journey.teamId is not exposed
      // on the public TemplateGalleryItem type. With nestedSelection the
      // in-memory filter would compare `undefined === <string>` and silently
      // drop every template (CodeRabbit caught this in PR #9119 against the
      // older JourneyRef path). Fetching all Journey scalars is a minor
      // over-fetch; correctness wins.
      templates: t.field({
        type: [TemplateGalleryItemRef],
        nullable: false,
        description:
          'Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only — a journey transferred to another team or unflagged from `template` after being added is silently dropped from this list. Each item is the narrow `TemplateGalleryItem` public DTO, NOT the full `Journey` type.',
        select: {
          teamId: true,
          templates: {
            include: { journey: true },
            where: {
              journey: {
                template: true,
                status: 'published',
                // Honor the project-wide soft-delete convention so a journey
                // soft-deleted after being added to a gallery cannot leak to
                // anonymous viewers via the public slug query. Mirrors the
                // write-time filter in filterToTeamTemplates.ts.
                deletedAt: null
              }
            },
            orderBy: { order: 'asc' }
          }
        },
        resolve: (page) =>
          page.templates
            .filter((tpt) => tpt.journey.teamId === page.teamId)
            .map((tpt) => tpt.journey)
      })
    })
  }
)
