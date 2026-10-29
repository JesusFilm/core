import type { GetStaticPropsResult } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'

import { matchRegionSlug } from '@core/journeys/ui/Campaign'
import type {
  CampaignPublic,
  CampaignRegion,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'
import {
  campaignBasePath,
  plainPagePath
} from '@core/journeys/ui/Campaign/libs/campaignAddress'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import {
  fetchCampaignPublicInPageLanguage,
  fetchCampaignPublicInPageLanguageByHostname
} from '../getCampaignPublic'
import { getFlags } from '../getFlags'
import { getWorldMap } from '../getWorldMap'
import { logger } from '../logger'

/** The ISR window of every campaign page (PRD §11). */
export const CAMPAIGN_REVALIDATE_SECONDS = 60

/**
 * A not-found regenerates after a second, so it never sticks once the
 * campaign is published.
 */
export const CAMPAIGN_NOT_FOUND_REVALIDATE_SECONDS = 1

export interface CampaignStaticProps {
  flags: { [key: string]: boolean | undefined }
  campaign: CampaignPublic
  region: CampaignRegion | null
  worldMap: WorldMapShapes | null
}

interface CampaignPageRequest {
  /** The route's `[lang]` segment; absent on the campaign-default route. */
  language?: string
  locale?: string
}

interface CampaignRootRequest extends CampaignPageRequest {
  slug: string
  regionSlug?: string
}

interface HostCampaignRequest extends CampaignPageRequest {
  hostname: string
  /** The path segment after the hostname; absent on the domain's `/`. */
  segment?: string
}

async function translationsFor(
  locale: string | undefined
): ReturnType<typeof serverSideTranslations> {
  return await serverSideTranslations(
    locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )
}

/**
 * Whether the page renders an Analytics section, the one consumer of the
 * world map. Pages without one skip the map, which would otherwise ride in
 * `__NEXT_DATA__` as dead weight.
 */
export function hasAnalyticsSection(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind
): boolean {
  return (
    campaign.pages
      .find((page) => page.kind === pageKind)
      ?.blocks.some((block) => block.__typename === 'CampaignAnalyticsBlock') ??
    false
  )
}

async function campaignProps(
  campaign: CampaignPublic,
  region: CampaignRegion | null,
  locale: string | undefined
): Promise<GetStaticPropsResult<CampaignStaticProps>> {
  const pageKind =
    region == null ? CampaignPageKind.landing : CampaignPageKind.regionTemplate
  return {
    props: {
      flags: await getFlags(),
      ...(await translationsFor(locale)),
      campaign,
      region,
      worldMap: hasAnalyticsSection(campaign, pageKind)
        ? await getWorldMap()
        : null
    },
    revalidate: CAMPAIGN_REVALIDATE_SECONDS
  }
}

async function notFound(
  locale: string | undefined
): Promise<GetStaticPropsResult<CampaignStaticProps>> {
  return {
    notFound: true,
    revalidate: CAMPAIGN_NOT_FOUND_REVALIDATE_SECONDS
  }
}

/**
 * A tag the campaign does not offer sends the visitor to the page in the
 * campaign default, which keeps the set of generated pages to the campaign's
 * languages.
 */
function unknownLanguage(
  destination: string
): GetStaticPropsResult<CampaignStaticProps> {
  return {
    redirect: { destination, permanent: false },
    revalidate: CAMPAIGN_REVALIDATE_SECONDS
  }
}

/**
 * Static props of a root-domain campaign page: the landing page, or one
 * region's page. A draft or unknown slug and an unknown region are not found.
 */
export async function getCampaignStaticProps({
  slug,
  regionSlug,
  language,
  locale
}: CampaignRootRequest): Promise<GetStaticPropsResult<CampaignStaticProps>> {
  const result = await fetchCampaignPublicInPageLanguage(
    createApolloClient(),
    slug,
    language
  )
  if (result == null) return await notFound(locale)
  const region =
    regionSlug == null
      ? null
      : (result.campaign.regions.find(
          (candidate) => candidate.slug === regionSlug
        ) ?? null)
  if (regionSlug != null && region == null) return await notFound(locale)
  if (language != null && result.language.source !== 'param')
    return unknownLanguage(
      plainPagePath(
        campaignBasePath({ slug, domainName: null }),
        regionSlug == null ? [] : [regionSlug]
      )
    )
  return await campaignProps(result.campaign, region, locale)
}

/**
 * Static props of a page of a Campaign Domain's campaign, or null when the
 * request is not one: the domain has no published root campaign, or the
 * segment is not one of its regions (a journey slug). The region is matched
 * on the first, default-language read, before the Page Language costs a
 * second, so a journey visit is not charged for the campaign. A failed read
 * is logged and answered as null too, so an unreachable `campaignPublic`
 * costs a custom domain its campaign, not its journeys.
 */
export async function getHostCampaignStaticProps({
  hostname,
  segment,
  language,
  locale
}: HostCampaignRequest): Promise<GetStaticPropsResult<CampaignStaticProps> | null> {
  let result: Awaited<
    ReturnType<typeof fetchCampaignPublicInPageLanguageByHostname>
  >
  try {
    result = await fetchCampaignPublicInPageLanguageByHostname(
      createApolloClient(),
      hostname,
      language,
      segment == null
        ? undefined
        : (inDefault) => matchRegionSlug(segment, inDefault.regions) != null
    )
  } catch (error) {
    logger.error({ err: error, hostname, segment }, 'campaign root read failed')
    return null
  }
  if (result == null) return null
  if (language != null && result.language.source !== 'param')
    return unknownLanguage(plainPagePath('', segment == null ? [] : [segment]))
  const region =
    segment == null ? null : matchRegionSlug(segment, result.campaign.regions)
  return await campaignProps(result.campaign, region, locale)
}
