import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import Head from 'next/head'
import PlausibleProvider from 'next-plausible'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignPage,
  CampaignSeo,
  createCampaignTheme
} from '@core/journeys/ui/Campaign'
import type { CampaignPublic, CampaignRegion } from '@core/journeys/ui/Campaign'
import { googleFontsHref } from '@core/journeys/ui/fonts/googleFontsHref'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { CampaignLanguageRedirect } from '../CampaignLanguageRedirect'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

interface CampaignPageWrapperProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region?: CampaignRegion | null
  children?: ReactNode
}

/**
 * Everything a public campaign page shares: the campaign theme, the Google
 * Fonts link, SEO and social tags (`CampaignSeo`, canonical in the preferred
 * address form), and Plausible page views on the campaign team's existing site through the same `/plausible` proxy journeys use (page path
 * as rendered; automatic page views, so nothing is reported from the admin
 * canvas, which uses its own components). The page is static, so a visitor
 * whose cookie or browser languages name another campaign language is sent on
 * to it by `CampaignLanguageRedirect`.
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
  return (
    <PlausibleProvider
      enabled
      trackLocalhost
      trackOutboundLinks
      customDomain="/plausible"
      domain={`api-journeys-team-${campaign.teamId}`}
    >
      <Head>
        <link rel="stylesheet" href={googleFontsHref(campaign.theme)} />
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
        <CampaignPage campaign={campaign} pageKind={pageKind} region={region} />
        {children}
      </ThemeProvider>
    </PlausibleProvider>
  )
}
