import { CampaignStringKey } from '../../../../__generated__/globalTypes'

import { campaignString, campaignStringOr } from './campaignString'

const strings = [
  { key: CampaignStringKey.copy, value: 'Copier' },
  { key: CampaignStringKey.open, value: '   ' }
]

describe('campaignString', () => {
  it('reads the value of the key', () => {
    expect(campaignString(strings, CampaignStringKey.copy)).toBe('Copier')
  })

  it('is empty when the campaign lacks the row', () => {
    expect(campaignString(strings, CampaignStringKey.copied)).toBe('')
  })

  it('is empty when the value is blank', () => {
    expect(campaignString(strings, CampaignStringKey.open)).toBe('')
  })
})

describe('campaignStringOr', () => {
  it('reads the value of the key', () => {
    expect(campaignStringOr(strings, CampaignStringKey.copy, 'Copy link')).toBe(
      'Copier'
    )
  })

  it('falls back when the campaign lacks the row', () => {
    expect(campaignStringOr(strings, CampaignStringKey.copied, 'Copied')).toBe(
      'Copied'
    )
  })

  it('falls back when the value is blank', () => {
    expect(campaignStringOr(strings, CampaignStringKey.open, 'Open')).toBe(
      'Open'
    )
  })
})
