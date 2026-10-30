import { ReactElement } from 'react'

import { CampaignMediaSplit } from '../CampaignMediaSlot'
import { useOptionalCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignTreeOf } from '../types'

interface CampaignHeroProps {
  block: CampaignTreeOf<'CampaignHeroBlock'>
}

/**
 * The opening section: eyebrow, title and description aligned by `align`, with its
 * Media Slot (a video or an image) beside the text from `md` up and below it
 * on a phone, loaded eagerly as the page's largest paint. A hero with only
 * media renders the media alone. `minHeight` stretches the band to that
 * share of the viewport with the body centred.
 * Its title is the page's `h1` when the page names this Hero as its heading
 * (`pageHeadingBlockId`) or names none at all (outside `CampaignPage`), and
 * an `h2` with the same look otherwise.
 */
export function CampaignHero({ block }: CampaignHeroProps): ReactElement {
  const pageHeadingBlockId = useOptionalCampaign()?.pageHeadingBlockId
  const titleComponent =
    pageHeadingBlockId === undefined || pageHeadingBlockId === block.id
      ? 'h1'
      : 'h2'
  const hasHeading =
    hasText(block.eyebrow) || hasText(block.title) || hasText(block.description)

  return (
    <CampaignSectionBand
      block={block}
      align={block.align}
      minHeight={block.minHeight}
    >
      <CampaignMediaSplit
        media={block.media}
        eager
        text={
          hasHeading ? (
            <CampaignSectionHeading
              eyebrow={block.eyebrow}
              title={block.title}
              description={block.description}
              titleVariant="h1"
              titleComponent={titleComponent}
              align={block.align}
            />
          ) : null
        }
      />
    </CampaignSectionBand>
  )
}
