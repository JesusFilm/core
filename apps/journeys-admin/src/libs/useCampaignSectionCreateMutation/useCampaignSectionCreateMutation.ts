import { ApolloLink, DocumentNode, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  campaignBlockInsertUpdate,
  campaignBlocksAdd
} from '../campaignBlockCache'

/** Every section typename: what "+Add section" offers. */
export const CAMPAIGN_SECTION_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignRichTextBlock',
  'CampaignColumnsBlock'
] as const

export type CampaignSectionTypename =
  (typeof CAMPAIGN_SECTION_TYPENAMES)[number]

export type CampaignSectionBlock = Extract<
  CampaignBlock,
  { __typename: CampaignSectionTypename }
>

/** The fields every section create input shares; the body starts empty. */
export interface CampaignSectionCreateInput {
  id: string
  campaignId: string
  pageId: string
  parentOrder: number
  /** A Column Slot to create the section in rather than at the page's top level. */
  parentBlockId?: string
  /** Columns sections only: the ids the two slots are created under. */
  slotIds?: string[]
}

export const CAMPAIGN_HERO_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignHeroBlockCreate($input: CampaignHeroBlockCreateInput!) {
    campaignHeroBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_REGION_SWITCHER_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignRegionSwitcherBlockCreate(
    $input: CampaignRegionSwitcherBlockCreateInput!
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
  ) {
    campaignRegionShareBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_RICH_TEXT_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignRichTextBlockCreate(
    $input: CampaignRichTextBlockCreateInput!
  ) {
    campaignRichTextBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_COLUMNS_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignColumnsBlockCreate(
    $input: CampaignColumnsBlockCreateInput!
  ) {
    campaignColumnsBlockCreate(input: $input) {
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
  CampaignRichTextBlock: {
    document: CAMPAIGN_RICH_TEXT_BLOCK_CREATE,
    operation: 'campaignRichTextBlockCreate'
  },
  CampaignColumnsBlock: {
    document: CAMPAIGN_COLUMNS_BLOCK_CREATE,
    operation: 'campaignColumnsBlockCreate'
  }
}

type SectionCreateResult = Record<string, CampaignBlock | null | undefined>

export type CampaignSectionCreate = (
  block: CampaignSectionBlock,
  input: CampaignSectionCreateInput,
  /** A Columns section's two slot rows, written to the cache with it. */
  slots?: CampaignBlock[]
) => Promise<ApolloLink.Result<SectionCreateResult>>

/**
 * Create a section of any typename through its own create mutation, shown
 * optimistically as `block`, and insert it into the campaign's cached block
 * list at its `parentOrder` with the later sections shifted down. A Columns
 * section's slots are created by the API under the ids the input names; the
 * response carries only the section, so the slot rows are written from
 * `slots`.
 */
export function useCampaignSectionCreateMutation(
  campaignId: string
): CampaignSectionCreate {
  const client = useApolloClient()
  return useCallback(
    async (block, input, slots = []) => {
      const { document, operation } =
        SECTION_CREATE_OPERATIONS[block.__typename]
      return await client.mutate<SectionCreateResult>({
        mutation: document,
        variables: { input },
        optimisticResponse: { [operation]: block },
        update(cache, { data }) {
          campaignBlockInsertUpdate(cache, campaignId, data?.[operation])
          if (slots.length === 0) return
          for (const slot of slots)
            cache.writeFragment({
              id: cache.identify({ __typename: slot.__typename, id: slot.id }),
              fragment: CAMPAIGN_PUBLIC_BLOCK_FIELDS,
              fragmentName: 'CampaignPublicBlockFields',
              data: slot
            })
          campaignBlocksAdd(cache, campaignId, slots)
        }
      })
    },
    [client, campaignId]
  )
}
