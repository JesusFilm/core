import { TEXT_CAPS } from '../validation'

import {
  CAMPAIGN_BLOCK_TEXT_COLUMNS,
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TEXT_FIELD_VALUES,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  campaignBlockTextCap,
  translationsColumn
} from './campaignTextField'

describe('CampaignTextField', () => {
  it('enumerates every translatable field once', () => {
    expect([...CAMPAIGN_TEXT_FIELD_VALUES].sort()).toEqual(
      [
        'eyebrow',
        'title',
        'lede',
        'bullets',
        'content',
        'intro',
        'label',
        'alt',
        'description',
        'name',
        'value'
      ].sort()
    )
    expect(new Set(CAMPAIGN_TEXT_FIELD_VALUES).size).toBe(
      CAMPAIGN_TEXT_FIELD_VALUES.length
    )
  })

  it('pairs every target with its translatable fields and PRD §15 caps', () => {
    expect(CAMPAIGN_BLOCK_TEXT_FIELDS).toEqual({
      CampaignHeroBlock: { eyebrow: 80, title: 150, lede: 500 },
      CampaignFeaturedMediaBlock: {
        eyebrow: 80,
        title: 150,
        lede: 500,
        bullets: 1000
      },
      CampaignRichTextBlock: { title: 150, content: 5000 },
      CampaignRegionSwitcherBlock: { title: 150 },
      CampaignRegionHeaderBlock: { intro: 500 },
      CampaignRegionShareBlock: { title: 150, intro: 500 },
      CampaignJourneyListBlock: { eyebrow: 80, title: 150, lede: 500 },
      CampaignVideoCarouselBlock: { eyebrow: 80, title: 150 },
      CampaignAnalyticsBlock: { eyebrow: 80, title: 150 },
      CampaignTypographyBlock: { content: 2000 },
      CampaignButtonBlock: { label: 60 },
      CampaignImageBlock: { alt: 500 },
      CampaignVideoBlock: { title: 200, description: 1000 },
      CampaignJourneyBlock: { title: 200, description: 1000 }
    })
    expect(CAMPAIGN_REGION_TEXT_FIELDS).toEqual({ name: TEXT_CAPS.regionName })
    expect(CAMPAIGN_STRING_TEXT_FIELDS).toEqual({
      value: TEXT_CAPS.stringValue
    })
    expect(CAMPAIGN_TITLE_TEXT_FIELDS).toEqual({
      title: TEXT_CAPS.campaignTitle
    })
  })

  it('uses only enum members across every target map', () => {
    const used = new Set([
      ...Object.values(CAMPAIGN_BLOCK_TEXT_FIELDS).flatMap(Object.keys),
      ...Object.keys(CAMPAIGN_REGION_TEXT_FIELDS),
      ...Object.keys(CAMPAIGN_STRING_TEXT_FIELDS),
      ...Object.keys(CAMPAIGN_TITLE_TEXT_FIELDS)
    ])
    expect([...used].sort()).toEqual([...CAMPAIGN_TEXT_FIELD_VALUES].sort())
  })

  it('derives the block text columns the public read resolves, each with its translations sibling', () => {
    expect(CAMPAIGN_BLOCK_TEXT_COLUMNS).toEqual(
      expect.arrayContaining([
        ['eyebrow', 'eyebrowTranslations'],
        ['title', 'titleTranslations'],
        ['lede', 'ledeTranslations'],
        ['bullets', 'bulletsTranslations'],
        ['content', 'contentTranslations'],
        ['intro', 'introTranslations'],
        ['label', 'labelTranslations'],
        ['alt', 'altTranslations'],
        ['description', 'descriptionTranslations']
      ])
    )
    expect(CAMPAIGN_BLOCK_TEXT_COLUMNS).toHaveLength(9)
    expect(translationsColumn('name')).toBe('nameTranslations')
  })

  it('resolves a field cap by block typename, null where the block has no such field', () => {
    expect(campaignBlockTextCap('CampaignHeroBlock', 'title')).toBe(150)
    expect(campaignBlockTextCap('CampaignVideoBlock', 'title')).toBe(200)
    expect(campaignBlockTextCap('CampaignHeroBlock', 'content')).toBeNull()
    expect(campaignBlockTextCap('CampaignColumnsBlock', 'title')).toBeNull()
  })
})
