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
      // - parent.teamId equality is enforced in the resolve callback because
      //   Pothos does not support referencing the parent inside `select.where`.
      // - `nestedSelection(true)` lets Pothos prune Journey columns to only
      //   what the client actually selected, mirroring the inverse field on
      //   journeyCollection.ts:33-39.
      templates: t.field({
        type: [JourneyRef],
        nullable: false,
        select: (_args, _ctx, nestedSelection) => ({
          teamId: true,
          templates: {
            include: { journey: nestedSelection(true) },
            where: {
              journey: {
                template: true,
                status: 'published'
              }
            },
            orderBy: { order: 'asc' }
          }
        }),
        resolve: (page) =>
          page.templates
            .filter((tpt) => tpt.journey.teamId === page.teamId)
            .map((tpt) => tpt.journey)
      })
    })
  }
)
