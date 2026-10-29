import { ApolloCache, ApolloClient, DocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import { CampaignAnalyticsBlockCreate } from '../../../__generated__/CampaignAnalyticsBlockCreate'
import { CampaignColumnsBlockCreate } from '../../../__generated__/CampaignColumnsBlockCreate'
import { CampaignFeaturedMediaBlockCreate } from '../../../__generated__/CampaignFeaturedMediaBlockCreate'
import { CampaignHeroBlockCreate } from '../../../__generated__/CampaignHeroBlockCreate'
import { CampaignImageBlockCreate } from '../../../__generated__/CampaignImageBlockCreate'
import { CampaignJourneyListBlockCreate } from '../../../__generated__/CampaignJourneyListBlockCreate'
import { CampaignRegionHeaderBlockCreate } from '../../../__generated__/CampaignRegionHeaderBlockCreate'
import { CampaignRegionShareBlockCreate } from '../../../__generated__/CampaignRegionShareBlockCreate'
import { CampaignRegionSwitcherBlockCreate } from '../../../__generated__/CampaignRegionSwitcherBlockCreate'
import { CampaignRichTextBlockCreate } from '../../../__generated__/CampaignRichTextBlockCreate'
import { CampaignVideoCarouselBlockCreate } from '../../../__generated__/CampaignVideoCarouselBlockCreate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  campaignBlockInsertUpdate,
  campaignBlocksAdd
} from '../campaignBlockCache'
import { CAMPAIGN_IMAGE_BLOCK_CREATE } from '../useCampaignImageBlockCreateMutation'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery/campaignFields'

/** The section typenames "+Add section" offers: the seeded seven, the Image and the Featured Media sections. */
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
  'CampaignFeaturedMediaBlock'
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
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignHeroBlockCreate(
    $input: CampaignHeroBlockCreateInput!
    $languageId: ID
  ) {
    campaignHeroBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_REGION_SWITCHER_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRegionSwitcherBlockCreate(
    $input: CampaignRegionSwitcherBlockCreateInput!
    $languageId: ID
  ) {
    campaignRegionSwitcherBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignVideoCarouselBlockCreate(
    $input: CampaignVideoCarouselBlockCreateInput!
    $languageId: ID
  ) {
    campaignVideoCarouselBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_JOURNEY_LIST_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignJourneyListBlockCreate(
    $input: CampaignJourneyListBlockCreateInput!
    $languageId: ID
  ) {
    campaignJourneyListBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_ANALYTICS_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignAnalyticsBlockCreate(
    $input: CampaignAnalyticsBlockCreateInput!
    $languageId: ID
  ) {
    campaignAnalyticsBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_REGION_HEADER_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRegionHeaderBlockCreate(
    $input: CampaignRegionHeaderBlockCreateInput!
    $languageId: ID
  ) {
    campaignRegionHeaderBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_REGION_SHARE_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRegionShareBlockCreate(
    $input: CampaignRegionShareBlockCreateInput!
    $languageId: ID
  ) {
    campaignRegionShareBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_RICH_TEXT_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRichTextBlockCreate(
    $input: CampaignRichTextBlockCreateInput!
    $languageId: ID
  ) {
    campaignRichTextBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_COLUMNS_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignColumnsBlockCreate(
    $input: CampaignColumnsBlockCreateInput!
    $languageId: ID
  ) {
    campaignColumnsBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

export const CAMPAIGN_FEATURED_MEDIA_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignFeaturedMediaBlockCreate(
    $input: CampaignFeaturedMediaBlockCreateInput!
    $languageId: ID
  ) {
    campaignFeaturedMediaBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
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

interface SectionCreateVariables {
  input: CampaignSectionCreateInput
}

export type CampaignSectionCreate = (
  block: CampaignSectionBlock,
  input: CampaignSectionCreateInput,
  /** A Columns section's two slot rows, written to the cache with it. */
  slots?: CampaignBlock[]
) => Promise<ApolloClient.MutateResult<SectionCreateResult>>

type SendCreate = (options: {
  variables: SectionCreateVariables
  optimisticResponse: SectionCreateResult
  update: (
    cache: ApolloCache,
    result: { data?: SectionCreateResult | null }
  ) => void
}) => Promise<ApolloClient.MutateResult<SectionCreateResult>>

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
  const [hero] = useMutation<CampaignHeroBlockCreate, SectionCreateVariables>(
    CAMPAIGN_HERO_BLOCK_CREATE
  )
  const [regionSwitcher] = useMutation<
    CampaignRegionSwitcherBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_REGION_SWITCHER_BLOCK_CREATE)
  const [videoCarousel] = useMutation<
    CampaignVideoCarouselBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_VIDEO_CAROUSEL_BLOCK_CREATE)
  const [journeyList] = useMutation<
    CampaignJourneyListBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_JOURNEY_LIST_BLOCK_CREATE)
  const [analytics] = useMutation<
    CampaignAnalyticsBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_ANALYTICS_BLOCK_CREATE)
  const [regionHeader] = useMutation<
    CampaignRegionHeaderBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_REGION_HEADER_BLOCK_CREATE)
  const [regionShare] = useMutation<
    CampaignRegionShareBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_REGION_SHARE_BLOCK_CREATE)
  const [richText] = useMutation<
    CampaignRichTextBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_RICH_TEXT_BLOCK_CREATE)
  const [columns] = useMutation<
    CampaignColumnsBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_COLUMNS_BLOCK_CREATE)
  const [image] = useMutation<CampaignImageBlockCreate, SectionCreateVariables>(
    CAMPAIGN_IMAGE_BLOCK_CREATE
  )
  const [featuredMedia] = useMutation<
    CampaignFeaturedMediaBlockCreate,
    SectionCreateVariables
  >(CAMPAIGN_FEATURED_MEDIA_BLOCK_CREATE)

  return useCallback(
    async (block, input, slots = []) => {
      const mutations = {
        CampaignHeroBlock: hero,
        CampaignRegionSwitcherBlock: regionSwitcher,
        CampaignVideoCarouselBlock: videoCarousel,
        CampaignJourneyListBlock: journeyList,
        CampaignAnalyticsBlock: analytics,
        CampaignRegionHeaderBlock: regionHeader,
        CampaignRegionShareBlock: regionShare,
        CampaignRichTextBlock: richText,
        CampaignColumnsBlock: columns,
        CampaignImageBlock: image,
        CampaignFeaturedMediaBlock: featuredMedia
      } as const satisfies Record<CampaignSectionTypename, unknown>
      const send = mutations[block.__typename] as unknown as SendCreate
      const { operation } = SECTION_CREATE_OPERATIONS[block.__typename]
      return await send({
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
    [
      hero,
      regionSwitcher,
      videoCarousel,
      journeyList,
      analytics,
      regionHeader,
      regionShare,
      richText,
      columns,
      image,
      featuredMedia,
      campaignId
    ]
  )
}
