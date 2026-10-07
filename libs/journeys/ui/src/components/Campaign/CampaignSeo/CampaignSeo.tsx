import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import type { CampaignPublic, CampaignRegion } from '../types'

import { campaignSeoProps } from './campaignSeoProps'
import type { CampaignSeoOptions } from './campaignSeoProps'

interface CampaignSeoProps extends CampaignSeoOptions {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  region?: CampaignRegion | null
}

/** `NextSeo` for a public campaign page, props built by `campaignSeoProps`. */
export function CampaignSeo({
  campaign,
  pageKind,
  region = null,
  origin,
  basePath
}: CampaignSeoProps): ReactElement {
  return (
    <NextSeo
      {...campaignSeoProps(campaign, pageKind, region, { origin, basePath })}
    />
  )
}
