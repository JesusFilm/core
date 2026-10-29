import { CampaignPageKind } from '../../../__generated__/globalTypes'

import { sectionTypesForPage, sectionTypesForSlot } from './sectionTypes'

describe('sectionTypes', () => {
  // The menus as main offered them before the grammar (#10058): same members, same order.
  describe('sectionTypesForPage', () => {
    it('offers every section but the region-only ones on the landing page', () => {
      expect(sectionTypesForPage(CampaignPageKind.landing)).toEqual([
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
    })

    it('offers every section on the Region Page', () => {
      expect(sectionTypesForPage(CampaignPageKind.regionTemplate)).toEqual([
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
      ])
    })
  })

  describe('sectionTypesForSlot', () => {
    it('drops Columns and Image from a landing-page Column Slot', () => {
      expect(sectionTypesForSlot(CampaignPageKind.landing)).toEqual([
        'CampaignHeroBlock',
        'CampaignRegionSwitcherBlock',
        'CampaignVideoCarouselBlock',
        'CampaignJourneyListBlock',
        'CampaignAnalyticsBlock',
        'CampaignRichTextBlock',
        'CampaignFeaturedMediaBlock'
      ])
    })

    it('drops Columns, Region Share and Image from a Region Page Column Slot', () => {
      expect(sectionTypesForSlot(CampaignPageKind.regionTemplate)).toEqual([
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
  })
})
