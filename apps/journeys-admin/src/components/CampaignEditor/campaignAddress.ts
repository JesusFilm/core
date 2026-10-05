const JOURNEYS_URL =
  process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

/** The permanent Campaign Address: `/campaign/<slug>` on the root domain, reachable on every host. */
export function campaignPermanentAddress(slug: string): string {
  return `${JOURNEYS_URL}/campaign/${slug}`
}

/**
 * The address the public page is served at right now: the Custom Domain root
 * when one names the campaign as Campaign Root, else the permanent address.
 */
export function campaignPublicAddress(
  slug: string,
  hostname: string | null
): string {
  if (hostname != null && hostname !== '') return `https://${hostname}`
  return campaignPermanentAddress(slug)
}
