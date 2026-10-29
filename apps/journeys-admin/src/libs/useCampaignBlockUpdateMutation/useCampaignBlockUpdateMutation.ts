import { ApolloCache, ApolloLink, DefaultContext, gql } from '@apollo/client'
import { useApolloClient, useMutation } from '@apollo/client/react'
import lowerFirst from 'lodash/lowerFirst'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignAnalyticsBlockUpdate,
  CampaignAnalyticsBlockUpdateVariables
} from '../../../__generated__/CampaignAnalyticsBlockUpdate'
import {
  CampaignButtonBlockUpdate,
  CampaignButtonBlockUpdateVariables
} from '../../../__generated__/CampaignButtonBlockUpdate'
import {
  CampaignColumnsBlockUpdate,
  CampaignColumnsBlockUpdateVariables
} from '../../../__generated__/CampaignColumnsBlockUpdate'
import {
  CampaignFeaturedMediaBlockUpdate,
  CampaignFeaturedMediaBlockUpdateVariables
} from '../../../__generated__/CampaignFeaturedMediaBlockUpdate'
import {
  CampaignFooterBlockUpdate,
  CampaignFooterBlockUpdateVariables
} from '../../../__generated__/CampaignFooterBlockUpdate'
import {
  CampaignHeaderBlockUpdate,
  CampaignHeaderBlockUpdateVariables
} from '../../../__generated__/CampaignHeaderBlockUpdate'
import {
  CampaignHeroBlockUpdate,
  CampaignHeroBlockUpdateVariables
} from '../../../__generated__/CampaignHeroBlockUpdate'
import {
  CampaignImageBlockUpdate,
  CampaignImageBlockUpdateVariables
} from '../../../__generated__/CampaignImageBlockUpdate'
import {
  CampaignJourneyBlockUpdate,
  CampaignJourneyBlockUpdateVariables
} from '../../../__generated__/CampaignJourneyBlockUpdate'
import {
  CampaignJourneyListBlockUpdate,
  CampaignJourneyListBlockUpdateVariables
} from '../../../__generated__/CampaignJourneyListBlockUpdate'
import {
  CampaignRegionHeaderBlockUpdate,
  CampaignRegionHeaderBlockUpdateVariables
} from '../../../__generated__/CampaignRegionHeaderBlockUpdate'
import {
  CampaignRegionShareBlockUpdate,
  CampaignRegionShareBlockUpdateVariables
} from '../../../__generated__/CampaignRegionShareBlockUpdate'
import {
  CampaignRegionSwitcherBlockUpdate,
  CampaignRegionSwitcherBlockUpdateVariables
} from '../../../__generated__/CampaignRegionSwitcherBlockUpdate'
import {
  CampaignRichTextBlockUpdate,
  CampaignRichTextBlockUpdateVariables
} from '../../../__generated__/CampaignRichTextBlockUpdate'
import {
  CampaignTypographyBlockUpdate,
  CampaignTypographyBlockUpdateVariables
} from '../../../__generated__/CampaignTypographyBlockUpdate'
import {
  CampaignVideoBlockUpdate,
  CampaignVideoBlockUpdateVariables
} from '../../../__generated__/CampaignVideoBlockUpdate'
import {
  CampaignVideoCarouselBlockUpdate,
  CampaignVideoCarouselBlockUpdateVariables
} from '../../../__generated__/CampaignVideoCarouselBlockUpdate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  CampaignAnalyticsBlockUpdateInput,
  CampaignButtonBlockUpdateInput,
  CampaignColumnsBlockUpdateInput,
  CampaignFeaturedMediaBlockUpdateInput,
  CampaignFooterBlockUpdateInput,
  CampaignHeaderBlockUpdateInput,
  CampaignHeroBlockUpdateInput,
  CampaignImageBlockUpdateInput,
  CampaignJourneyBlockUpdateInput,
  CampaignJourneyListBlockUpdateInput,
  CampaignRegionHeaderBlockUpdateInput,
  CampaignRegionShareBlockUpdateInput,
  CampaignRegionSwitcherBlockUpdateInput,
  CampaignRichTextBlockUpdateInput,
  CampaignTypographyBlockUpdateInput,
  CampaignVideoBlockUpdateInput,
  CampaignVideoCarouselBlockUpdateInput
} from '../../../__generated__/globalTypes'
import {
  CAMPAIGN_TEXT_FIELDS,
  CampaignTextField,
  campaignTextInputKey
} from '../useCampaignBlockTextMutation'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery'

