import {
  CAMPAIGN_TEXT_FIELDS,
  campaignTextInputKey,
  primaryTextField,
  translatedBlockFields
} from './campaignTextFields'

describe('campaignTextFields', () => {
  it('writes rich text content under the API’s content key and every other field under its own', () => {
    expect(campaignTextInputKey('richTextContent')).toBe('content')
    expect(campaignTextInputKey('content')).toBe('content')
    expect(campaignTextInputKey('title')).toBe('title')
  })

  it('gives rich text a title and its content, read as richTextContent', () => {
    expect(CAMPAIGN_TEXT_FIELDS.CampaignRichTextBlock).toEqual([
      'title',
      'richTextContent'
    ])
    expect(primaryTextField('CampaignRichTextBlock')).toBe('title')
  })

  it('lists the inline text of every text block but the panel-edited image and carousel card', () => {
    expect(CAMPAIGN_TEXT_FIELDS).toEqual({
      CampaignHeroBlock: ['eyebrow', 'title', 'description'],
      CampaignFeaturedMediaBlock: [
        'eyebrow',
        'title',
        'description',
        'bullets'
      ],
      CampaignRichTextBlock: ['title', 'richTextContent'],
      CampaignRegionSwitcherBlock: ['title'],
      CampaignRegionHeaderBlock: ['intro'],
      CampaignRegionShareBlock: ['title', 'intro'],
      CampaignJourneyListBlock: ['eyebrow', 'title', 'description'],
      CampaignVideoCarouselBlock: ['eyebrow', 'title', 'description'],
      CampaignAnalyticsBlock: ['eyebrow', 'title'],
      CampaignTypographyBlock: ['content'],
      CampaignButtonBlock: ['label'],
      CampaignJourneyBlock: ['title', 'description']
    })
  })

  it('lists a block’s Translated Fields, media included, as the editor reads them', () => {
    expect(translatedBlockFields('CampaignImageBlock')).toEqual(['alt'])
    expect(translatedBlockFields('CampaignVideoBlock')).toEqual([
      'title',
      'description'
    ])
    expect(translatedBlockFields('CampaignRichTextBlock')).toEqual([
      'title',
      'richTextContent'
    ])
    expect(translatedBlockFields('CampaignColumnsBlock')).toEqual([])
  })
})
