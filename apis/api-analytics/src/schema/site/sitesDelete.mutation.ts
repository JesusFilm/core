import { prisma } from '@core/prisma/analytics/client'

import { builder } from '../builder'

export const MAX_DOMAINS_PER_DELETE = 500

function checkDomainCount(domains: string[]): void {
  if (domains.length > MAX_DOMAINS_PER_DELETE)
    throw new Error(
      `at most ${MAX_DOMAINS_PER_DELETE} domains can be deleted at once`
    )
}

function ownedBy(userId: bigint): {
  site_memberships: { some: { role: 'owner'; user_id: bigint } }
} {
  return { site_memberships: { some: { role: 'owner', user_id: userId } } }
}

builder.mutationField('sitesDeletePrepare', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Int',
    nullable: false,
    description:
      "Deletes the goals and setup-help email records of the sites with these domains that the caller owns, leaving the sites, and returns how many rows it deleted. Plausible's database has no site_id index on those two tables, so deleting a site makes Postgres read each of them in full. Run this over every site you are about to delete first, so those tables are small by the time sitesDelete runs.",
    errors: {
      types: [Error]
    },
    args: {
      domains: t.arg.stringList({ required: true })
    },
    resolve: async (_parent, { domains }, context) => {
      checkDomainCount(domains)
      if (domains.length === 0) return 0

      const sites = await prisma.sites.findMany({
        where: { domain: { in: domains }, ...ownedBy(context.currentUser.id) },
        select: { id: true }
      })
      if (sites.length === 0) return 0

      const siteIds = sites.map(({ id }) => id)
      const goals = await prisma.goals.deleteMany({
        where: { site_id: { in: siteIds } }
      })
      const setupHelpEmails = await prisma.setup_help_emails.deleteMany({
        where: { site_id: { in: siteIds } }
      })
      return goals.count + setupHelpEmails.count
    }
  })
)

builder.mutationField('sitesDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Int',
    nullable: false,
    description:
      'Deletes the sites with these domains that the caller owns, and returns how many it deleted. Goals, shared links and memberships go with them (the foreign keys cascade). Events already recorded in ClickHouse are left in place. Deleting many sites is slow unless sitesDeletePrepare has run over them first.',
    errors: {
      types: [Error]
    },
    args: {
      domains: t.arg.stringList({ required: true })
    },
    resolve: async (_parent, { domains }, context) => {
      checkDomainCount(domains)
      if (domains.length === 0) return 0

      const { count } = await prisma.sites.deleteMany({
        where: { domain: { in: domains }, ...ownedBy(context.currentUser.id) }
      })
      return count
    }
  })
)
