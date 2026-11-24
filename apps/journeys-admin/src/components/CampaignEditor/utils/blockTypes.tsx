import { TFunction } from 'i18next'
import { ReactElement } from 'react'

import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'
import Cursor6Icon from '@core/shared/ui/icons/Cursor6'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Header1Icon from '@core/shared/ui/icons/Header1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import JourneyIcon from '@core/shared/ui/icons/Journey'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Layout1Icon from '@core/shared/ui/icons/Layout1'
import Layout2Icon from '@core/shared/ui/icons/Layout2'
import LayoutTopIcon from '@core/shared/ui/icons/LayoutTop'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import ShareIcon from '@core/shared/ui/icons/Share'
import Type1Icon from '@core/shared/ui/icons/Type1'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

interface BlockTypeEntry {
  /** The breadcrumb name of the type. */
  label: (t: TFunction) => string
  /** The element-type icon of the type. */
  icon: ReactElement
}

/**
 * Every block type's name and icon. A carousel is a strip of frames, rich
 * text a block of lines, a button a box with a cursor on it, Featured media
 * a camera.
 */
export const BLOCK_TYPES: Record<CampaignBlock['__typename'], BlockTypeEntry> =
  {
    CampaignHeroBlock: { label: (t) => t('Hero'), icon: <LayoutTopIcon /> },
    CampaignRegionSwitcherBlock: {
      label: (t) => t('Region switcher'),
      icon: <Globe1Icon />
    },
    CampaignVideoCarouselBlock: {
      label: (t) => t('Video carousel'),
      icon: <MediaStrip1Icon />
    },
    CampaignJourneyListBlock: {
      label: (t) => t('Journey list'),
      icon: <JourneysIcon />
    },
    CampaignJourneyBlock: { label: (t) => t('Journey'), icon: <JourneyIcon /> },
    CampaignAnalyticsBlock: {
      label: (t) => t('Analytics'),
      icon: <BarChartSquare3Icon />
    },
    CampaignRegionHeaderBlock: {
      label: (t) => t('Region header'),
      icon: <Header1Icon />
    },
    CampaignRegionShareBlock: {
      label: (t) => t('Region share'),
      icon: <ShareIcon />
    },
    CampaignRichTextBlock: {
      label: (t) => t('Rich text'),
      icon: <AlignLeftIcon />
    },
    CampaignColumnsBlock: { label: (t) => t('Columns'), icon: <Layout2Icon /> },
    CampaignColumnBlock: { label: (t) => t('Column'), icon: <Layout1Icon /> },
    CampaignImageBlock: { label: (t) => t('Image'), icon: <Image3Icon /> },
    CampaignFeaturedMediaBlock: {
      label: (t) => t('Featured media'),
      icon: <VideoOnIcon />
    },
    CampaignVideoBlock: { label: (t) => t('Video'), icon: <VideoOnIcon /> },
    CampaignHeaderBlock: { label: (t) => t('Header'), icon: <Header1Icon /> },
    CampaignFooterBlock: {
      label: (t) => t('Footer'),
      icon: <FlexAlignBottom1Icon />
    },
    CampaignTypographyBlock: { label: (t) => t('Text'), icon: <Type1Icon /> },
    CampaignButtonBlock: { label: (t) => t('Button'), icon: <Cursor6Icon /> }
  }
