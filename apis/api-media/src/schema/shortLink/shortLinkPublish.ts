import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { NotFoundError } from '../error'

import { publishLink } from './edge'

builder.mutationFields((t) => ({
  shortLinkPublish: t
    .withAuth({ $any: { isPublisher: true, isShortLinkAdmin: true } })
    .prismaField({
      type: 'ShortLink',
      description:
        'republish one short link routing record to the edge store (publish-gap repair)',
      errors: { types: [NotFoundError] },
      nullable: false,
      args: { id: t.arg.string({ required: true }) },
      resolve: async (query, _, { id }) => {
        // Deliberately no `deletedAt: null` filter: republishing a retired or
        // soft-deleted link is how its stale edge record gets removed
        // (`publishLink` unpublishes anything that is not live).
        const shortLink = await prisma.shortLink.findUnique({
          ...query,
          where: { id }
        })
        if (shortLink == null)
          throw new NotFoundError('short link not found', [
            { path: ['id'], value: id }
          ])
        const edgePublishedAt = await publishLink(id)
        return edgePublishedAt == null
          ? shortLink
          : { ...shortLink, edgePublishedAt }
      }
    })
}))
