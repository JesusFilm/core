import { ReactElement } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'
import CursorPointerIcon from '@core/shared/ui/icons/CursorPointer'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Header1Icon from '@core/shared/ui/icons/Header1'
import Home3Icon from '@core/shared/ui/icons/Home3'
import Image3Icon from '@core/shared/ui/icons/Image3'
import JourneyIcon from '@core/shared/ui/icons/Journey'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Layout1Icon from '@core/shared/ui/icons/Layout1'
import Layout2Icon from '@core/shared/ui/icons/Layout2'
import LayoutTopIcon from '@core/shared/ui/icons/LayoutTop'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import Note2Icon from '@core/shared/ui/icons/Note2'
import ShareIcon from '@core/shared/ui/icons/Share'
import Type1Icon from '@core/shared/ui/icons/Type1'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

/** The element-type icon of a block by typename; the campaign (nothing selected) has its own. */
export function blockIcon(
  typename: CampaignBlock['__typename'] | undefined
): ReactElement {
  switch (typename) {
    case 'CampaignHeroBlock':
      return <LayoutTopIcon />
    case 'CampaignRegionSwitcherBlock':
      return <Globe1Icon />
    case 'CampaignVideoCarouselBlock':
    case 'CampaignVideoBlock':
      return <VideoOnIcon />
    case 'CampaignJourneyListBlock':
      return <JourneysIcon />
    case 'CampaignJourneyBlock':
      return <JourneyIcon />
    case 'CampaignAnalyticsBlock':
      return <BarChartSquare3Icon />
    case 'CampaignRegionHeaderBlock':
    case 'CampaignHeaderBlock':
      return <Header1Icon />
    case 'CampaignRegionShareBlock':
      return <ShareIcon />
    case 'CampaignRichTextBlock':
      return <Note2Icon />
    case 'CampaignColumnsBlock':
      return <Layout2Icon />
    case 'CampaignColumnBlock':
      return <Layout1Icon />
    case 'CampaignImageBlock':
      return <Image3Icon />
    case 'CampaignFeaturedMediaBlock':
      return <MediaStrip1Icon />
    case 'CampaignFooterBlock':
      return <FlexAlignBottom1Icon />
    case 'CampaignTypographyBlock':
      return <Type1Icon />
    case 'CampaignButtonBlock':
      return <CursorPointerIcon />
    default:
      return <Home3Icon />
  }
}
