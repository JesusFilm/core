import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

interface CampaignVideoCarouselProps {
  block: CampaignTreeOf<'CampaignVideoCarouselBlock'>
}

/**
 * The Video Carousel shell: its text only. The media ticket adds the cards
 * (Watch expansion of `videoId`, or the explicit video children).
 */
export function CampaignVideoCarousel({
  block
}: CampaignVideoCarouselProps): ReactElement {
  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading eyebrow={block.eyebrow} title={block.title} />
    </CampaignSectionBand>
  )
}
