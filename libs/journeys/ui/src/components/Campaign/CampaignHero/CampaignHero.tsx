import { ReactElement } from 'react'

import { CampaignMediaSplit } from '../CampaignMediaSlot'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignTreeOf } from '../types'

interface CampaignHeroProps {
  block: CampaignTreeOf<'CampaignHeroBlock'>
}

/**
 * The opening section: eyebrow, title and lede aligned by `align`, with its
 * Media Slot (a video or an image) beside the text from `md` up and below it
 * on a phone. A hero with only media renders the media alone.
 */
export function CampaignHero({ block }: CampaignHeroProps): ReactElement {
  const hasHeading =
    hasText(block.eyebrow) || hasText(block.title) || hasText(block.lede)

  return (
    <CampaignSectionBand block={block} align={block.align}>
      <CampaignMediaSplit
        media={block.media}
        text={
          hasHeading ? (
            <CampaignSectionHeading
              eyebrow={block.eyebrow}
              title={block.title}
              lede={block.lede}
              titleVariant="h1"
              align={block.align}
            />
          ) : null
        }
      />
    </CampaignSectionBand>
  )
}
