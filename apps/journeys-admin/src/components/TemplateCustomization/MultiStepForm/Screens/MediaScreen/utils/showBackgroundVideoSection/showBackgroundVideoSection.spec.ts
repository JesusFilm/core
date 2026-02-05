/**
 * TODO: update these when implementing the component
 */
import { showBackgroundVideoSection } from './showBackgroundVideoSection'

describe('showBackgroundVideoSection', () => {
  it('returns true when cardBlockId is null (skeleton)', () => {
    expect(showBackgroundVideoSection(null)).toBe(true)
  })

  it('returns true when cardBlockId is set (skeleton)', () => {
    expect(showBackgroundVideoSection('card-1')).toBe(true)
  })
})
