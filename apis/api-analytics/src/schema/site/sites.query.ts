import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/analytics/client'

import { builder } from '../builder'

const DEFAULT_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 1000

builder.queryType({
  fields: (t) => ({
    sites: t.withAuth({ isAuthenticated: true }).prismaField({
      type: ['sites'],
      nullable: false,
      description:
        'Sites the caller owns, ordered by id. Page with `after` set to the last id returned.',
      args: {
        domainStartsWith: t.arg.string({ required: false }),
        after: t.arg.string({ required: false }),
        first: t.arg.int({ required: false })
      },
      resolve: async (
        query,
        _parent,
        { domainStartsWith, after, first },
        context
      ) => {
        if (after != null && !/^\d+$/.test(after))
          throw new GraphQLError('after must be a site id', {
            extensions: { code: 'BAD_USER_INPUT' }
          })

        const take = Math.min(
          Math.max(first ?? DEFAULT_PAGE_SIZE, 1),
          MAX_PAGE_SIZE
        )

        return await prisma.sites.findMany({
          ...query,
          where: {
            domain:
              domainStartsWith != null
                ? { startsWith: domainStartsWith }
                : undefined,
            id: after != null ? { gt: BigInt(after) } : undefined,
            site_memberships: {
              some: { role: 'owner', user_id: context.currentUser.id }
            }
          },
          orderBy: { id: 'asc' },
          take
        })
      }
    })
  })
})
