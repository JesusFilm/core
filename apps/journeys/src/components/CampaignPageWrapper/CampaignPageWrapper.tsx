import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import Head from 'next/head'
import PlausibleProvider from 'next-plausible'
import { NextSeo } from 'next-seo'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignPage,
  CampaignSeo,
  campaignBasePath,
  campaignFontsHref,
  createCampaignTheme
} from '@core/journeys/ui/Campaign'
import type { CampaignPublic, CampaignRegion } from '@core/journeys/ui/Campaign'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { CampaignPageKind } from '../../../__generated__/globalTypes'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

interface CampaignPageWrapperProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region?: CampaignRegion | null
  children?: ReactNode
}

/**
 * Everything a public campaign page shares: the campaign theme, the Google
 * Fonts link, SEO and social tags (`CampaignSeo`, canonical to the
 * root-domain path until a Campaign Root is attached), and Plausible page views on the campaign team's
 * existing site through the same `/plausible` proxy journeys use (page path
 * as rendered; automatic page views, so nothing is reported from the admin
 * canvas, which uses its own components).
 */
export function CampaignPageWrapper({
  campaign,
  pageKind,
  region = null,
  children
}: CampaignPageWrapperProps): ReactElement {
  const rtl = getLocaleRTL(campaign.language.bcp47 ?? '')
  const theme = useMemo(
    () => createCampaignTheme(campaign.theme, rtl),
    [campaign.theme, rtl]
  )
  const basePath = campaignBasePath(campaign.slug)

  return (
    <PlausibleProvider
      enabled
      trackLocalhost
      trackOutboundLinks
      customDomain="/plausible"
      domain={`api-journeys-team-${campaign.teamId}`}
    >
      <Head>
        <link rel="stylesheet" href={campaignFontsHref(campaign.theme)} />
      </Head>
      <CampaignSeo
        campaign={campaign}
        pageKind={pageKind}
        region={region}
        origin={`https://${ROOT_DOMAIN}`}
        basePath={basePath}
      />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CampaignPage
          campaign={campaign}
          pageKind={pageKind}
          region={region}
          basePath={basePath}
        />
        {children}
      </ThemeProvider>
    </PlausibleProvider>
  )
}
