import { CustomizationScreen } from '../getCustomizeFlowConfig'

import { getNextCustomizeScreen } from './getNextCustomizeScreen'

describe('getNextCustomizeScreen', () => {
  const screens: CustomizationScreen[] = [
    'language',
    'text',
    'links',
    'media',
    'done'
  ]

  it('returns the next screen', () => {
    expect(getNextCustomizeScreen(screens, 'language')).toBe('text')
    expect(getNextCustomizeScreen(screens, 'links')).toBe('media')
  })

  it('returns null for the last screen', () => {
    expect(getNextCustomizeScreen(screens, 'done')).toBeNull()
  })

  it('returns null for a screen not in the array', () => {
    expect(getNextCustomizeScreen(screens, 'social')).toBeNull()
  })

  it('returns null for an empty screens array', () => {
    expect(getNextCustomizeScreen([], 'language')).toBeNull()
  })
})
