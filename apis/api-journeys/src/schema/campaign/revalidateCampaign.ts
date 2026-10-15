import { prisma } from '@core/prisma/journeys/client'

import { queue as revalidateQueue } from '../../workers/revalidate/queue'
import { logger } from '../logger'

import { fetchLanguage } from './gatewayClient'

/**
 * The tags the proxy routes `?lang=` to (`_lang/<tag>`) for a campaign: the
 * bcp47 tag of each of its Page Languages, lowercased as the proxy does. A
 * language that cannot be resolved is logged and left out, so a gateway
 * failure costs that language's on-demand purge, not the mutation.
 */
export async function campaignLanguageTags(
  campaignId: string
): Promise<string[]> {
  try {
    const campaignLanguages = await prisma.campaignLanguage.findMany({
      where: { campaignId }
    })
    const languages = await Promise.all(
      campaignLanguages.map(async ({ languageId }) => {
        try {
          return await fetchLanguage(languageId)
        } catch (error) {
          logger.error(
            { error, campaignId, languageId },
            'Failed to resolve campaign language for revalidation'
          )
          return null
        }
      })
    )
    const tags = languages.flatMap((language) =>
      language?.bcp47 == null ? [] : [language.bcp47.toLowerCase()]
    )
    return [...new Set(tags)]
  } catch (error) {
    logger.error(
      { error, campaignId },
      'Failed to list campaign languages for revalidation'
    )
    return []
  }
}

/**
 * Every Next.js page path a campaign is served from: the landing page and
 * every region (listed and orphan) in the root-domain form, and — once a
 * Custom Domain names it as Campaign Root — the same pages in the domain
 * form. Each of them also has one page per `languageTags` entry, under
 * `_lang/<tag>` ahead of the region, which is where a `?lang=` link lands.
 * Paths are the page paths behind the proxy rewrite, which is what
 * `/api/revalidate` needs.
 */
export function campaignPagePaths(campaign: {
  slug: string
  regions: Array<{ slug: string }>
  hostnames?: string[]
  languageTags?: string[]
}): string[] {
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

/**
 * Queue on-demand revalidation of a campaign's pages: exactly one job per
 * affected path through the revalidate worker's `paths[]` job variant. Only
 * `campaignPublish`, `campaignUnpublish`, `campaignDelete` of a published
 * campaign, a Campaign Root change and a region slug, listing or delete change
 * of a published campaign call this; other
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

/**
 * After a region's slug, listing or deletion changes on a published campaign,
 * revalidate the landing page and the given region paths, including the
 * region's previous path, so the old URL stops resolving and the switchers
 * refresh. A draft campaign serves nothing, so nothing is queued.
 */
export async function enqueueRegionRevalidation(
  campaign: { id: string; slug: string; status: string },
  regionSlugs: string[]
): Promise<void> {
  if (campaign.status !== 'published') return
  await enqueueCampaignRevalidation(
    campaignPagePaths({
      slug: campaign.slug,
      regions: [...new Set(regionSlugs)].map((slug) => ({ slug })),
      languageTags: await campaignLanguageTags(campaign.id)
    })
  )
}
