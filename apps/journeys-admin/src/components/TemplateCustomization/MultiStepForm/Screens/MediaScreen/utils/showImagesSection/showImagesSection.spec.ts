/**
 * TODO: update these when implementing the component
 */
import { showImagesSection } from './showImagesSection'

describe('showImagesSection', () => {
  it('returns true when cardBlockId is null (skeleton)', () => {
    expect(showImagesSection(null)).toBe(true)
  })

  it('returns true when cardBlockId is set (skeleton)', () => {
    expect(showImagesSection('card-1')).toBe(true)
  })
})
