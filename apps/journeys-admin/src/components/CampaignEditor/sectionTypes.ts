import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  CampaignBackgroundKind,
  CampaignJourneyListDisplay,
  CampaignPageKind,
  CampaignSwitcherVariant
} from '../../../__generated__/globalTypes'
import {
  CAMPAIGN_SECTION_TYPENAMES,
  CampaignSectionBlock,
  CampaignSectionTypename
} from '../../libs/useCampaignSectionCreateMutation'

/** Sections that read the region being rendered: offered on the Region Page only. */
export const REGION_ONLY_TYPENAMES: readonly CampaignSectionTypename[] = [
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock'
]

/** The section types a page's "+Add section" offers, in menu order. */
export function sectionTypesForPage(
  pageKind: CampaignPageKind
): CampaignSectionTypename[] {
  return CAMPAIGN_SECTION_TYPENAMES.filter(
    (typename) =>
      pageKind === CampaignPageKind.regionTemplate ||
      !REGION_ONLY_TYPENAMES.includes(typename)
  )
}

interface NewSectionBase {
  id: string
  campaignId: string
  pageId: string
  parentOrder: number
}

/**
 * A new section as its create mutation returns it: the empty body the API
 * stores when nothing is given, no background, and the type's defaults.
 */
export function newSectionBlock(
  typename: CampaignSectionTypename,
  base: NewSectionBase
): CampaignSectionBlock {
  const shared = {
    ...base,
    regionId: null,
    parentBlockId: null,
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
        lede: null,
        align: null,
        mediaBlockId: null,
        eyebrowTranslations: [],
        titleTranslations: [],
        ledeTranslations: []
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
        videoId: null,
        videoVariantLanguageId: null,
        eyebrowTranslations: [],
        titleTranslations: []
      }
    case 'CampaignJourneyListBlock':
      return {
        __typename: typename,
        ...shared,
        eyebrow: null,
        title: null,
        lede: null,
        display: CampaignJourneyListDisplay.grid,
        eyebrowTranslations: [],
        titleTranslations: [],
        ledeTranslations: []
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
  }
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
