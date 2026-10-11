import { ApolloLink, DocumentNode, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  CampaignBackgroundKind,
  CampaignBackgroundOverlay
} from '../../../__generated__/globalTypes'
import { CAMPAIGN_SECTION_TYPENAMES } from '../apolloClient/campaignPossibleTypes'

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

/** The nine shared section fields as the update inputs take them. */
export type CampaignSectionStyleInput = Partial<
  Record<SectionOverrideField, string | null>
> & {
  backgroundKind?: CampaignBackgroundKind
  backgroundColor?: string | null
  coverBlockId?: string | null
  backgroundOverlay?: CampaignBackgroundOverlay | null
}

export type CampaignSectionStyleField = keyof CampaignSectionStyleInput

export const CAMPAIGN_SECTION_STYLE_FIELDS = gql`
  fragment CampaignSectionStyleFields on CampaignSectionBlock {
    id
    backgroundKind
    backgroundColor
    coverBlockId
    backgroundOverlay
    headingColor
    textColor
    buttonColor
    buttonTextColor
    accentColor
  }
`

/**
 * One document per styled typename, each writing the shared section fields
 * through that typename's update mutation with the same `$input` shape.
 */
export const CAMPAIGN_HERO_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignHeroBlockUpdateStyle(
    $id: ID!
    $input: CampaignHeroBlockUpdateInput!
  ) {
    campaignHeroBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignRegionSwitcherBlockUpdateStyle(
    $id: ID!
    $input: CampaignRegionSwitcherBlockUpdateInput!
  ) {
    campaignRegionSwitcherBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignVideoCarouselBlockUpdateStyle(
    $id: ID!
    $input: CampaignVideoCarouselBlockUpdateInput!
  ) {
    campaignVideoCarouselBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignJourneyListBlockUpdateStyle(
    $id: ID!
    $input: CampaignJourneyListBlockUpdateInput!
  ) {
    campaignJourneyListBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_ANALYTICS_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignAnalyticsBlockUpdateStyle(
    $id: ID!
    $input: CampaignAnalyticsBlockUpdateInput!
  ) {
    campaignAnalyticsBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignRegionHeaderBlockUpdateStyle(
    $id: ID!
    $input: CampaignRegionHeaderBlockUpdateInput!
  ) {
    campaignRegionHeaderBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_REGION_SHARE_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignRegionShareBlockUpdateStyle(
    $id: ID!
    $input: CampaignRegionShareBlockUpdateInput!
  ) {
    campaignRegionShareBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_HEADER_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignHeaderBlockUpdateStyle(
    $id: ID!
    $input: CampaignHeaderBlockUpdateInput!
  ) {
    campaignHeaderBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

export const CAMPAIGN_FOOTER_BLOCK_UPDATE_STYLE = gql`
  ${CAMPAIGN_SECTION_STYLE_FIELDS}
  mutation CampaignFooterBlockUpdateStyle(
    $id: ID!
    $input: CampaignFooterBlockUpdateInput!
  ) {
    campaignFooterBlockUpdate(id: $id, input: $input) {
      ...CampaignSectionStyleFields
    }
  }
`

interface StyleOperation {
  document: DocumentNode
  operation: string
}

export const SECTION_STYLE_OPERATIONS: Record<
  CampaignStyledTypename,
  StyleOperation
> = {
  CampaignHeroBlock: {
    document: CAMPAIGN_HERO_BLOCK_UPDATE_STYLE,
    operation: 'campaignHeroBlockUpdate'
  },
  CampaignRegionSwitcherBlock: {
    document: CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_STYLE,
    operation: 'campaignRegionSwitcherBlockUpdate'
  },
  CampaignVideoCarouselBlock: {
    document: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_STYLE,
    operation: 'campaignVideoCarouselBlockUpdate'
  },
  CampaignJourneyListBlock: {
    document: CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_STYLE,
    operation: 'campaignJourneyListBlockUpdate'
  },
  CampaignAnalyticsBlock: {
    document: CAMPAIGN_ANALYTICS_BLOCK_UPDATE_STYLE,
    operation: 'campaignAnalyticsBlockUpdate'
  },
  CampaignRegionHeaderBlock: {
    document: CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_STYLE,
    operation: 'campaignRegionHeaderBlockUpdate'
  },
  CampaignRegionShareBlock: {
    document: CAMPAIGN_REGION_SHARE_BLOCK_UPDATE_STYLE,
    operation: 'campaignRegionShareBlockUpdate'
  },
  CampaignHeaderBlock: {
    document: CAMPAIGN_HEADER_BLOCK_UPDATE_STYLE,
    operation: 'campaignHeaderBlockUpdate'
  },
  CampaignFooterBlock: {
    document: CAMPAIGN_FOOTER_BLOCK_UPDATE_STYLE,
    operation: 'campaignFooterBlockUpdate'
  }
}

/** The row a style mutation returns: the block's nine shared fields as they stand with `input` applied. */
export type CampaignSectionStyleRow = { __typename: CampaignStyledTypename } & {
  id: string
} & Required<CampaignSectionStyleInput>

export function campaignSectionStyleRow(
  block: CampaignStyledBlock,
  input: CampaignSectionStyleInput
): CampaignSectionStyleRow {
  return {
    __typename: block.__typename,
    id: block.id,
    backgroundKind: block.backgroundKind,
    backgroundColor: block.backgroundColor,
    coverBlockId: block.coverBlockId,
    backgroundOverlay: block.backgroundOverlay,
    headingColor: block.headingColor,
    textColor: block.textColor,
    buttonColor: block.buttonColor,
    buttonTextColor: block.buttonTextColor,
    accentColor: block.accentColor,
    ...input
  }
}

type SectionStyleResult = Record<string, CampaignSectionStyleRow>

export type CampaignSectionStyleMutate = (
  block: CampaignStyledBlock,
  input: CampaignSectionStyleInput
) => Promise<ApolloLink.Result<SectionStyleResult>>

/**
 * Write any of the nine shared section fields of a section or chrome block
 * through its own typename's update mutation, shown optimistically as the
 * block with the input applied.
 */
export function useCampaignSectionStyleMutation(): CampaignSectionStyleMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) => {
      const { document, operation } = SECTION_STYLE_OPERATIONS[block.__typename]
      return await client.mutate<SectionStyleResult>({
        mutation: document,
        variables: { id: block.id, input },
        optimisticResponse: {
          [operation]: campaignSectionStyleRow(block, input)
        }
      })
    },
    [client]
  )
}
