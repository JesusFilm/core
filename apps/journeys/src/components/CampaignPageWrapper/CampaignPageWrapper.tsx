import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import Head from 'next/head'
import PlausibleProvider from 'next-plausible'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignPage,
  CampaignSeo,
  campaignBasePath,
  campaignFontsHref,
  createCampaignTheme
} from '@core/journeys/ui/Campaign'
import type {
  CampaignPublic,
  CampaignRegion,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'
import {
  campaignPlausibleProps,
  campaignSiteId
} from '@core/journeys/ui/campaignPlausible'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { CampaignLanguageRedirect } from '../CampaignLanguageRedirect'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

interface CampaignPageWrapperProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region?: CampaignRegion | null
  worldMap?: WorldMapShapes | null
  /**
   * Where region links point: the root-domain `/campaign/<slug>` path by
   * default, `''` on a Campaign Domain where regions sit at `/<slug>`.
   */
  basePath?: string
  children?: ReactNode
}

/**
 * Everything a public campaign page shares: the campaign theme, the Google
 * Fonts link, SEO and social tags (`CampaignSeo`, canonical in the preferred
 * address form), and Plausible page views on the Campaign's own site (the one
 * its Campaign Report shows) and its team's site, through the same
 * `/plausible` proxy journeys use. Page views are automatic (page path as
 * rendered) and tagged with `campaign_id`, the Region Page's `region` slug and
 * the Page Language's `language` tag; the campaign events (`campaign*`) carry
 * the same props. Nothing is reported from the admin canvas, which renders no
 * `CampaignPage`. The page is static, so a visitor whose cookie or browser
 * languages name another campaign language is sent on to it by
 * `CampaignLanguageRedirect`.
 */
export function CampaignPageWrapper({
  campaign,
  pageKind,
  region = null,
  worldMap = null,
  basePath = campaignBasePath(campaign.slug),
  children
}: CampaignPageWrapperProps): ReactElement {
  const rtl = getLocaleRTL(campaign.language.bcp47 ?? '')
  const theme = useMemo(
    () => createCampaignTheme(campaign.theme, rtl),
    [campaign.theme, rtl]
  )
  return (
    <PlausibleProvider
      enabled
      trackLocalhost
      trackOutboundLinks
      customDomain="/plausible"
      domain={`${campaignSiteId(campaign.id)},api-journeys-team-${campaign.teamId}`}
      pageviewProps={campaignPlausibleProps(campaign, region)}
    >
      <Head>
        <link rel="stylesheet" href={campaignFontsHref(campaign.theme)} />
      </Head>
      <CampaignLanguageRedirect campaign={campaign} />
      <CampaignSeo
        campaign={campaign}
        pageKind={pageKind}
        region={region}
        rootDomain={ROOT_DOMAIN}
      />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CampaignPage
          campaign={campaign}
          pageKind={pageKind}
          region={region}
          basePath={basePath}
          worldMap={worldMap}
        />
        {children}
      </ThemeProvider>
    </PlausibleProvider>
  )
}
