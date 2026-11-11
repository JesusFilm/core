/** What listing a campaign's page paths reads off it. */
export interface CampaignPagePathsInput {
  slug: string
  regions: Array<{ slug: string }>
  /** The campaign's Campaign Domain, as a list of at most one. */
  hostnames?: string[]
  /** The `_lang/<tag>` tags of its Page Languages (`pageLanguageTag`). */
  languageTags?: string[]
}

/**
 * Every Next.js page path a campaign is served from: the landing page and
 * every region (listed and orphan) in the root-domain form, and — once it
 * has a Campaign Domain — the same pages in the domain form. The root-domain
 * form of a campaign with a domain is not found; it is still listed so a
 * page cached before the domain was added is purged. Each of them also has
 * one page per `languageTags` entry, under `_lang/<tag>` ahead of the
 * region, which is where a `?lang=` link lands. Paths are the page paths
 * behind the proxy rewrite, which is what the journeys app's
 * `/api/revalidate` needs.
 */
export function campaignPagePaths(campaign: CampaignPagePathsInput): string[] {
  const bases = [
    `/home/campaign/${campaign.slug}`,
    ...(campaign.hostnames ?? []).map((hostname) => `/${hostname}`)
  ]
  const pagesUnder = (base: string): string[] => [
    base,
    ...campaign.regions.map((region) => `${base}/${region.slug}`)
  ]
  return bases.flatMap((base) => [
    ...pagesUnder(base),
    ...(campaign.languageTags ?? []).flatMap((tag) =>
      pagesUnder(`${base}/_lang/${tag}`)
    )
  ])
}
