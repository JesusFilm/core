import { JesusFilmAppVerificationContent } from '../../JesusFilmAppVerificationContent/Body'
import { NextStepsVerificationContent } from '../../NextStepsVerificationContent/Body'

import { getVerificationContent } from './getVerificationContentComponent'

describe('getVerificationContent', () => {
  it('returns JesusFilmAppVerificationContent when app is Default', () => {
    const component = getVerificationContent('Default')
    expect(component).toBe(JesusFilmAppVerificationContent)
  })

  it('returns NextStepsVerificationContent when app is NextSteps', () => {
    const component = getVerificationContent('NextSteps')
    expect(component).toBe(NextStepsVerificationContent)
  })
})
