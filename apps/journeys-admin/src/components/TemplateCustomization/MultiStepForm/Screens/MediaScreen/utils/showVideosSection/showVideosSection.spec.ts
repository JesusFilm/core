/**
 * TODO: update these when implementing the component
 */
import { showVideosSection } from './showVideosSection'

describe('showVideosSection', () => {
  it('returns true when cardBlockId is null (skeleton)', () => {
    expect(showVideosSection(null)).toBe(true)
  })

  it('returns true when cardBlockId is set (skeleton)', () => {
    expect(showVideosSection('card-1')).toBe(true)
  })
})
