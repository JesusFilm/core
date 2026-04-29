import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MAX_LENGTH = 200

builder.queryField('templateGalleryPageBySlug', (t) =>
  // No withAuth — public, unauthenticated query. The first resolver in
  // api-journeys-modern that serves PublicContext requests directly. The
  // `where: { status: 'published' }` filter is the actual gatekeeper —
  // drafts and unknown slugs return null (frontend interprets as 404).
  t.prismaField({
    type: TemplateGalleryPageRef,
    nullable: true,
    skipTypeScopes: true,
    args: {
      slug: t.arg.string({ required: true })
    },
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
