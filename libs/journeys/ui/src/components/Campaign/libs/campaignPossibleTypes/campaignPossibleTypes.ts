import { BAND_TYPENAMES, CAMPAIGN_TYPENAMES } from '../campaignBlockGrammar'

/** Every section and chrome typename, the implementors of `CampaignSectionBlock`: the grammar's bands. */
export const CAMPAIGN_SECTION_TYPENAMES = BAND_TYPENAMES

/**
 * The campaign interfaces and their implementors, so fragments on
 * `CampaignBlock`, `CampaignSectionBlock` and `CampaignAction` match exactly
 * instead of heuristically when an Apollo cache reads and writes campaign
 * blocks. Shared by the viewer and the editor.
 */
export const CAMPAIGN_POSSIBLE_TYPES: Record<string, string[]> = {
  CampaignBlock: [...CAMPAIGN_TYPENAMES],
  CampaignSectionBlock: [...CAMPAIGN_SECTION_TYPENAMES],
  CampaignAction: [
    'CampaignLinkAction',
    'CampaignScrollToBlockAction',
    'CampaignNavigateToRegionAction'
  ]
}
