import { campaign } from '../data'

import { siblingRows, siblingsOf } from './siblingsOf'

const footerTerms = campaign.blocks.find(
  (block) => block.id === 'footerTermsId'
)!

describe('siblingsOf', () => {
  it('lists a block’s live siblings in order, excluding itself', () => {
    expect(siblingsOf(campaign.blocks, footerTerms).map((b) => b.id)).toEqual([
      'footerCopyrightId',
      'footerPrivacyId'
    ])
  })
})

describe('siblingRows', () => {
  it('keys the blocks in the given order, numbered contiguously from 0', () => {
    expect(siblingRows(siblingsOf(campaign.blocks, footerTerms))).toEqual([
      {
        __typename: 'CampaignTypographyBlock',
        id: 'footerCopyrightId',
        parentOrder: 0
      },
      {
        __typename: 'CampaignButtonBlock',
        id: 'footerPrivacyId',
        parentOrder: 1
      }
    ])
  })
})
