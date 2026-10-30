import { ReactElement } from 'react'

import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

import { CampaignAnalyticsPanel } from './CampaignAnalyticsPanel'
import { useWorldMap } from './WorldMap/useWorldMap'

/** The viewer's own atlas, same-origin on the public page and cached for a week. */
const ATLAS_URL = '/countries-110m.json'

interface CampaignAnalyticsProps {
  block: CampaignTreeOf<'CampaignAnalyticsBlock'>
}

/**
 * The Analytics section always renders: eyebrow and title, then the panel,
 * which fetches `campaignStats` client-side after render so the stats cache
 * stays independent of the page payload. A Region Page is fixed to its region;
 * the landing page has region tabs. The world map shows only when the block's
 * `showMap` is on, shaded in the section's Accent override or the theme accent;
 * it is fetched in the browser, so it never rides in the page props.
 */
export function CampaignAnalytics({
  block
}: CampaignAnalyticsProps): ReactElement {
  const { campaign, region } = useCampaign()
  const worldMap = useWorldMap(block.showMap, ATLAS_URL)
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
        // The section's Accent override recolours the map; else the theme accent.
        accentColor={block.accentColor ?? campaign.theme.accentColor}
      />
    </CampaignSectionBand>
  )
}
