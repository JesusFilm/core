import { campaignWithColumns } from '../../components/CampaignEditor/data'

import {
  CAMPAIGN_TEXT_CAPS,
  CAMPAIGN_TEXT_FIELDS,
  CampaignTextBlock,
  campaignTextInputKey,
  primaryTextField
} from './campaignTextFields'
import { campaignTextOptimisticResponse } from './useCampaignBlockTextMutation'

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

  it('builds the optimistic response of a rich text edit under the aliased field', () => {
    const block = campaignWithColumns.blocks.find(
      (candidate) => candidate.id === 'slotRichTextId'
    ) as CampaignTextBlock

    expect(
      campaignTextOptimisticResponse(block, 'richTextContent', 'New text')
    ).toEqual({
      campaignRichTextBlockUpdate: {
        __typename: 'CampaignRichTextBlock',
        id: 'slotRichTextId',
        title: 'Our story',
        richTextContent: 'New text'
      }
    })
  })
})
