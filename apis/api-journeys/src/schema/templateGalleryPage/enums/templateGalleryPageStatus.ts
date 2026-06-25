import { TemplateGalleryPageStatus as PrismaTemplateGalleryPageStatus } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const TemplateGalleryPageStatus = builder.enumType(
  PrismaTemplateGalleryPageStatus,
  {
    name: 'TemplateGalleryPageStatus',
    description:
      'Lifecycle state of a TemplateGalleryPage. Anonymous traffic via `templateGalleryPageBySlug` only sees `published` rows; drafts are hidden.',
    values: {
      draft: {
        description:
          'Hidden from the public renderer. All edit operations are allowed.'
      },
      published: {
        description:
          'Reachable at `/collections/<slug>`. `templateGalleryPageUpdate` and `templateGalleryPageAssignJourney` remain allowed (publishers can fix typos and curate the template list while live); `templateGalleryPageReorderTemplate` is rejected with CONFLICT — unpublish first to reorder.'
      }
    }
  }
)
