import {
  CAMPAIGN_TEXT_CAPS,
  CAMPAIGN_TEXT_FIELDS,
  campaignTextInputKey,
  primaryTextField
} from './campaignTextFields'

describe('campaignTextFields', () => {
  it('writes rich text content under the API’s content key and every other field under its own', () => {
    expect(campaignTextInputKey('richTextContent')).toBe('content')
    expect(campaignTextInputKey('content')).toBe('content')
    expect(campaignTextInputKey('title')).toBe('title')
  })

  it('gives rich text a title and a 5000-character content', () => {
    expect(CAMPAIGN_TEXT_FIELDS.CampaignRichTextBlock).toEqual([
      'title',
      'richTextContent'
    ])
    expect(CAMPAIGN_TEXT_CAPS.richTextContent).toBe(5000)
    expect(CAMPAIGN_TEXT_CAPS.title).toBe(150)
    expect(primaryTextField('CampaignRichTextBlock')).toBe('title')
  })
})
