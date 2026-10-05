import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

interface CampaignJourneyListProps {
  block: CampaignTreeOf<'CampaignJourneyListBlock'>
}

/**
 * The Journey List shell: its text only. The journey list ticket adds the
 * cards for live-published journeys.
 */
export function CampaignJourneyList({
  block
}: CampaignJourneyListProps): ReactElement {
  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading
        eyebrow={block.eyebrow}
        title={block.title}
        lede={block.lede}
      />
    </CampaignSectionBand>
  )
}
