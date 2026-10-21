import { prisma } from '@core/prisma/analytics/client'

import { builder } from '../builder'

export const MAX_DOMAINS_PER_DELETE = 500

builder.mutationField('sitesDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Int',
    nullable: false,
    description:
      'Deletes the sites with these domains that the caller owns, and returns how many it deleted. Goals, shared links and memberships go with them (the foreign keys cascade). Events already recorded in ClickHouse are left in place.',
    errors: {
      types: [Error]
    },
    args: {
      domains: t.arg.stringList({ required: true })
    },
    resolve: async (_parent, { domains }, context) => {
      if (domains.length > MAX_DOMAINS_PER_DELETE)
        throw new Error(
          `at most ${MAX_DOMAINS_PER_DELETE} domains can be deleted at once`
        )
      if (domains.length === 0) return 0

      const { count } = await prisma.sites.deleteMany({
        where: {
          domain: { in: domains },
          site_memberships: {
            some: { role: 'owner', user_id: context.currentUser.id }
          }
        }
      })
      return count
    }
  })
)
