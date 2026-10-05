import { Prisma } from '@core/prisma/journeys/client'

import { env } from '../../env'

export const INCLUDE_JOURNEY_PUBLIC_URL = {
  team: { include: { customDomains: true } },
  journeyCollectionJourneys: {
    include: { journeyCollection: { include: { customDomains: true } } }
  }
} satisfies Prisma.JourneyInclude

export type JourneyWithPublicUrl = Prisma.JourneyGetPayload<{
  include: typeof INCLUDE_JOURNEY_PUBLIC_URL
}>

/**
 * Where a journey is served, decided by the journey's own team (PRD §6): a
 * route-all custom domain, else a collection domain containing it, else the
 * root domain. The campaign builds no URLs of its own; the viewer receives
 * these resolved.
 */
export function getJourneyPublicUrl(journey: JourneyWithPublicUrl): string {
  const routeAllDomain = journey.team.customDomains.find(
    (domain) => domain.routeAllTeamJourneys
  )
  if (routeAllDomain != null)
    return `https://${routeAllDomain.name}/${journey.slug}`

  for (const membership of journey.journeyCollectionJourneys) {
    const collectionDomain = membership.journeyCollection.customDomains[0]
    if (collectionDomain != null)
      return `https://${collectionDomain.name}/${journey.slug}`
  }

  return `${env.JOURNEYS_URL}/${journey.slug}`
}

/** The root-domain embed route, which skips the domain filter for any team. */
export function getJourneyEmbedUrl(journey: Pick<JourneyWithPublicUrl, 'slug'>): string {
  return `${env.JOURNEYS_URL}/embed/${journey.slug}`
}