/**
 * One document per typename with an update mutation, each returning the
 * whole block as `GetCampaign` caches it, so every result is a full row.
 */
export const CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignTypographyBlockUpdate(
    $id: ID!
    $input: CampaignTypographyBlockUpdateInput!
    $languageId: ID
  ) {
    campaignTypographyBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_BUTTON_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignButtonBlockUpdate(
    $id: ID!
    $input: CampaignButtonBlockUpdateInput!
    $languageId: ID
  ) {
    campaignButtonBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_HERO_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignHeroBlockUpdate(
    $id: ID!
    $input: CampaignHeroBlockUpdateInput!
    $languageId: ID
  ) {
    campaignHeroBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRegionSwitcherBlockUpdate(
    $id: ID!
    $input: CampaignRegionSwitcherBlockUpdateInput!
    $languageId: ID
  ) {
    campaignRegionSwitcherBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignVideoCarouselBlockUpdate(
    $id: ID!
    $input: CampaignVideoCarouselBlockUpdateInput!
    $languageId: ID
  ) {
    campaignVideoCarouselBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignJourneyListBlockUpdate(
    $id: ID!
    $input: CampaignJourneyListBlockUpdateInput!
    $languageId: ID
  ) {
    campaignJourneyListBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_JOURNEY_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignJourneyBlockUpdate(
    $id: ID!
    $input: CampaignJourneyBlockUpdateInput!
    $languageId: ID
  ) {
    campaignJourneyBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_ANALYTICS_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignAnalyticsBlockUpdate(
    $id: ID!
    $input: CampaignAnalyticsBlockUpdateInput!
    $languageId: ID
  ) {
    campaignAnalyticsBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_REGION_HEADER_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRegionHeaderBlockUpdate(
    $id: ID!
    $input: CampaignRegionHeaderBlockUpdateInput!
    $languageId: ID
  ) {
    campaignRegionHeaderBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_REGION_SHARE_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRegionShareBlockUpdate(
    $id: ID!
    $input: CampaignRegionShareBlockUpdateInput!
    $languageId: ID
  ) {
    campaignRegionShareBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_RICH_TEXT_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignRichTextBlockUpdate(
    $id: ID!
    $input: CampaignRichTextBlockUpdateInput!
    $languageId: ID
  ) {
    campaignRichTextBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_COLUMNS_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignColumnsBlockUpdate(
    $id: ID!
    $input: CampaignColumnsBlockUpdateInput!
    $languageId: ID
  ) {
    campaignColumnsBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_IMAGE_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignImageBlockUpdate(
    $id: ID!
    $input: CampaignImageBlockUpdateInput!
    $languageId: ID
  ) {
    campaignImageBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_VIDEO_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignVideoBlockUpdate(
    $id: ID!
    $input: CampaignVideoBlockUpdateInput!
    $languageId: ID
  ) {
    campaignVideoBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignFeaturedMediaBlockUpdate(
    $id: ID!
    $input: CampaignFeaturedMediaBlockUpdateInput!
    $languageId: ID
  ) {
    campaignFeaturedMediaBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_HEADER_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignHeaderBlockUpdate(
    $id: ID!
    $input: CampaignHeaderBlockUpdateInput!
    $languageId: ID
  ) {
    campaignHeaderBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export const CAMPAIGN_FOOTER_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignFooterBlockUpdate(
    $id: ID!
    $input: CampaignFooterBlockUpdateInput!
    $languageId: ID
  ) {
    campaignFooterBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

/** The update input each typename's mutation takes. */
interface CampaignBlockUpdateInputs {
  CampaignTypographyBlock: CampaignTypographyBlockUpdateInput
  CampaignButtonBlock: CampaignButtonBlockUpdateInput
  CampaignHeroBlock: CampaignHeroBlockUpdateInput
  CampaignRegionSwitcherBlock: CampaignRegionSwitcherBlockUpdateInput
  CampaignVideoCarouselBlock: CampaignVideoCarouselBlockUpdateInput
  CampaignJourneyListBlock: CampaignJourneyListBlockUpdateInput
  CampaignJourneyBlock: CampaignJourneyBlockUpdateInput
  CampaignAnalyticsBlock: CampaignAnalyticsBlockUpdateInput
  CampaignRegionHeaderBlock: CampaignRegionHeaderBlockUpdateInput
  CampaignRegionShareBlock: CampaignRegionShareBlockUpdateInput
  CampaignRichTextBlock: CampaignRichTextBlockUpdateInput
  CampaignColumnsBlock: CampaignColumnsBlockUpdateInput
  CampaignImageBlock: CampaignImageBlockUpdateInput
  CampaignVideoBlock: CampaignVideoBlockUpdateInput
  CampaignFeaturedMediaBlock: CampaignFeaturedMediaBlockUpdateInput
  CampaignHeaderBlock: CampaignHeaderBlockUpdateInput
  CampaignFooterBlock: CampaignFooterBlockUpdateInput
}

/** Every Campaign Block typename with an update mutation: all but the Column. */
export type CampaignUpdateTypename = keyof CampaignBlockUpdateInputs

/** A cached block of one of those typenames. */
export type CampaignUpdatableBlock<
  T extends CampaignUpdateTypename = CampaignUpdateTypename
> = Extract<CampaignBlock, { __typename: T }>

/** What `update` needs to address a block. */
export interface CampaignUpdatableBlockRef<
  T extends CampaignUpdateTypename = CampaignUpdateTypename
> {
  __typename: T
  id: string
}

/** Some of the fields a typename's update mutation takes. */
export type CampaignBlockUpdateInput<
  T extends CampaignUpdateTypename = CampaignUpdateTypename
> = Partial<CampaignBlockUpdateInputs[T]>

export const CAMPAIGN_BLOCK_UPDATE_DOCUMENTS = {
  CampaignTypographyBlock: CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE,
  CampaignButtonBlock: CAMPAIGN_BUTTON_BLOCK_UPDATE,
  CampaignHeroBlock: CAMPAIGN_HERO_BLOCK_UPDATE,
  CampaignRegionSwitcherBlock: CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE,
  CampaignVideoCarouselBlock: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE,
  CampaignJourneyListBlock: CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE,
  CampaignJourneyBlock: CAMPAIGN_JOURNEY_BLOCK_UPDATE,
  CampaignAnalyticsBlock: CAMPAIGN_ANALYTICS_BLOCK_UPDATE,
  CampaignRegionHeaderBlock: CAMPAIGN_REGION_HEADER_BLOCK_UPDATE,
  CampaignRegionShareBlock: CAMPAIGN_REGION_SHARE_BLOCK_UPDATE,
  CampaignRichTextBlock: CAMPAIGN_RICH_TEXT_BLOCK_UPDATE,
  CampaignColumnsBlock: CAMPAIGN_COLUMNS_BLOCK_UPDATE,
  CampaignImageBlock: CAMPAIGN_IMAGE_BLOCK_UPDATE,
  CampaignVideoBlock: CAMPAIGN_VIDEO_BLOCK_UPDATE,
  CampaignFeaturedMediaBlock: CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE,
  CampaignHeaderBlock: CAMPAIGN_HEADER_BLOCK_UPDATE,
  CampaignFooterBlock: CAMPAIGN_FOOTER_BLOCK_UPDATE
} as const satisfies Record<CampaignUpdateTypename, unknown>

/** The mutation field a typename's update is sent as: `campaignHeroBlockUpdate`. */
export function campaignBlockUpdateOperation(
  typename: CampaignUpdateTypename
): string {
  return `${lowerFirst(typename)}Update`
}

/** The three `variant` inputs the block fragment aliases apart. */
const VARIANT_COLUMNS: Partial<Record<CampaignUpdateTypename, string>> = {
  CampaignTypographyBlock: 'typographyVariant',
  CampaignButtonBlock: 'buttonVariant',
  CampaignRegionSwitcherBlock: 'switcherVariant'
}

/** The column the cache holds an input key under (`variant` → `typographyVariant`, rich text `content` → `richTextContent`). */
export function campaignBlockColumn(
  typename: CampaignUpdateTypename,
  key: string
): string {
  if (key === 'variant') return VARIANT_COLUMNS[typename] ?? key
  const textFields: readonly CampaignTextField[] =
    typename in CAMPAIGN_TEXT_FIELDS
      ? CAMPAIGN_TEXT_FIELDS[typename as keyof typeof CAMPAIGN_TEXT_FIELDS]
      : []
  return textFields.find((field) => campaignTextInputKey(field) === key) ?? key
}

function definedEntries(input: object): Array<[string, unknown]> {
  return Object.entries(input).filter(([, value]) => value !== undefined)
}

/**
 * The row an update returns, as the block stands with `input` applied:
 * what the canvas shows until the server answers. The client copies the
 * server's side effects: a new image `src` has no size until it is
 * measured, and a journey card's text edit marks its snapshot edited unless
 * the input sets the flag itself. A Video Carousel's Watch link (or a known
 * Watch video) has no row, since only the server resolves the video;
 * switching to explicit mode clears the video with its language.
 */
export function campaignBlockUpdateRow<B extends CampaignUpdatableBlockRef>(
  row: B,
  input: CampaignBlockUpdateInput<B['__typename']>
): B | undefined {
  const fields = input as Record<string, unknown>
  const current = row as unknown as Record<string, unknown>
  const next: Record<string, unknown> = { ...current }
  for (const [key, value] of definedEntries(input))
    next[campaignBlockColumn(row.__typename, key)] = value
  switch (row.__typename) {
    case 'CampaignImageBlock':
      if (fields.src !== undefined && fields.src !== current.src) {
        next.width = null
        next.height = null
      }
      break
    case 'CampaignJourneyBlock':
      if (
        fields.snapshotEdited === undefined &&
        (fields.title !== undefined || fields.description !== undefined)
      )
        next.snapshotEdited = true
      break
    case 'CampaignVideoCarouselBlock':
      if (fields.url != null || fields.videoId != null) return undefined
      if (fields.videoId === null) {
        next.videoVariantLanguageId = null
        next.video = null
      }
      break
  }
  return next as unknown as B
}

/**
 * The input keys whose previous values undo writes back: the keys
 * themselves, except that a Video Carousel's Watch link or video is undone
 * by the video and language it replaced.
 */
function previousKeys(typename: CampaignUpdateTypename, key: string): string[] {
  if (
    typename === 'CampaignVideoCarouselBlock' &&
    (key === 'url' || key === 'videoId')
  )
    return ['videoId', 'videoVariantLanguageId']
  return [key]
}

/** The row's current values of exactly the keys `input` names (null where it has none): what undo writes back. */
export function campaignBlockPrevious<B extends CampaignUpdatableBlockRef>(
  row: B,
  input: CampaignBlockUpdateInput<B['__typename']>
): CampaignBlockUpdateInput<B['__typename']> {
  const current = row as unknown as Record<string, unknown>
  const previous: Record<string, unknown> = {}
  for (const [key] of definedEntries(input))
    for (const previousKey of previousKeys(row.__typename, key))
      previous[previousKey] =
        current[campaignBlockColumn(row.__typename, previousKey)] ?? null
  return previous
}

/** The block as the cache holds it now, optimistic writes included, or undefined when it is not there. */
export function readCampaignBlockRow<B extends CampaignUpdatableBlockRef>(
  cache: ApolloCache,
  block: B
): B | undefined {
  const id = cache.identify({ __typename: block.__typename, id: block.id })
  const read = (fragment: typeof CAMPAIGN_PUBLIC_BLOCK_FIELDS, name: string) =>
    cache.readFragment<Record<string, unknown>>({
      id,
      fragment,
      fragmentName: name,
      optimistic: true
    })
  const publicFields = read(
    CAMPAIGN_PUBLIC_BLOCK_FIELDS,
    'CampaignPublicBlockFields'
  )
  const translationFields = read(
    CAMPAIGN_BLOCK_TRANSLATION_FIELDS,
    'CampaignBlockTranslationFields'
  )
  if (publicFields == null || translationFields == null) return undefined
  return { ...publicFields, ...translationFields } as unknown as B
}

export interface CampaignBlockUpdateOptions {
  /** Passed through to the request: the text Command's `debounceKey`. */
  context?: DefaultContext
}

export interface CampaignBlockUpdateMutation {
  /**
   * Send the block's typename's update with `input`, shown optimistically
   * as the block as cached when it is sent with the input applied (the
   * passed block when the cache no longer holds it). Resolves with the
   * full row; rejects with the Apollo error unchanged.
   */
  update: <B extends CampaignUpdatableBlockRef>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>,
    options?: CampaignBlockUpdateOptions
  ) => Promise<CampaignUpdatableBlock<B['__typename']>>
  /** The cached block's current values of exactly the keys `input` names: what undo writes back. */
  previousFields: <B extends CampaignUpdatableBlockRef>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>
  ) => CampaignBlockUpdateInput<B['__typename']>
}

type SendUpdate = (options: {
  variables: { id: string; input: object }
  optimisticResponse?: Record<string, unknown>
  context?: DefaultContext
}) => Promise<ApolloLink.Result<Record<string, unknown>>>

/**
 * Every Campaign Block field write: one `campaign<Typename>BlockUpdate` per
 * typename behind one `update(block, input)`, so callers name fields, not
 * mutations. Nothing here shows UI.
 */
export function useCampaignBlockUpdateMutation(): CampaignBlockUpdateMutation {
  const { cache } = useApolloClient()
  const typography = useMutation<
    CampaignTypographyBlockUpdate,
    CampaignTypographyBlockUpdateVariables
  >(CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE)[0]
  const button = useMutation<
    CampaignButtonBlockUpdate,
    CampaignButtonBlockUpdateVariables
  >(CAMPAIGN_BUTTON_BLOCK_UPDATE)[0]
  const hero = useMutation<
    CampaignHeroBlockUpdate,
    CampaignHeroBlockUpdateVariables
  >(CAMPAIGN_HERO_BLOCK_UPDATE)[0]
  const regionSwitcher = useMutation<
    CampaignRegionSwitcherBlockUpdate,
    CampaignRegionSwitcherBlockUpdateVariables
  >(CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE)[0]
  const videoCarousel = useMutation<
    CampaignVideoCarouselBlockUpdate,
    CampaignVideoCarouselBlockUpdateVariables
  >(CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE)[0]
  const journeyList = useMutation<
    CampaignJourneyListBlockUpdate,
    CampaignJourneyListBlockUpdateVariables
  >(CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE)[0]
  const journey = useMutation<
    CampaignJourneyBlockUpdate,
    CampaignJourneyBlockUpdateVariables
  >(CAMPAIGN_JOURNEY_BLOCK_UPDATE)[0]
  const analytics = useMutation<
    CampaignAnalyticsBlockUpdate,
    CampaignAnalyticsBlockUpdateVariables
  >(CAMPAIGN_ANALYTICS_BLOCK_UPDATE)[0]
  const regionHeader = useMutation<
    CampaignRegionHeaderBlockUpdate,
    CampaignRegionHeaderBlockUpdateVariables
  >(CAMPAIGN_REGION_HEADER_BLOCK_UPDATE)[0]
  const regionShare = useMutation<
    CampaignRegionShareBlockUpdate,
    CampaignRegionShareBlockUpdateVariables
  >(CAMPAIGN_REGION_SHARE_BLOCK_UPDATE)[0]
  const richText = useMutation<
    CampaignRichTextBlockUpdate,
    CampaignRichTextBlockUpdateVariables
  >(CAMPAIGN_RICH_TEXT_BLOCK_UPDATE)[0]
  const columns = useMutation<
    CampaignColumnsBlockUpdate,
    CampaignColumnsBlockUpdateVariables
  >(CAMPAIGN_COLUMNS_BLOCK_UPDATE)[0]
  const image = useMutation<
    CampaignImageBlockUpdate,
    CampaignImageBlockUpdateVariables
  >(CAMPAIGN_IMAGE_BLOCK_UPDATE)[0]
  const video = useMutation<
    CampaignVideoBlockUpdate,
    CampaignVideoBlockUpdateVariables
  >(CAMPAIGN_VIDEO_BLOCK_UPDATE)[0]
  const featuredMedia = useMutation<
    CampaignFeaturedMediaBlockUpdate,
    CampaignFeaturedMediaBlockUpdateVariables
  >(CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE)[0]
  const header = useMutation<
    CampaignHeaderBlockUpdate,
    CampaignHeaderBlockUpdateVariables
  >(CAMPAIGN_HEADER_BLOCK_UPDATE)[0]
  const footer = useMutation<
    CampaignFooterBlockUpdate,
    CampaignFooterBlockUpdateVariables
  >(CAMPAIGN_FOOTER_BLOCK_UPDATE)[0]

  const mutations = {
    CampaignTypographyBlock: typography,
    CampaignButtonBlock: button,
    CampaignHeroBlock: hero,
    CampaignRegionSwitcherBlock: regionSwitcher,
    CampaignVideoCarouselBlock: videoCarousel,
    CampaignJourneyListBlock: journeyList,
    CampaignJourneyBlock: journey,
    CampaignAnalyticsBlock: analytics,
    CampaignRegionHeaderBlock: regionHeader,
    CampaignRegionShareBlock: regionShare,
    CampaignRichTextBlock: richText,
    CampaignColumnsBlock: columns,
    CampaignImageBlock: image,
    CampaignVideoBlock: video,
    CampaignFeaturedMediaBlock: featuredMedia,
    CampaignHeaderBlock: header,
    CampaignFooterBlock: footer
  } as const satisfies Record<CampaignUpdateTypename, unknown>

  async function update<B extends CampaignUpdatableBlockRef>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>,
    { context }: CampaignBlockUpdateOptions = {}
  ): Promise<CampaignUpdatableBlock<B['__typename']>> {
    const send = mutations[block.__typename] as unknown as SendUpdate
    const operation = campaignBlockUpdateOperation(block.__typename)
    const optimistic = campaignBlockUpdateRow(
      readCampaignBlockRow(cache, block) ?? block,
      input
    )
    const result = await send({
      variables: { id: block.id, input },
      optimisticResponse:
        optimistic == null ? undefined : { [operation]: optimistic },
      context
    })
    const row = result.data?.[operation]
    if (row == null) throw new Error(`${operation} returned no block`)
    return row as CampaignUpdatableBlock<B['__typename']>
  }

  function previousFields<B extends CampaignUpdatableBlockRef>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>
  ): CampaignBlockUpdateInput<B['__typename']> {
    return campaignBlockPrevious(
      readCampaignBlockRow(cache, block) ?? block,
      input
    )
  }

  return { update, previousFields }
}
