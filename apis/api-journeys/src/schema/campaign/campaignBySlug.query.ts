import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import {
  SLUG_MAX_LENGTH,
  SLUG_PATTERN
} from '../templateGalleryPage/generateUniqueSlug'

import { CampaignPublicRef } from './campaign'

// Public, unauthenticated query (same contract as templateGalleryPageBySlug).
// No `withAuth` block; `where: { status: 'published' }` is the gatekeeper —
// drafts and unknown slugs return null (frontend renders 404).
builder.queryField('campaignBySlug', (t) =>
  t.prismaField({
    description:
      'Public, unauthenticated read by slug. Returns the Campaign with the given slug, but ONLY if it is currently `published`. Returns null for: unknown slug, draft slug, malformed slug (does not match `^[a-z0-9]+(-[a-z0-9]+)*$`), or slug exceeding 200 characters.',
    type: CampaignPublicRef,
    nullable: true,
    args: {
      slug: t.arg.string({
        required: true,
        description:
          'Case-sensitive public slug. Slugs that fail the shape check return null without hitting the database.'
      })
    },
    resolve: async (query, _parent, args) => {
      const { slug } = args
      if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
        return null
      }
      return await prisma.campaign.findFirst({
        ...query,
        where: { slug, status: 'published' }
      })
    }
  })
)
