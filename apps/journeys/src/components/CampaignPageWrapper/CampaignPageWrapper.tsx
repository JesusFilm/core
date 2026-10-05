import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import Head from 'next/head'
import PlausibleProvider from 'next-plausible'
import { NextSeo } from 'next-seo'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignPage,
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
  children
}: CampaignPageWrapperProps): ReactElement {
  const rtl = getLocaleRTL(campaign.language.bcp47 ?? '')
  const theme = useMemo(
    () => createCampaignTheme(campaign.theme, rtl),
    [campaign.theme, rtl]
  )
  const basePath = campaignBasePath(campaign.slug)
  const canonicalPath = region == null ? basePath : `${basePath}/${region.slug}`
  const title =
    region == null ? campaign.title : `${region.name} · ${campaign.title}`

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
      <NextSeo
        title={title}
        description={heroDescription(campaign, pageKind)}
        canonical={`https://${ROOT_DOMAIN}${canonicalPath}`}
        openGraph={{
          type: 'website',
          title,
          description: heroDescription(campaign, pageKind),
          url: `https://${ROOT_DOMAIN}${canonicalPath}`,
          site_name: campaign.title
        }}
        twitter={{ site: '@YourNextStepIs', cardType: 'summary_large_image' }}
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
