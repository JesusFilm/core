import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import { TemplateGalleryPageStatus } from './enums'

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
      // Templates are ordered by `order` ascending. Read-time filter (security H2):
      // even if a journey was transferred to another team or its `template` flag
      // was flipped to false after being added to the gallery, only same-team
      // published templates surface here. The teamId equality is enforced via
      // the parent's teamId in the resolve callback (Pothos does not support
      // referencing parent fields directly inside a `select.where`).
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
                status: 'published'
              }
            },
            orderBy: { order: 'asc' }
          }
        },
        resolve: (page) =>
          page.templates
            .filter((tpt) => tpt.journey?.teamId === page.teamId)
            .map((tpt) => tpt.journey)
      })
    })
  }
)
