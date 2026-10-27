import { Prisma } from '@core/prisma/journeys/client'

/**
 * The team's own domains: a Campaign Domain belongs to its campaign, so every
 * team-level domain read (the Team list, `customDomains(teamId)`, a journey's
 * revalidation host) leaves it out.
 *
 * Journey hostname lookups (`getJourneyPublicUrl`, `journey.query.ts`,
 * `journeys.query.ts`) do not use this: they match only route-all or
 * collection domains, which the `CustomDomain_campaignDomain_check` CHECK
 * keeps off every Campaign Domain.
 */
export const TEAM_DOMAINS_WHERE = {
  campaignId: null
} satisfies Prisma.CustomDomainWhereInput
