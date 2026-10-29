import type { JobsOptions } from 'bullmq'

import { pageLanguageTag } from '@core/journeys/ui/Campaign/libs/campaignAddress'
import { campaignPagePaths } from '@core/journeys/ui/Campaign/libs/campaignPagePaths'
import { prisma } from '@core/prisma/journeys/client'

import { queue as revalidateQueue } from '../../workers/revalidate/queue'
import { logger } from '../logger'

import { fetchLanguage } from './gatewayClient'

/**
 * The tag the proxy routes `?lang=` to for one language
 * (`pageLanguageTag`): its bcp47 tag, lowercased, or `null` when the tag is
 * not one the proxy routes. A language that cannot be resolved is logged and
 * `null`, so a gateway failure costs that language's on-demand purge, not the
 * mutation.
 */
async function resolveLanguageTag(
  campaignId: string,
  languageId: string
): Promise<string | null> {
  try {
    const language = await fetchLanguage(languageId)
    return pageLanguageTag(language?.bcp47)
  } catch (error) {
    logger.error(
      { error, campaignId, languageId },
      'Failed to resolve campaign language for revalidation'
    )
    return null
  }
}

/**
 * The tags the proxy routes `?lang=` to (`_lang/<tag>`) for a campaign: the
 * bcp47 tag of each of its Page Languages, lowercased as the proxy does. A
 * language that cannot be resolved, or whose tag the proxy never routes to a
 * page of its own, is left out.
 */
export async function campaignLanguageTags(
  campaignId: string
): Promise<string[]> {
  try {
    const campaignLanguages = await prisma.campaignLanguage.findMany({
      where: { campaignId }
    })
    const tags = await Promise.all(
      campaignLanguages.map(
        async ({ languageId }) =>
          await resolveLanguageTag(campaignId, languageId)
      )
    )
    return [...new Set(tags.filter((tag) => tag != null))]
  } catch (error) {
    logger.error(
      { error, campaignId },
      'Failed to list campaign languages for revalidation'
    )
    return []
  }
}

/**
 * Each campaign job is one path, so a retry repeats only the page that
 * failed: the worker throws on a non-2xx or a fetch error.
 */
export const CAMPAIGN_REVALIDATE_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
}

/**
 * Queue on-demand revalidation of a campaign's pages: exactly one job per
 * affected path through the revalidate worker's `paths[]` job variant,
 * retried with backoff. Only `campaignPublish`, `campaignUnpublish`,
 * `campaignDelete` of a published campaign, and — on a published campaign —
 * a Campaign Domain create or delete, a campaign slug change, a Page Language
 * add or remove, and a region slug, listing or delete change call this; other
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
          .add('revalidate', { paths: [path] }, CAMPAIGN_REVALIDATE_JOB_OPTIONS)
          .catch((error: unknown) => {
            logger.error(
              { error, path },
              'Failed to queue campaign revalidation'
            )
          })
    )
  )
}

/** What listing a campaign's pages reads off it. */
interface CampaignPages {
  id: string
  slug: string
  regions: Array<{ slug: string }>
  customDomains: Array<{ name: string }>
}

interface PublishedCampaignPages extends CampaignPages {
  status: string
}

/**
 * Every page path of a campaign as it stands: `campaignPagePaths` in the
 * root-domain form and the form of its Campaign Domain, under the tag of each
 * of its Page Languages, or of `languageTags` when the caller has already
 * resolved them.
 */
export async function listCampaignPagePaths(
  campaign: CampaignPages,
  languageTags?: string[]
): Promise<string[]> {
  return campaignPagePaths({
    slug: campaign.slug,
    regions: campaign.regions,
    hostnames: campaign.customDomains.map(({ name }) => name),
    languageTags: languageTags ?? (await campaignLanguageTags(campaign.id))
  })
}

/**
 * Queue on-demand revalidation of every page of a campaign
 * (`listCampaignPagePaths`).
 */
export async function enqueueCampaignPagesRevalidation(
  campaign: CampaignPages
): Promise<void> {
  await enqueueCampaignRevalidation(await listCampaignPagePaths(campaign))
}

/**
 * After a Campaign Domain is added to or removed from a campaign, revalidate
 * every page of each given campaign in the root-domain form and in the domain
 * form under `hostname`: one form stops resolving and the other starts. A
 * draft campaign serves nothing, so nothing is queued for it.
 */
export async function enqueueCampaignDomainRevalidation(
  campaigns: Array<Omit<PublishedCampaignPages, 'customDomains'>>,
  hostname: string
): Promise<void> {
  const paths = await Promise.all(
    campaigns
      .filter((campaign) => campaign.status === 'published')
      .map(
        async (campaign) =>
          await listCampaignPagePaths({
            ...campaign,
            customDomains: [{ name: hostname }]
          })
      )
  )
  await enqueueCampaignRevalidation(paths.flat())
}

/**
 * After a Page Language is added to or removed from a published campaign,
 * revalidate every page in both forms with the tags before and after the
 * change: the campaign's languages now plus the changed one. A removed tag's
 * `_lang` pages then regenerate into the language fallback, and the plain
 * pages stop offering it. A draft campaign serves nothing, so nothing is
 * queued.
 */
export async function enqueueLanguageRevalidation(
  campaign: PublishedCampaignPages,
  languageId: string
): Promise<void> {
  if (campaign.status !== 'published') return
  // One gateway round-trip for both: the changed language and the campaign's.
  const [languageTags, changedTag] = await Promise.all([
    campaignLanguageTags(campaign.id),
    resolveLanguageTag(campaign.id, languageId)
  ])
  await enqueueCampaignRevalidation(
    await listCampaignPagePaths(
      campaign,
      changedTag == null
        ? languageTags
        : [...new Set([...languageTags, changedTag])]
    )
  )
}

/**
 * After a published campaign's slug changes, revalidate its pages under the
 * old and the new slug, so the old address stops resolving at once rather
 * than at its ISR window. The domain form does not carry the slug and is left
 * alone.
 */
export async function enqueueCampaignSlugRevalidation(
  campaign: Omit<PublishedCampaignPages, 'customDomains'>,
  previousSlug: string
): Promise<void> {
  if (campaign.status !== 'published' || campaign.slug === previousSlug) return
  const languageTags = await campaignLanguageTags(campaign.id)
  await enqueueCampaignRevalidation(
    [previousSlug, campaign.slug].flatMap((slug) =>
      campaignPagePaths({ slug, regions: campaign.regions, languageTags })
    )
  )
}

/**
 * After a region's slug, listing or deletion changes on a published campaign,
 * revalidate the landing page and the given region paths, including the
 * region's previous path, so the old URL stops resolving and the switchers
 * refresh. A Campaign Domain gets the same paths in its domain form. A draft
 * campaign serves nothing, so nothing is queued.
 */
export async function enqueueRegionRevalidation(
  campaign: Omit<PublishedCampaignPages, 'regions'>,
  regionSlugs: string[]
): Promise<void> {
  if (campaign.status !== 'published') return
  await enqueueCampaignPagesRevalidation({
    ...campaign,
    regions: [...new Set(regionSlugs)].map((slug) => ({ slug }))
  })
}
