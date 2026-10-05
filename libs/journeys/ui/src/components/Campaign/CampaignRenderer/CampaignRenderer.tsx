import { ReactElement } from 'react'

import { CampaignAnalytics } from '../CampaignAnalytics'
import { CampaignButton } from '../CampaignButton'
import { CampaignFeaturedMedia } from '../CampaignFeaturedMedia'
import { CampaignHero } from '../CampaignHero'
import { CampaignImage } from '../CampaignImage'
import { CampaignJourneyList } from '../CampaignJourneyList'
import { CampaignRegionHeader } from '../CampaignRegionHeader'
import { CampaignRegionShare } from '../CampaignRegionShare'
import { CampaignRegionSwitcher } from '../CampaignRegionSwitcher'
import { CampaignTypography } from '../CampaignTypography'
import { CampaignVideoCarousel } from '../CampaignVideoCarousel'
import type { CampaignTree } from '../types'

interface CampaignRendererProps {
  block: CampaignTree
}

/**
 * One component per campaign typename behind a single switch. Header and
 * footer are Campaign Chrome, rendered by the page's chrome slots rather
 * than as sections, and a Campaign Video only ever fills a Media Slot
 * (rendered by its section), so they and any unknown typename render
 * nothing.
 */
export function CampaignRenderer({
  block
}: CampaignRendererProps): ReactElement | null {
  switch (block.__typename) {
    case 'CampaignHeroBlock':
      return <CampaignHero block={block} />
    case 'CampaignRegionSwitcherBlock':
      return <CampaignRegionSwitcher block={block} />
    case 'CampaignVideoCarouselBlock':
      return <CampaignVideoCarousel block={block} />
    case 'CampaignFeaturedMediaBlock':
      return <CampaignFeaturedMedia block={block} />
    case 'CampaignJourneyListBlock':
      return <CampaignJourneyList block={block} />
    case 'CampaignAnalyticsBlock':
      return <CampaignAnalytics block={block} />
    case 'CampaignRegionHeaderBlock':
      return <CampaignRegionHeader block={block} />
    case 'CampaignRegionShareBlock':
      return <CampaignRegionShare block={block} />
    case 'CampaignImageBlock':
      return <CampaignImage block={block} />
    case 'CampaignTypographyBlock':
      return <CampaignTypography block={block} />
    case 'CampaignButtonBlock':
      return <CampaignButton block={block} />
    default:
      return null
  }
}
