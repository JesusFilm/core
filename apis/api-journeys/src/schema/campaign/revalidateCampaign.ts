import { queue as revalidateQueue } from '../../workers/revalidate/queue'
import { logger } from '../logger'

/**
 * Every Next.js page path a campaign is served from: the landing page and
 * every region (listed and orphan) in the root-domain form, and — once a
 * Custom Domain names it as Campaign Root — the same pages in the domain
 * form. Paths are the page paths behind the proxy rewrite, which is what
 * `/api/revalidate` needs.
 */
export function campaignPagePaths(campaign: {
  slug: string
  regions: Array<{ slug: string }>
  hostnames?: string[]
}): string[] {
  const rootBase = `/home/campaign/${campaign.slug}`
  const paths = [
    rootBase,
    ...campaign.regions.map((region) => `${rootBase}/${region.slug}`)
  ]
  for (const hostname of campaign.hostnames ?? []) {
    paths.push(
      `/${hostname}`,
      ...campaign.regions.map((region) => `/${hostname}/${region.slug}`)
    )
  }
  return paths
}

/**
 * Queue on-demand revalidation of a campaign's pages: exactly one job per
 * affected path through the revalidate worker's `paths[]` job variant. Only
 * `campaignPublish`, `campaignUnpublish` and a Campaign Root change call this;
 * content mutations rely on the 60 s ISR window and queue nothing. A queue
 * failure is logged, not thrown: the page still refreshes at the next ISR
 * regeneration.
 */
export async function enqueueCampaignRevalidation(
  paths: string[]
): Promise<void> {
  await Promise.all(
    paths.map(
      async (path) =>
        await revalidateQueue
          .add('revalidate', { paths: [path] })
          .catch((error: unknown) => {
            logger.error(
              { error, path },
              'Failed to queue campaign revalidation'
            )
          })
    )
  )
}
