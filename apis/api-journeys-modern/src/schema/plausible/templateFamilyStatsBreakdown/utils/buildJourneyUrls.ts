import { env } from '../../../../env'

interface CustomDomain {
  name: string
}

/**
 * Determines the URL to use for visiting a journey.
 * Priority: custom domain (if available) > JOURNEYS_URL environment variable > default production URL
 *
 * @param slug - The journey slug
 * @param customDomains - Array of custom domain objects (uses first domain, consistent with rest of codebase)
 */
export function buildJourneyUrl(
  slug: string,
  customDomains: CustomDomain[] = []
): string {
  if (customDomains.length > 0) {
    return `https://${customDomains[0].name}/${slug}`
  }

  const baseUrl = env.JOURNEYS_URL
  return `${baseUrl}/${slug}`
}
