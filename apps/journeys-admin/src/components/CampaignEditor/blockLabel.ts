import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'

type Translate = (key: string) => string

/** The breadcrumb name of a block by typename. */
export function blockLabel(
  t: Translate,
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
