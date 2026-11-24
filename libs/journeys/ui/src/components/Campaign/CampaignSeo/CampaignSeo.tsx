import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import type { CampaignPublic, CampaignRegion } from '../types'

import { campaignPreferredLocation, campaignSeoProps } from './campaignSeoProps'

interface CampaignSeoProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region?: CampaignRegion | null
  rootDomain: string
}

/**
 * `NextSeo` for a public campaign page, props built by `campaignSeoProps`
 * with the canonical and `hreflang` alternates in the preferred address form.
 */
export function CampaignSeo({
  campaign,
  pageKind,
  region = null,
  rootDomain
}: CampaignSeoProps): ReactElement {
  return (
    <NextSeo
      {...campaignSeoProps(
        campaign,
        pageKind,
        region,
        campaignPreferredLocation({ campaign, rootDomain })
      )}
    />
  )
}
