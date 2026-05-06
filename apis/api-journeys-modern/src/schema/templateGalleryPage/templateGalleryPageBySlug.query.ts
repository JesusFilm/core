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
