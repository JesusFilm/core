import { shortJourney } from '../journeySchema/examples'

import { scopeCheck } from './scopeCheck'

describe('scopeCheck', () => {
  it('passes when kept steps are unchanged', () => {
    const after = structuredClone(shortJourney)
    after.steps[2].card.theme = 'dark'

    expect(scopeCheck(shortJourney, after, ['welcome', 'claims'])).toEqual([])
  })

  it('flags kept steps that changed or went missing', () => {
    const after = structuredClone(shortJourney)
    after.steps[0].card.theme = 'light'
    after.steps.splice(1, 1)

    expect(
      scopeCheck(shortJourney, after, ['welcome', 'claims', 'close'])
    ).toEqual(['welcome', 'claims'])
  })

  it('ignores kept names that did not exist before', () => {
    expect(scopeCheck(shortJourney, shortJourney, ['nope'])).toEqual([])
  })
})
