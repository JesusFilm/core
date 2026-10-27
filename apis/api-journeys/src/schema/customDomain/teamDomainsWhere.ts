import { Prisma } from '@core/prisma/journeys/client'

/**
 * The team's own domains: a Campaign Domain belongs to its campaign, so every
 * team-level domain read (the Team list, `customDomains(teamId)`, a journey's
 * revalidation host) leaves it out.
 */
export const TEAM_DOMAINS_WHERE = {
  campaignId: null
} satisfies Prisma.CustomDomainWhereInput
