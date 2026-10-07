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
  createCampaignTheme,
  hasText
} from '@core/journeys/ui/Campaign'
import type { CampaignPublic, CampaignRegion } from '@core/journeys/ui/Campaign'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { CampaignPageKind } from '../../../__generated__/globalTypes'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

interface CampaignPageWrapperProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region?: CampaignRegion | null
  /**
   * Where region links point: the root-domain `/campaign/<slug>` path by
   * default, `''` on a Campaign Root domain where regions sit at `/<slug>`.
   */
  basePath?: string
  children?: ReactNode
}

function heroDescription(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind
): string | undefined {
  const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
  const hero = page?.blocks.find(
    (block) => block.__typename === 'CampaignHeroBlock'
  )
  if (hero == null || hero.__typename !== 'CampaignHeroBlock') return undefined
  if (hasText(hero.lede)) return hero.lede
  if (hasText(hero.title)) return hero.title
  return undefined
}

/**
 * Everything a public campaign page shares: the campaign theme, the Google
 * Fonts link, SEO tags, and Plausible page views on the campaign team's
 * existing site through the same `/plausible` proxy journeys use (page path
 * as rendered; automatic page views, so nothing is reported from the admin
 * canvas, which uses its own components).
 */
export function CampaignPageWrapper({
  campaign,
  pageKind,
  region = null,
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
      domain={`api-journeys-team-${campaign.teamId}`}
    >
      <Head>
        <link rel="stylesheet" href={campaignFontsHref(campaign.theme)} />
      </Head>
      <CampaignSeo
        campaign={campaign}
        region={region}
        description={heroDescription(campaign, pageKind)}
        rootDomain={ROOT_DOMAIN}
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
