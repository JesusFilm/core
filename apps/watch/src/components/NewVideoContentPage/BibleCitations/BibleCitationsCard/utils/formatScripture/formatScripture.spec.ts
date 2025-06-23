import { formatScripture } from './formatScripture'

describe('formatScripture', () => {
  it('should remove scripture notes from the end of the verse', () => {
    const verse = 'For You formed my inmost being;139:13 Hebrew my kidneys'
    const expected = 'For You formed my inmost being'
    expect(formatScripture(verse)).toBe(expected)
  })

  it('should replace newline characters with spaces', () => {
    const verse = 'For You\nformed my inmost being'
    const expected = 'For You formed my inmost being'
    expect(formatScripture(verse)).toBe(expected)
  })

  it('should trim leading and trailing whitespace', () => {
    const verse = '  For You formed my inmost being  '
    const expected = 'For You formed my inmost being'
    expect(formatScripture(verse)).toBe(expected)
  })

  it('should handle a combination of notes, newlines, and whitespace', () => {
    const verse = '  For You\nformed my inmost being;139:13 Hebrew my kidneys  '
    const expected = 'For You formed my inmost being'
    expect(formatScripture(verse)).toBe(expected)
  })

  it('should return the verse as is if no formatting is needed', () => {
    const verse = 'For You formed my inmost being'
    expect(formatScripture(verse)).toBe(verse)
  })

  it('should not remove semicolons that are not followed by a digit', () => {
    const verse = 'This is a test; with a semicolon.'
    expect(formatScripture(verse)).toBe(verse)
  })
})
