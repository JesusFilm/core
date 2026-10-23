import { TFunction } from 'i18next'

import { CampaignStringKey } from '../../../__generated__/globalTypes'

import { getCampaignStringDefaults } from './getCampaignStringDefaults'

describe('getCampaignStringDefaults', () => {
  it('returns an English string for every campaign string key', () => {
    const t = ((key: string) => key) as unknown as TFunction
    const defaults = getCampaignStringDefaults(t)

    expect(Object.keys(defaults).sort()).toEqual(
      Object.values(CampaignStringKey).sort()
    )
    expect(defaults.step1).toBe('Pick a language your friend understands.')
  })
})
