import { expectTypeOf } from 'vitest'

import type { CampaignPublicBlockFields } from '../../__generated__/CampaignPublicBlockFields'
import type { CampaignSectionTypename } from '../../types'

import {
  BAND_TYPENAMES,
  CAMPAIGN_TYPENAMES,
  CHROME_TYPENAMES,
  type CampaignTypename,
  EXTRA_TYPENAMES,
  type ExtraTypename,
  MEDIA_SLOT_TYPENAMES,
  PAGE_SECTION_TYPENAMES,
  SLOT_TYPENAMES,
  acceptsChild,
  isMediaOwner,
  sectionTypesForPage,
  sectionTypesForSlot,
  shownExtras
} from './campaignBlockGrammar'

const BOTH_EXTRAS = ['CampaignTypographyBlock', 'CampaignButtonBlock']

interface GrammarRow {
  /** The children `acceptsChild` takes under it, in `CAMPAIGN_TYPENAMES` order. */
  accepts: string[]
  shown: string[]
  onLanding: boolean
  onRegionPage: boolean
  inLandingSlot: boolean
  inRegionSlot: boolean
  mediaOwner: boolean
  fillsMediaSlot: boolean
}

const section: GrammarRow = {
  accepts: BOTH_EXTRAS,
  shown: BOTH_EXTRAS,
  onLanding: true,
  onRegionPage: true,
  inLandingSlot: true,
  inRegionSlot: true,
  mediaOwner: false,
  fillsMediaSlot: false
}

const nonBand: GrammarRow = {
  accepts: [],
  shown: [],
  onLanding: false,
  onRegionPage: false,
  inLandingSlot: false,
  inRegionSlot: false,
  mediaOwner: false,
  fillsMediaSlot: false
}

const chrome: GrammarRow = {
  ...nonBand,
  accepts: BOTH_EXTRAS,
  shown: BOTH_EXTRAS
}

const GRAMMAR: Record<CampaignTypename, GrammarRow> = {
  CampaignHeroBlock: { ...section, mediaOwner: true },
  CampaignRegionSwitcherBlock: section,
  CampaignVideoCarouselBlock: {
    ...section,
    accepts: [...BOTH_EXTRAS, 'CampaignVideoBlock']
  },
  CampaignJourneyListBlock: section,
  CampaignAnalyticsBlock: section,
  CampaignRegionHeaderBlock: {
    ...section,
    onLanding: false,
    inLandingSlot: false
  },
  CampaignRegionShareBlock: {
    ...section,
    onLanding: false,
    inLandingSlot: false,
    inRegionSlot: false
  },
  CampaignRichTextBlock: section,
  CampaignColumnsBlock: {
    ...section,
    inLandingSlot: false,
    inRegionSlot: false
  },
  CampaignImageBlock: {
    ...section,
    inLandingSlot: false,
    inRegionSlot: false,
    fillsMediaSlot: true
  },
  CampaignFeaturedMediaBlock: { ...section, mediaOwner: true },
  CampaignHeaderBlock: { ...chrome, shown: ['CampaignButtonBlock'] },
  CampaignFooterBlock: chrome,
  CampaignTypographyBlock: nonBand,
  CampaignButtonBlock: nonBand,
  CampaignColumnBlock: nonBand,
  CampaignVideoBlock: { ...nonBand, fillsMediaSlot: true },
  CampaignJourneyBlock: nonBand
}

