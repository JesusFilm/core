import { CAMPAIGN_SECTION_TYPENAMES } from '@core/journeys/ui/Campaign/libs/campaignPossibleTypes'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock as CampaignFeaturedMediaBlock,
  GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock
} from '../../../__generated__/GetCampaign'

/** Every typename that carries the nine shared section fields: the sections and the chrome. */
export type CampaignStyledTypename = (typeof CAMPAIGN_SECTION_TYPENAMES)[number]

export type CampaignStyledBlock = Extract<
  CampaignBlock,
  { __typename: CampaignStyledTypename }
>

export function isCampaignStyledBlock(
  block: CampaignBlock
): block is CampaignStyledBlock {
  return (CAMPAIGN_SECTION_TYPENAMES as readonly string[]).includes(
    block.__typename
  )
}

/** The five colour overrides; null inherits from the band. */
export const SECTION_OVERRIDE_FIELDS = [
  'headingColor',
  'textColor',
  'buttonColor',
  'buttonTextColor',
  'accentColor'
] as const
export type SectionOverrideField = (typeof SECTION_OVERRIDE_FIELDS)[number]

/** The two sections with a Media Slot. */
export type CampaignMediaOwner = CampaignHeroBlock | CampaignFeaturedMediaBlock

export const CAMPAIGN_MEDIA_OWNER_TYPENAMES: ReadonlyArray<
  CampaignMediaOwner['__typename']
> = ['CampaignHeroBlock', 'CampaignFeaturedMediaBlock']

export function isCampaignMediaOwner(block: {
  __typename: string
}): block is CampaignMediaOwner {
  return (CAMPAIGN_MEDIA_OWNER_TYPENAMES as readonly string[]).includes(
    block.__typename
  )
}
