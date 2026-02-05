/**
 * TODO: update these when implementing the component
 */
import { showBackgroundImageSection } from './showBackgroundImageSection'

describe('showBackgroundImageSection', () => {
  it('returns true when cardBlockId is null (skeleton)', () => {
    expect(showBackgroundImageSection(null)).toBe(true)
  })

  it('returns true when cardBlockId is set (skeleton)', () => {
    expect(showBackgroundImageSection('card-1')).toBe(true)
  })
})
