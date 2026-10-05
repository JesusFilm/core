import { ApolloLink, DocumentNode, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import { campaignBlockInsertUpdate } from '../campaignBlockCache'
import { CAMPAIGN_IMAGE_BLOCK_CREATE } from '../useCampaignImageBlockCreateMutation'

/** The section typenames "+Add section" offers: the seeded seven, the Image and the Featured Media sections. */
export const CAMPAIGN_SECTION_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignImageBlock',
  'CampaignFeaturedMediaBlock'
] as const

export type CampaignSectionTypename =
  (typeof CAMPAIGN_SECTION_TYPENAMES)[number]

export type CampaignSectionBlock = Extract<
  CampaignBlock,
  { __typename: CampaignSectionTypename }
>

/** The four fields every section create input shares; the body starts empty. */
export interface CampaignSectionCreateInput {
  id: string
  campaignId: string
  pageId: string
  parentOrder: number
}

export const CAMPAIGN_HERO_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignHeroBlockCreate(
    $input: CampaignHeroBlockCreateInput!
    $languageId: ID
  ) {
    campaignHeroBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_REGION_SWITCHER_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignRegionSwitcherBlockCreate(
    $input: CampaignRegionSwitcherBlockCreateInput!
    $languageId: ID
  ) {
    campaignRegionSwitcherBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignVideoCarouselBlockCreate(
    $input: CampaignVideoCarouselBlockCreateInput!
    $languageId: ID
  ) {
    campaignVideoCarouselBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_JOURNEY_LIST_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignJourneyListBlockCreate(
    $input: CampaignJourneyListBlockCreateInput!
    $languageId: ID
  ) {
    campaignJourneyListBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_ANALYTICS_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignAnalyticsBlockCreate(
    $input: CampaignAnalyticsBlockCreateInput!
    $languageId: ID
  ) {
    campaignAnalyticsBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_REGION_HEADER_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignRegionHeaderBlockCreate(
    $input: CampaignRegionHeaderBlockCreateInput!
    $languageId: ID
  ) {
    campaignRegionHeaderBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_REGION_SHARE_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignRegionShareBlockCreate(
    $input: CampaignRegionShareBlockCreateInput!
    $languageId: ID
  ) {
    campaignRegionShareBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_FEATURED_MEDIA_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignFeaturedMediaBlockCreate(
    $input: CampaignFeaturedMediaBlockCreateInput!
    $languageId: ID
  ) {
    campaignFeaturedMediaBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

interface SectionCreateOperation {
  document: DocumentNode
  operation: string
}

/** One create document per section typename, all taking the same `$input` shape. */
export const SECTION_CREATE_OPERATIONS: Record<
  CampaignSectionTypename,
  SectionCreateOperation
> = {
  CampaignHeroBlock: {
    document: CAMPAIGN_HERO_BLOCK_CREATE,
    operation: 'campaignHeroBlockCreate'
  },
  CampaignRegionSwitcherBlock: {
    document: CAMPAIGN_REGION_SWITCHER_BLOCK_CREATE,
    operation: 'campaignRegionSwitcherBlockCreate'
  },
  CampaignVideoCarouselBlock: {
    document: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_CREATE,
    operation: 'campaignVideoCarouselBlockCreate'
  },
  CampaignJourneyListBlock: {
    document: CAMPAIGN_JOURNEY_LIST_BLOCK_CREATE,
    operation: 'campaignJourneyListBlockCreate'
  },
  CampaignAnalyticsBlock: {
    document: CAMPAIGN_ANALYTICS_BLOCK_CREATE,
    operation: 'campaignAnalyticsBlockCreate'
  },
  CampaignRegionHeaderBlock: {
    document: CAMPAIGN_REGION_HEADER_BLOCK_CREATE,
    operation: 'campaignRegionHeaderBlockCreate'
  },
  CampaignRegionShareBlock: {
    document: CAMPAIGN_REGION_SHARE_BLOCK_CREATE,
    operation: 'campaignRegionShareBlockCreate'
  },
  CampaignImageBlock: {
    document: CAMPAIGN_IMAGE_BLOCK_CREATE,
    operation: 'campaignImageBlockCreate'
  },
  CampaignFeaturedMediaBlock: {
    document: CAMPAIGN_FEATURED_MEDIA_BLOCK_CREATE,
    operation: 'campaignFeaturedMediaBlockCreate'
  }
}

type SectionCreateResult = Record<string, CampaignBlock | null | undefined>

export type CampaignSectionCreate = (
  block: CampaignSectionBlock,
  input: CampaignSectionCreateInput
) => Promise<ApolloLink.Result<SectionCreateResult>>

/**
 * Create a section of any seeded typename through its own create mutation,
 * shown optimistically as `block`, and insert it into the campaign's cached
 * block list at its `parentOrder` with the later sections shifted down.
 */
export function useCampaignSectionCreateMutation(
  campaignId: string
): CampaignSectionCreate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) => {
      const { document, operation } =
        SECTION_CREATE_OPERATIONS[block.__typename]
      return await client.mutate<SectionCreateResult>({
        mutation: document,
        variables: { input },
        optimisticResponse: { [operation]: block },
        update(cache, { data }) {
          campaignBlockInsertUpdate(cache, campaignId, data?.[operation])
        }
      })
    },
    [client, campaignId]
  )
}
