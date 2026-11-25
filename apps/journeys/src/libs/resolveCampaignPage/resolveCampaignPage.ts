import { campaignPagePath } from '@core/journeys/ui/Campaign/libs/campaignAddress'
import type { CampaignAddressInput } from '@core/journeys/ui/Campaign/libs/campaignAddress'
import { matchRegionSlug } from '@core/journeys/ui/Campaign/libs/matchRegionSlug'
import { resolvePageLanguage } from '@core/journeys/ui/Campaign/libs/resolvePageLanguage'
import type { ResolvedPageLanguage } from '@core/journeys/ui/Campaign/libs/resolvePageLanguage'
import type {
  CampaignPublic,
  CampaignRegion
} from '@core/journeys/ui/Campaign/types'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { logger } from '../logger'

/**
 * Whose campaign a request asks for: a root-domain Campaign Address names
 * the campaign's slug, a custom domain its hostname.
 */
export type CampaignTarget = { slug: string } | { hostname: string }

export interface CampaignPageRequest {
  target: CampaignTarget
  /** The path segment after the campaign prefix: a region slug, or on a custom domain maybe a journey slug. */
  segment?: string
  /** The route's `[lang]` segment, the tag the proxy rewrote `?lang=` to; absent on the plain page. */
  language?: string
}

/**
 * Reads a published campaign in one language (absent: the campaign
 * default). Null for a draft, an unknown campaign or a host with no
 * campaign; any other failure, a timeout included, is thrown.
 */
export type CampaignReader = (
  target: CampaignTarget,
  languageId?: string | null
) => Promise<CampaignPublic | null>

/** A Campaign Page to render: the landing page, or one region's page. */
export interface CampaignPageResult {
  kind: 'page'
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region: CampaignRegion | null
}

/**
 * A tag that is not one of the campaign's languages: the browser is sent
 * to the plain page at `destination`, its query kept.
 */
export interface LanguageFallbackResult {
  kind: 'languageFallback'
  destination: string
  campaignId: string
}

/** What `CampaignRoute` renders. */
export type CampaignRouteResult = CampaignPageResult | LanguageFallbackResult

/**
 * Campaign Page resolution: a page, a language fallback, not found, or (on
 * a custom domain only) not a campaign, where the domain's journeys take
 * over.
 */
export type CampaignPageResolution =
  | CampaignRouteResult
  | { kind: 'notFound' }
  | { kind: 'notACampaign' }

const NOT_FOUND = { kind: 'notFound' } as const
const NOT_A_CAMPAIGN = { kind: 'notACampaign' } as const

/**
 * The language api-media reads a Watch video's title in when a query sends no
 * `languageId`. A read made without one is only right for Watch text when the
 * Page Language is this one.
 */
const WATCH_TEXT_FALLBACK_LANGUAGE_ID = '529'

interface ResolvedRead {
  campaign: CampaignPublic
  region: CampaignRegion | null
  language: ResolvedPageLanguage
}

/**
 * The region `segment` names on one read, null for the landing page, or
 * undefined when the segment is no region of it (a journey slug, a region
 * since deleted).
 */
function regionOn(
  campaign: CampaignPublic,
  segment: string | undefined
): CampaignRegion | null | undefined {
  if (segment == null) return null
  return matchRegionSlug(segment, campaign.regions) ?? undefined
}

/**
 * The campaign in the Page Language `language` names, and the region on the
 * read it renders. One read in the campaign default yields the languages the
 * tag is resolved against; a segment that names no region there ends the
 * request before a second read. The second read, in the Page Language, is
 * skipped only when the first already used it for both the campaign text
 * and the Watch video titles.
 */
async function readPage(
  { target, segment, language }: CampaignPageRequest,
  read: CampaignReader
): Promise<ResolvedRead | null> {
  const inDefault = await read(target)
  if (inDefault == null) return null
  const regionInDefault = regionOn(inDefault, segment)
  if (regionInDefault === undefined) return null
  const resolved = resolvePageLanguage({
    languages: inDefault.languages.map((candidate) => ({
      languageId: candidate.languageId,
      bcp47: candidate.language.bcp47
    })),
    defaultLanguageId: inDefault.defaultLanguageId,
    param: language
  })
  if (
    resolved.languageId === inDefault.languageId &&
    resolved.languageId === WATCH_TEXT_FALLBACK_LANGUAGE_ID
  )
    return { campaign: inDefault, region: regionInDefault, language: resolved }
  const campaign = await read(target, resolved.languageId)
  if (campaign == null) return null
  const region = regionOn(campaign, segment)
  if (region === undefined) return null
  return { campaign, region, language: resolved }
}

function addressOf(
  target: CampaignTarget,
  campaign: CampaignPublic
): CampaignAddressInput {
  if ('hostname' in target)
    return { slug: campaign.slug, domainName: target.hostname }
  return { slug: target.slug, domainName: null }
}

/**
 * Which Campaign Page a request is. On a custom domain anything that is not
 * a campaign page (no published campaign, a segment that names no region
 * on the read it would render, a failed or timed-out read, which is logged)
 * is `notACampaign`, so the domain's journeys take over. On the root domain
 * an unknown or draft campaign and an unknown region are `notFound`, and a
 * failed read is rethrown so ISR keeps the last good page.
 */
export async function resolveCampaignPage(
  request: CampaignPageRequest,
  read: CampaignReader
): Promise<CampaignPageResolution> {
  const { target, segment, language } = request
  const onHost = 'hostname' in target
  let resolved: ResolvedRead | null
  try {
    resolved = await readPage(request, read)
  } catch (error) {
    if (!onHost) throw error
    logger.error(
      { err: error, hostname: target.hostname, segment },
      'campaign root read failed'
    )
    return NOT_A_CAMPAIGN
  }
  if (resolved == null) return onHost ? NOT_A_CAMPAIGN : NOT_FOUND

  const { campaign, region } = resolved
  if (language != null && resolved.language.source !== 'param')
    return {
      kind: 'languageFallback',
      destination: campaignPagePath(
        addressOf(target, campaign),
        region?.slug ?? null
      ),
      campaignId: campaign.id
    }
  return {
    kind: 'page',
    campaign,
    pageKind:
      region == null
        ? CampaignPageKind.landing
        : CampaignPageKind.regionTemplate,
    region
  }
}
