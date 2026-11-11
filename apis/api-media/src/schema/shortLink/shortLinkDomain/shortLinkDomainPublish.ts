import { prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error'
import { publishDomainWithLinks } from '../edge'

builder.mutationFields((t) => ({
  // Same set as shortLinkDomainCreate/Update: the shortLinkAdmin role or a
  // superAdmin. publisher reads domains only.
  shortLinkDomainPublish: t
    .withAuth({ $any: { isShortLinkDomainAdmin: true, isSuperAdmin: true } })
    .prismaField({
      type: 'ShortLinkDomain',
      description:
        'republish the domain record and every live link on it to the edge store (backfill, cutover, publish-gap repair); shortLinkAdmin or superAdmin',
      errors: { types: [NotFoundError] },
      nullable: false,
      args: { id: t.arg.string({ required: true }) },
      resolve: async (query, _, { id }) => {
        const domain = await prisma.shortLinkDomain.findUnique({
          ...query,
          where: { id }
        })
        if (domain == null)
          throw new NotFoundError('short link domain not found', [
            { path: ['id'], value: id }
          ])
        const edgePublishedAt = await publishDomainWithLinks(id)
        return edgePublishedAt == null ? domain : { ...domain, edgePublishedAt }
      }
    })
}))
