import { shortJourney } from '../journeySchema/examples'

import { restoreKeptSteps, scopeCheck } from './scopeCheck'

describe('scopeCheck', () => {
  it('restores a missing kept card between the other kept cards', () => {
    const after = structuredClone(shortJourney)
    after.steps.splice(1, 1)
    const restored = restoreKeptSteps(
      after,
      shortJourney,
      shortJourney.steps.map((step) => step.name)
    )
    expect(restored.steps).toEqual(shortJourney.steps)
    expect(restored.steps[1]).not.toBe(shortJourney.steps[1])
  })

  it('uses unchanged neighbors as anchors when an edited card has moved', () => {
    const after = structuredClone(shortJourney)
    after.steps = [after.steps[2], after.steps[0]]
    const restored = restoreKeptSteps(after, shortJourney, [
      'welcome',
      'claims'
    ])
    expect(restored.steps.map((step) => step.name)).toEqual([
      'close',
      'welcome',
      'claims'
    ])
  })

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
