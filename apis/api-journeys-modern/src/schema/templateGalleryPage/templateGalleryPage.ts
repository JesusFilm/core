import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import { TemplateGalleryPageStatus } from './enums'

// `shareable` is intentionally omitted: TemplateGalleryPage is owned
// exclusively by api-journeys-modern and is not federated with the legacy
// api-journeys subgraph. Setting `shareable: true` (the sibling default)
// would falsely advertise that another subgraph may also resolve this type.
export const TemplateGalleryPageRef = builder.prismaObject(
  'TemplateGalleryPage',
  {
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      title: t.exposeString('title', { nullable: false }),
      description: t.exposeString('description', { nullable: false }),
      slug: t.exposeString('slug', { nullable: false }),
      status: t.expose('status', {
        type: TemplateGalleryPageStatus,
        nullable: false
      }),
      creatorName: t.exposeString('creatorName', { nullable: false }),
      creatorImageBlock: t.relation('creatorImageBlock', { nullable: true }),
      mediaUrl: t.exposeString('mediaUrl', { nullable: true }),
      publishedAt: t.expose('publishedAt', {
        type: 'DateTimeISO',
        nullable: true
      }),
      createdAt: t.expose('createdAt', {
        type: 'DateTimeISO',
        nullable: false
      }),
      updatedAt: t.expose('updatedAt', {
        type: 'DateTimeISO',
        nullable: false
      }),
      team: t.relation('team', { nullable: false }),
      // Templates are ordered by `order` ascending. Read-time filter
      // (security H2): even if a journey was transferred to another team or
      // its `template` flag was flipped to false after being added to the
      // gallery, only same-team published templates surface here.
      // - The SQL `where` filters non-template / non-published rows out.
      // - The in-memory filter enforces parent.teamId equality (Pothos does
      //   not let `select.where` reference the parent).
      //
      // We deliberately use `include: { journey: true }` rather than
      // `nestedSelection(true)`. nestedSelection only selects Pothos-exposed
      // scalars + client-requested fields, and Journey.teamId is not exposed
      // on JourneyRef. With nestedSelection the in-memory filter would
      // compare `undefined === <string>` and silently drop every template
      // (CodeRabbit caught this in PR #9119). Fetching all Journey scalars
      // is a minor over-fetch; correctness wins.
      templates: t.field({
        type: [JourneyRef],
        nullable: false,
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