describe('campaignBlockGrammar', () => {
  it('has a row for every typename', () => {
    expect(Object.keys(GRAMMAR)).toEqual([...CAMPAIGN_TYPENAMES])
  })

  describe.each(CAMPAIGN_TYPENAMES.map((typename) => [typename]))(
    '%s',
    (typename) => {
      const row = GRAMMAR[typename]

      it('takes exactly its children (acceptsChild)', () => {
        expect(
          CAMPAIGN_TYPENAMES.filter((child) => acceptsChild(typename, child))
        ).toEqual(row.accepts)
      })

      it('shows exactly its Extras (shownExtras)', () => {
        expect(shownExtras(typename)).toEqual(row.shown)
      })

      it('is offered on each page kind as the row says (sectionTypesForPage)', () => {
        expect(
          (sectionTypesForPage('landing') as string[]).includes(typename)
        ).toBe(row.onLanding)
        expect(
          (sectionTypesForPage('regionTemplate') as string[]).includes(typename)
        ).toBe(row.onRegionPage)
      })

      it('is offered in a Column Slot as the row says (sectionTypesForSlot)', () => {
        expect(
          (sectionTypesForSlot('landing') as string[]).includes(typename)
        ).toBe(row.inLandingSlot)
        expect(
          (sectionTypesForSlot('regionTemplate') as string[]).includes(typename)
        ).toBe(row.inRegionSlot)
      })

      it('owns and fills a Media Slot as the row says', () => {
        expect(isMediaOwner(typename)).toBe(row.mediaOwner)
        expect(
          (MEDIA_SLOT_TYPENAMES as readonly string[]).includes(typename)
        ).toBe(row.fillsMediaSlot)
      })
    }
  )

  it('takes both Extras under the header but shows only its Buttons', () => {
    expect(acceptsChild('CampaignHeaderBlock', 'CampaignTypographyBlock')).toBe(
      true
    )
    expect(acceptsChild('CampaignHeaderBlock', 'CampaignButtonBlock')).toBe(
      true
    )
    expect(shownExtras('CampaignHeaderBlock')).toEqual(['CampaignButtonBlock'])
  })

  it('refuses a child under a typename that is not a band', () => {
    expect(acceptsChild('CampaignColumnBlock', 'CampaignButtonBlock')).toBe(
      false
    )
    expect(acceptsChild('NotABlock', 'CampaignTypographyBlock')).toBe(false)
  })

  it('keeps the menus in PAGE_SECTION_TYPENAMES order', () => {
    expect(sectionTypesForPage('regionTemplate')).toEqual([
      ...PAGE_SECTION_TYPENAMES
    ])
    expect(sectionTypesForPage('landing')).toEqual([
      'CampaignHeroBlock',
      'CampaignRegionSwitcherBlock',
      'CampaignVideoCarouselBlock',
      'CampaignJourneyListBlock',
      'CampaignAnalyticsBlock',
      'CampaignRichTextBlock',
      'CampaignColumnsBlock',
      'CampaignImageBlock',
      'CampaignFeaturedMediaBlock'
    ])
    expect(sectionTypesForSlot('regionTemplate')).toEqual([
      'CampaignHeroBlock',
      'CampaignRegionSwitcherBlock',
      'CampaignVideoCarouselBlock',
      'CampaignJourneyListBlock',
      'CampaignAnalyticsBlock',
      'CampaignRegionHeaderBlock',
      'CampaignRichTextBlock',
      'CampaignFeaturedMediaBlock'
    ])
  })

  it('makes the bands the page sections then the chrome', () => {
    expect(BAND_TYPENAMES).toEqual([
      ...PAGE_SECTION_TYPENAMES,
      ...CHROME_TYPENAMES
    ])
    expect(EXTRA_TYPENAMES).toEqual(BOTH_EXTRAS)
    expect(SLOT_TYPENAMES).toEqual(['CampaignColumnBlock'])
  })

  it('matches the generated block union and the renderer’s section typenames', () => {
    expectTypeOf<CampaignTypename>().toEqualTypeOf<
      CampaignPublicBlockFields['__typename']
    >()
    expectTypeOf<CampaignSectionTypename>().toEqualTypeOf<
      Exclude<
        CampaignPublicBlockFields['__typename'],
        | ExtraTypename
        | 'CampaignColumnBlock'
        | 'CampaignJourneyBlock'
        | 'CampaignVideoBlock'
      >
    >()
  })
})
