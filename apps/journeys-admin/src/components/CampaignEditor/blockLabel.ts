import { TFunction } from 'i18next'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'

/** The breadcrumb name of a block by typename. */
export function blockLabel(
  t: TFunction,
  typename: CampaignBlock['__typename']
): string {
  switch (typename) {
    case 'CampaignHeroBlock':
      return t('Hero')
    case 'CampaignRegionSwitcherBlock':
      return t('Region switcher')
    case 'CampaignVideoCarouselBlock':
      return t('Video carousel')
    case 'CampaignJourneyListBlock':
      return t('Journey list')
    case 'CampaignJourneyBlock':
      return t('Journey')
    case 'CampaignAnalyticsBlock':
      return t('Analytics')
    case 'CampaignRegionHeaderBlock':
      return t('Region header')
    case 'CampaignRegionShareBlock':
      return t('Region share')
    case 'CampaignRichTextBlock':
      return t('Rich text')
    case 'CampaignColumnsBlock':
      return t('Columns')
    case 'CampaignColumnBlock':
      return t('Column')
    case 'CampaignImageBlock':
      return t('Image')
    case 'CampaignFeaturedMediaBlock':
      return t('Featured media')
    case 'CampaignVideoBlock':
      return t('Video')
    case 'CampaignHeaderBlock':
      return t('Header')
    case 'CampaignFooterBlock':
      return t('Footer')
    case 'CampaignTypographyBlock':
      return t('Text')
    case 'CampaignButtonBlock':
      return t('Button')
  }
}

/** The name of a region card on the canvas and in the Navigator. */
export function regionCardLabel(t: TFunction): string {
  return t('Region card')
}

/** The name of a Region Line, the text a region card carries. */
export function regionLineLabel(t: TFunction): string {
  return t('Region Line')
}

/** The name of one Share Language row of a Region Share section. */
export function shareLanguageLabel(t: TFunction): string {
  return t('Share language')
}
