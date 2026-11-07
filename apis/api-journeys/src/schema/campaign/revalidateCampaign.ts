import type { JobsOptions } from 'bullmq'

import { pageLanguageTag } from '@core/journeys/ui/Campaign/libs/campaignAddress'
import { campaignPagePaths } from '@core/journeys/ui/Campaign/libs/campaignPagePaths'
import { CampaignStatus, Prisma } from '@core/prisma/journeys/client'

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
async function resolveLanguageTag(languageId: string): Promise<string | null> {
  try {
    const language = await fetchLanguage(languageId)
    return pageLanguageTag(language?.bcp47)
  } catch (error) {
    logger.error(
      { error, languageId },
      'Failed to resolve campaign language for revalidation'
    )
    return null
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
 * path through the revalidate worker's `paths[]` job variant, retried with
 * backoff. Only `queuePageSetChange` calls this, when a Campaign's page set
 * changes: publish, unpublish, delete, a slug change, a Campaign Domain add
 * or remove, a Page Language add or remove, and a region slug, listing or
 * delete change. It deliberately over-purges in two places: a slug change
 * also purges the unchanged domain form, and a region delete purges every
 * page, not only the landing page and the deleted path.
 *
 * Everything else waits for the 60 s ISR window and queues nothing, adding,
 * reordering and renaming a region included: the Region Switcher may show
 * the old regions to visitors for up to 60 s, unlike listing a region, which
 * purges every page at once. That asymmetry is intended (decided 2026-10-29):
 * the author sees any change at once through "Refresh and open page", which
 * refreshes every page of a published Campaign. A queue failure is logged,
 * not thrown: the page still refreshes at the next ISR regeneration.
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

/**
 * What a Campaign's page set is a function of (GLOSSARY.md: Campaign page
 * set): its status, slug, each region's slug and listing, its Campaign
 * Domain names and its Page Languages by id. Region order and names,
 * countries and the title are left out, so changing them queues nothing.
 */
export interface CampaignAddressSnapshot {
  status: CampaignStatus
  slug: string
  regions: Array<{ slug: string; listed: boolean }>
  domainNames: string[]
  languageIds: string[]
}

/** What `snapshotCampaignAddress` reads off the Campaign row. */
export const CAMPAIGN_ADDRESS_SELECT = {
  status: true,
  slug: true,
  regions: { select: { slug: true, listed: true } },
  customDomains: { select: { name: true } },
  languages: { select: { languageId: true } }
} satisfies Prisma.CampaignSelect

/**
 * The address state of `campaignId` as `tx` reads it now, or `null` when the
 * Campaign does not exist. A plain read that takes no lock: locking the
 * Campaign row here would invert the Campaign Write's lock order, so a
 * concurrent address edit may leave one page stale until its ISR window.
 */
export async function snapshotCampaignAddress(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<CampaignAddressSnapshot | null> {
  const campaign = await tx.campaign.findUnique({
    where: { id: campaignId },
    select: CAMPAIGN_ADDRESS_SELECT
  })
  if (campaign == null) return null
  return {
    status: campaign.status,
    slug: campaign.slug,
    regions: campaign.regions.map(({ slug, listed }) => ({ slug, listed })),
    domainNames: campaign.customDomains.map(({ name }) => name),
    languageIds: campaign.languages.map(({ languageId }) => languageId)
  }
}

/**
 * Every page path a Campaign is served from in `snapshot`
 * (`campaignPagePaths`: every region, listed and orphan, in the root-domain
 * form and under each Campaign Domain), under the tag of each Page Language
 * `tagsByLanguageId` resolves. A deleted (`null`) or draft Campaign serves no
 * page, so its set is empty.
 */
export function campaignPageSet(
  snapshot: CampaignAddressSnapshot | null,
  tagsByLanguageId: ReadonlyMap<string, string>
): string[] {
  if (snapshot == null || snapshot.status !== 'published') return []
  const languageTags = snapshot.languageIds.flatMap((languageId) => {
    const tag = tagsByLanguageId.get(languageId)
    return tag == null ? [] : [tag]
  })
  return campaignPagePaths({
    slug: snapshot.slug,
    regions: snapshot.regions,
    hostnames: snapshot.domainNames,
    languageTags: [...new Set(languageTags)]
  })
}

/** The snapshot with its sets sorted, so two equal address states compare equal. */
function addressKey(snapshot: CampaignAddressSnapshot | null): string {
  if (snapshot == null) return 'null'
  return JSON.stringify([
    snapshot.status,
    snapshot.slug,
    snapshot.regions.map(({ slug, listed }) => `${slug}:${listed}`).sort(),
    [...snapshot.domainNames].sort(),
    [...new Set(snapshot.languageIds)].sort()
  ])
}

/**
 * After a write commits, queue every page of `before` and of `after`, each
 * path once, when the address state changed: the old pages stop resolving
 * and the new ones start. Equal snapshots (regions by slug and listing in any
 * order, languages as a set) queue nothing. Page Language tags resolve here,
 * once per language and outside any transaction; a language that cannot be
 * resolved is logged and its pages left out.
 */
export async function queuePageSetChange(
  before: CampaignAddressSnapshot | null,
  after: CampaignAddressSnapshot | null
): Promise<void> {
  if (addressKey(before) === addressKey(after)) return
  const serving = [before, after].filter(
    (snapshot) => snapshot?.status === 'published'
  )
  if (serving.length === 0) return
  const languageIds = [
    ...new Set(serving.flatMap((snapshot) => snapshot?.languageIds ?? []))
  ]
  const tags = await Promise.all(
    languageIds.map(
      async (languageId) =>
        [languageId, await resolveLanguageTag(languageId)] as const
    )
  )
  const tagsByLanguageId = new Map<string, string>()
  for (const [languageId, tag] of tags)
    if (tag != null) tagsByLanguageId.set(languageId, tag)
  await enqueueCampaignRevalidation([
    ...new Set([
      ...campaignPageSet(before, tagsByLanguageId),
      ...campaignPageSet(after, tagsByLanguageId)
    ])
  ])
}
