import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  CampaignBackgroundKind,
  CampaignColumnsRatio,
  CampaignFeaturedMediaLayout,
  CampaignJourneyListDisplay,
  CampaignMediaSide,
  CampaignSwitcherVariant
} from '../../../__generated__/globalTypes'
import {
  AddableSectionBlock,
  AddableSectionTypename
} from '../../libs/useCampaignSectionCreateMutation'

/**
 * The section types a page's "+Add section" offers and a Column Slot's type
 * picker offers, in menu order: the Campaign Block grammar's. A generated
 * `CampaignPageKind` value is a grammar page kind.
 */
export {
  sectionTypesForPage,
  sectionTypesForSlot
} from '@core/journeys/ui/Campaign/libs/campaignBlockGrammar'

interface NewSectionBase {
  id: string
  campaignId: string
  pageId: string
  parentOrder: number
  /** The Column Slot the section sits in; omitted for a top-level section. */
  parentBlockId?: string
}

/**
 * A new section as its create mutation returns it: the empty body the API
 * stores when nothing is given, no background, and the type's defaults.
 */
export function newSectionBlock(
  typename: AddableSectionTypename,
  base: NewSectionBase
): AddableSectionBlock {
  const shared = {
    ...base,
    regionId: null,
    parentBlockId: base.parentBlockId ?? null,
    backgroundKind: CampaignBackgroundKind.none,
    backgroundColor: null,
    coverBlockId: null,
    backgroundOverlay: null,
    headingColor: null,
    textColor: null,
    buttonColor: null,
    buttonTextColor: null,
    accentColor: null
  }
  switch (typename) {
    case 'CampaignHeroBlock':
      return {
        __typename: typename,
        ...shared,
        eyebrow: null,
        title: null,
        description: null,
        align: null,
        mediaBlockId: null,
        minHeight: null,
        eyebrowTranslations: [],
        titleTranslations: [],
        descriptionTranslations: []
      }
    case 'CampaignRegionSwitcherBlock':
      return {
        __typename: typename,
        ...shared,
        title: null,
        switcherVariant: CampaignSwitcherVariant.cards,
        titleTranslations: []
      }
    case 'CampaignVideoCarouselBlock':
      return {
        __typename: typename,
        ...shared,
        eyebrow: null,
        title: null,
        description: null,
        videoId: null,
        videoVariantLanguageId: null,
        video: null,
        eyebrowTranslations: [],
        titleTranslations: [],
        descriptionTranslations: []
      }
    case 'CampaignJourneyListBlock':
      return {
        __typename: typename,
        ...shared,
        eyebrow: null,
        title: null,
        description: null,
        display: CampaignJourneyListDisplay.grid,
        eyebrowTranslations: [],
        titleTranslations: [],
        descriptionTranslations: []
      }
    case 'CampaignAnalyticsBlock':
      return {
        __typename: typename,
        ...shared,
        eyebrow: null,
        title: null,
        showMap: false,
        eyebrowTranslations: [],
        titleTranslations: []
      }
    case 'CampaignRegionHeaderBlock':
      return {
        __typename: typename,
        ...shared,
        intro: null,
        introTranslations: []
      }
    case 'CampaignRegionShareBlock':
      return {
        __typename: typename,
        ...shared,
        title: null,
        intro: null,
        titleTranslations: [],
        introTranslations: []
      }
    case 'CampaignRichTextBlock':
      return {
        __typename: typename,
        ...shared,
        title: null,
        richTextContent: null,
        titleTranslations: [],
        richTextContentTranslations: []
      }
    case 'CampaignColumnsBlock':
      return {
        __typename: typename,
        ...shared,
        ratio: CampaignColumnsRatio.equal
      }
    case 'CampaignImageBlock':
      return {
        __typename: typename,
        ...shared,
        src: null,
        alt: null,
        altTranslations: [],
        width: null,
        height: null,
        focalLeft: 50,
        focalTop: 50,
        scale: null
      }
    case 'CampaignFeaturedMediaBlock':
      return {
        __typename: typename,
        ...shared,
        eyebrow: null,
        title: null,
        description: null,
        bullets: null,
        mediaSide: CampaignMediaSide.right,
        layout: CampaignFeaturedMediaLayout.sideBySide,
        mediaBlockId: null,
        eyebrowTranslations: [],
        titleTranslations: [],
        descriptionTranslations: [],
        bulletsTranslations: []
      }
  }
}

type ColumnSlotBlock = Extract<
  CampaignBlock,
  { __typename: 'CampaignColumnBlock' }
>

/** The two empty Column Slots a new Columns section is created with, at parentOrder 0 and 1. */
export function newColumnSlots(
  columns: Pick<CampaignBlock, 'id' | 'campaignId' | 'pageId' | 'regionId'>,
  slotIds: [string, string]
): ColumnSlotBlock[] {
  return slotIds.map((id, parentOrder) => ({
    __typename: 'CampaignColumnBlock',
    id,
    campaignId: columns.campaignId,
    pageId: columns.pageId,
    regionId: columns.regionId,
    parentBlockId: columns.id,
    parentOrder
  }))
}

/** A Columns section's live slots in order. */
export function columnSlots(
  blocks: CampaignBlock[],
  columnsId: string
): CampaignBlock[] {
  return blocks
    .filter(
      (block) =>
        block.__typename === 'CampaignColumnBlock' &&
        block.parentBlockId === columnsId
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
}

/** The one section a Column Slot holds, if any. */
export function slotSection(
  blocks: CampaignBlock[],
  slotId: string
): CampaignBlock | undefined {
  return blocks.find((block) => block.parentBlockId === slotId)
}

/** True for a section that sits in a Column Slot. */
export function isInColumnSlot(
  blocks: CampaignBlock[],
  block: CampaignBlock
): boolean {
  if (block.parentBlockId == null) return false
  return (
    blocks.find((candidate) => candidate.id === block.parentBlockId)
      ?.__typename === 'CampaignColumnBlock'
  )
}

/** The ordered sections of one page: top-level blocks with that `pageId`. */
export function pageSections(
  blocks: CampaignBlock[],
  pageId: string | null | undefined
): CampaignBlock[] {
  return blocks
    .filter(
      (block) =>
        block.pageId === pageId &&
        block.parentBlockId == null &&
        block.parentOrder != null
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
}
