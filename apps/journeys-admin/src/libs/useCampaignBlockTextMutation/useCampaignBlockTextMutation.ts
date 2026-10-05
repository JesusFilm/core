import { ApolloLink, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CampaignAnalyticsBlockUpdateText } from '../../../__generated__/CampaignAnalyticsBlockUpdateText'
import { CampaignButtonBlockUpdateLabel } from '../../../__generated__/CampaignButtonBlockUpdateLabel'
import { CampaignFeaturedMediaBlockUpdateText } from '../../../__generated__/CampaignFeaturedMediaBlockUpdateText'
import { CampaignHeroBlockUpdateText } from '../../../__generated__/CampaignHeroBlockUpdateText'
import { CampaignJourneyListBlockUpdateText } from '../../../__generated__/CampaignJourneyListBlockUpdateText'
import { CampaignRegionHeaderBlockUpdateText } from '../../../__generated__/CampaignRegionHeaderBlockUpdateText'
import { CampaignRegionShareBlockUpdateText } from '../../../__generated__/CampaignRegionShareBlockUpdateText'
import { CampaignRegionSwitcherBlockUpdateText } from '../../../__generated__/CampaignRegionSwitcherBlockUpdateText'
import { CampaignTypographyBlockUpdateContent } from '../../../__generated__/CampaignTypographyBlockUpdateContent'
import { CampaignVideoCarouselBlockUpdateText } from '../../../__generated__/CampaignVideoCarouselBlockUpdateText'

import {
  CAMPAIGN_TEXT_FIELDS,
  CampaignTextBlock,
  CampaignTextField,
  CampaignTextTypename
} from './campaignTextFields'

/**
 * One document per typename, each writing one text field of the block in
 * the default language through that typename's update mutation, with the
 * same `$input` shape so the hook can address them uniformly.
 */
export const CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
  mutation CampaignTypographyBlockUpdateContent(
    $id: ID!
    $input: CampaignTypographyBlockUpdateInput!
  ) {
    campaignTypographyBlockUpdate(id: $id, input: $input) {
      id
      content
    }
  }
`

export const CAMPAIGN_BUTTON_BLOCK_UPDATE_LABEL = gql`
  mutation CampaignButtonBlockUpdateLabel(
    $id: ID!
    $input: CampaignButtonBlockUpdateInput!
  ) {
    campaignButtonBlockUpdate(id: $id, input: $input) {
      id
      label
    }
  }
`

export const CAMPAIGN_HERO_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignHeroBlockUpdateText(
    $id: ID!
    $input: CampaignHeroBlockUpdateInput!
  ) {
    campaignHeroBlockUpdate(id: $id, input: $input) {
      id
      eyebrow
      title
      lede
    }
  }
`

export const CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignRegionSwitcherBlockUpdateText(
    $id: ID!
    $input: CampaignRegionSwitcherBlockUpdateInput!
  ) {
    campaignRegionSwitcherBlockUpdate(id: $id, input: $input) {
      id
      title
    }
  }
`

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignVideoCarouselBlockUpdateText(
    $id: ID!
    $input: CampaignVideoCarouselBlockUpdateInput!
  ) {
    campaignVideoCarouselBlockUpdate(id: $id, input: $input) {
      id
      eyebrow
      title
    }
  }
`

export const CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignJourneyListBlockUpdateText(
    $id: ID!
    $input: CampaignJourneyListBlockUpdateInput!
  ) {
    campaignJourneyListBlockUpdate(id: $id, input: $input) {
      id
      eyebrow
      title
      lede
    }
  }
`

export const CAMPAIGN_ANALYTICS_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignAnalyticsBlockUpdateText(
    $id: ID!
    $input: CampaignAnalyticsBlockUpdateInput!
  ) {
    campaignAnalyticsBlockUpdate(id: $id, input: $input) {
      id
      eyebrow
      title
    }
  }
`

export const CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignRegionHeaderBlockUpdateText(
    $id: ID!
    $input: CampaignRegionHeaderBlockUpdateInput!
  ) {
    campaignRegionHeaderBlockUpdate(id: $id, input: $input) {
      id
      intro
    }
  }
`

export const CAMPAIGN_REGION_SHARE_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignRegionShareBlockUpdateText(
    $id: ID!
    $input: CampaignRegionShareBlockUpdateInput!
  ) {
    campaignRegionShareBlockUpdate(id: $id, input: $input) {
      id
      title
      intro
    }
  }
`

export const CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE_TEXT = gql`
  mutation CampaignFeaturedMediaBlockUpdateText(
    $id: ID!
    $input: CampaignFeaturedMediaBlockUpdateInput!
  ) {
    campaignFeaturedMediaBlockUpdate(id: $id, input: $input) {
      id
      eyebrow
      title
      lede
      bullets
    }
  }
`

interface TextOperation {
  document: ReturnType<typeof gql>
  operation: string
}

