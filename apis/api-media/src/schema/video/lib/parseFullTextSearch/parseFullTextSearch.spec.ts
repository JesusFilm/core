import { parseFullTextSearch } from '.'

describe('parseFullTextSearch', () => {
  it('should search with title', () => {
    expect(parseFullTextSearch('abc')).toBe('abc')
  })

  it('should search with title and escape special characters', () => {
    expect(parseFullTextSearch('a-bc 1:23')).toBe('"a\\-bc" & "1\\:23"')
  })

  it('should filter with title and join words with ampersand', () => {
    expect(parseFullTextSearch('abc 123')).toBe('abc & 123')
  })
})
