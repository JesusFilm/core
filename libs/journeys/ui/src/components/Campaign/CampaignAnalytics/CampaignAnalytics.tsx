import { ReactElement } from 'react'

import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

import { CampaignAnalyticsPanel } from './CampaignAnalyticsPanel'

interface CampaignAnalyticsProps {
  block: CampaignTreeOf<'CampaignAnalyticsBlock'>
}

/**
 * The Analytics section always renders: eyebrow and title, then the panel,
 * which fetches `campaignStats` client-side after render so the stats cache
 * stays independent of the page payload. A Region Page is fixed to its region;
 * the landing page has region tabs. The world map shows only when the block's
 * `showMap` is on.
 */
export function CampaignAnalytics({
  block
}: CampaignAnalyticsProps): ReactElement {
  const { campaign, region, worldMap } = useCampaign()
  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading eyebrow={block.eyebrow} title={block.title} />
      <CampaignAnalyticsPanel
        campaignId={campaign.id}
        regions={campaign.regions}
        fixedRegion={region}
        strings={campaign.strings}
        showMap={block.showMap}
        worldMap={worldMap}
        accentColor={campaign.theme.accentColor}
      />
    </CampaignSectionBand>
  )
}