const TEXT_OPERATIONS: Record<CampaignTextTypename, TextOperation> = {
  CampaignTypographyBlock: {
    document: CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
    operation: 'campaignTypographyBlockUpdate'
  },
  CampaignButtonBlock: {
    document: CAMPAIGN_BUTTON_BLOCK_UPDATE_LABEL,
    operation: 'campaignButtonBlockUpdate'
  },
  CampaignHeroBlock: {
    document: CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
    operation: 'campaignHeroBlockUpdate'
  },
  CampaignRegionSwitcherBlock: {
    document: CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_TEXT,
    operation: 'campaignRegionSwitcherBlockUpdate'
  },
  CampaignVideoCarouselBlock: {
    document: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_TEXT,
    operation: 'campaignVideoCarouselBlockUpdate'
  },
  CampaignJourneyListBlock: {
    document: CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_TEXT,
    operation: 'campaignJourneyListBlockUpdate'
  },
  CampaignAnalyticsBlock: {
    document: CAMPAIGN_ANALYTICS_BLOCK_UPDATE_TEXT,
    operation: 'campaignAnalyticsBlockUpdate'
  },
  CampaignRegionHeaderBlock: {
    document: CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_TEXT,
    operation: 'campaignRegionHeaderBlockUpdate'
  },
  CampaignRegionShareBlock: {
    document: CAMPAIGN_REGION_SHARE_BLOCK_UPDATE_TEXT,
    operation: 'campaignRegionShareBlockUpdate'
  },
  CampaignFeaturedMediaBlock: {
    document: CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE_TEXT,
    operation: 'campaignFeaturedMediaBlockUpdate'
  }
}

type CampaignTextResult =
  | CampaignTypographyBlockUpdateContent
  | CampaignButtonBlockUpdateLabel
  | CampaignHeroBlockUpdateText
  | CampaignRegionSwitcherBlockUpdateText
  | CampaignVideoCarouselBlockUpdateText
  | CampaignJourneyListBlockUpdateText
  | CampaignAnalyticsBlockUpdateText
  | CampaignRegionHeaderBlockUpdateText
  | CampaignRegionShareBlockUpdateText
  | CampaignFeaturedMediaBlockUpdateText

interface CampaignTextVariables {
  id: string
  input: Partial<Record<CampaignTextField, string>>
}

export type CampaignTextMutate = (
  block: CampaignTextBlock,
  field: CampaignTextField,
  value: string,
  context?: Record<string, unknown>
) => Promise<ApolloLink.Result<CampaignTextResult>>

/**
 * Build the optimistic result the block's text mutation returns: the block's
 * current text fields with `field` replaced, so the canvas shows the edit at
 * once and a failed save rolls it back.
 */
export function campaignTextOptimisticResponse(
  block: CampaignTextBlock,
  field: CampaignTextField,
  value: string
): Record<string, unknown> {
  const current: Record<string, unknown> = {
    __typename: block.__typename,
    id: block.id
  }
  const fields: readonly CampaignTextField[] =
    CAMPAIGN_TEXT_FIELDS[block.__typename]
  for (const candidate of fields)
    current[candidate] = (block as unknown as Record<string, unknown>)[
      candidate
    ]
  current[field] = value
  return { [TEXT_OPERATIONS[block.__typename].operation]: current }
}

/**
 * Write one default-language text field of any text-bearing campaign block
 * through its own update mutation, optimistically. The caller supplies the
 * Apollo context (`debounceKey`, `debounceTimeout`) that groups keystrokes.
 */
export function useCampaignBlockTextMutation(): CampaignTextMutate {
  const typography = useMutation<
    CampaignTypographyBlockUpdateContent,
    CampaignTextVariables
  >(CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_CONTENT)[0]
  const button = useMutation<
    CampaignButtonBlockUpdateLabel,
    CampaignTextVariables
  >(CAMPAIGN_BUTTON_BLOCK_UPDATE_LABEL)[0]
  const hero = useMutation<CampaignHeroBlockUpdateText, CampaignTextVariables>(
    CAMPAIGN_HERO_BLOCK_UPDATE_TEXT
  )[0]
  const regionSwitcher = useMutation<
    CampaignRegionSwitcherBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_TEXT)[0]
  const videoCarousel = useMutation<
    CampaignVideoCarouselBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_TEXT)[0]
  const journeyList = useMutation<
    CampaignJourneyListBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_TEXT)[0]
  const analytics = useMutation<
    CampaignAnalyticsBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_ANALYTICS_BLOCK_UPDATE_TEXT)[0]
  const regionHeader = useMutation<
    CampaignRegionHeaderBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_TEXT)[0]
  const regionShare = useMutation<
    CampaignRegionShareBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_REGION_SHARE_BLOCK_UPDATE_TEXT)[0]
  const featuredMedia = useMutation<
    CampaignFeaturedMediaBlockUpdateText,
    CampaignTextVariables
  >(CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE_TEXT)[0]

  const mutations = {
    CampaignTypographyBlock: typography,
    CampaignButtonBlock: button,
    CampaignHeroBlock: hero,
    CampaignRegionSwitcherBlock: regionSwitcher,
    CampaignVideoCarouselBlock: videoCarousel,
    CampaignJourneyListBlock: journeyList,
    CampaignAnalyticsBlock: analytics,
    CampaignRegionHeaderBlock: regionHeader,
    CampaignRegionShareBlock: regionShare,
    CampaignFeaturedMediaBlock: featuredMedia
  } as const

  return async function mutate(block, field, value, context = {}) {
    const run = mutations[block.__typename] as unknown as (options: {
      variables: CampaignTextVariables
      optimisticResponse: Record<string, unknown>
      context: Record<string, unknown>
    }) => Promise<ApolloLink.Result<CampaignTextResult>>
    return await run({
      variables: { id: block.id, input: { [field]: value } },
      optimisticResponse: campaignTextOptimisticResponse(block, field, value),
      context
    })
  }
}
