import { CampaignStringKey } from '../../../../__generated__/globalTypes'

import { campaignString } from './campaignString'

describe('campaignString', () => {
  const strings = [
    { key: CampaignStringKey.copy, value: 'Copier' },
    { key: CampaignStringKey.open, value: '   ' }
  ]

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
