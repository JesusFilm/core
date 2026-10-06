/**
 * The campaign interfaces and their implementors, so fragments on
 * `CampaignBlock`, `CampaignSectionBlock` and `CampaignAction` match exactly
 * instead of heuristically when the cache reads and writes campaign blocks.
 */
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
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const

export const CAMPAIGN_POSSIBLE_TYPES: Record<string, string[]> = {
  CampaignBlock: [
    ...CAMPAIGN_SECTION_TYPENAMES,
    'CampaignTypographyBlock',
    'CampaignButtonBlock',
    'CampaignColumnBlock'
  ],
  CampaignSectionBlock: [...CAMPAIGN_SECTION_TYPENAMES],
  CampaignAction: [
    'CampaignLinkAction',
    'CampaignScrollToBlockAction',
    'CampaignNavigateToRegionAction'
  ]
}
