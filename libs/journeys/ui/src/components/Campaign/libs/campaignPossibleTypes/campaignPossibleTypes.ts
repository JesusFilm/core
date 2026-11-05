import { CAMPAIGN_NON_SECTION_TYPENAMES } from '../../types'
import type { CampaignSectionTypename } from '../../types'

/** Every section and chrome typename, the implementors of `CampaignSectionBlock`. */
export const CAMPAIGN_SECTION_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignRichTextBlock',
  'CampaignColumnsBlock',
  'CampaignImageBlock',
  'CampaignFeaturedMediaBlock',
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const satisfies readonly CampaignSectionTypename[]

/**
 * The campaign interfaces and their implementors, so fragments on
 * `CampaignBlock`, `CampaignSectionBlock` and `CampaignAction` match exactly
 * instead of heuristically when an Apollo cache reads and writes campaign
 * blocks. Shared by the viewer and the editor.
 */
export const CAMPAIGN_POSSIBLE_TYPES: Record<string, string[]> = {
  CampaignBlock: [
    ...CAMPAIGN_SECTION_TYPENAMES,
    ...CAMPAIGN_NON_SECTION_TYPENAMES
  ],
  CampaignSectionBlock: [...CAMPAIGN_SECTION_TYPENAMES],
  CampaignAction: [
    'CampaignLinkAction',
    'CampaignScrollToBlockAction',
    'CampaignNavigateToRegionAction'
  ]
}
