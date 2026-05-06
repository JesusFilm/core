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
    description:
      'Public, unauthenticated read by slug. Returns the TemplateGalleryPage with the given slug, but ONLY if the page is currently `published`. Returns null for: unknown slug, draft slug, malformed slug (does not match `^[a-z0-9]+(-[a-z0-9]+)*$`), or slug exceeding 200 characters. Authenticated readers fetching their own team\'s drafts should use `templateGalleryPage(id)` or `templateGalleryPages(teamId)` instead.',
    type: TemplateGalleryPageRef,
    nullable: true,
    args: {
      slug: t.arg.string({
        required: true,
        description:
          'Case-sensitive public slug. Must match `^[a-z0-9]+(-[a-z0-9]+)*$` (lowercase letters, digits, and hyphen-separated segments only) and be at most 200 characters. Slugs that fail this shape return null without hitting the database.'
      })
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
