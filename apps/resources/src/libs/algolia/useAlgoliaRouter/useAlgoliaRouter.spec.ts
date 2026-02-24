import { extractQueryParams } from './useAlgoliaRouter'

describe('useAlgoliaRouter', () => {
  it('should extract languageId from URL when set as a menu facet', () => {
    const url =
      'http://localhost:4300/watch?configure%5BruleContexts%5D%5B0%5D=home_page&menu%5BlanguageId%5D=529'
    const { query, languageId, subtitleId } = extractQueryParams(url)
    expect(query).toBeNull()
    expect(languageId).toBe('529')
    expect(subtitleId).toBeNull()
  })

  it('should extract query from URL', () => {
    const url =
      'http://localhost:4300/watch?query=love&configure%5BruleContexts%5D%5B0%5D=home_page'
    const { query, languageId, subtitleId } = extractQueryParams(url)
    expect(query).toBe('love')
    expect(languageId).toBeNull()
    expect(subtitleId).toBeNull()
  })

  it('should extract subtitleId from URL', () => {
    const url =
      'http://localhost:4300/watch?configure%5BruleContexts%5D%5B0%5D=home_page&menu%5Bsubtitles%5D=529'
    const { query, languageId, subtitleId } = extractQueryParams(url)
    expect(query).toBeNull()
    expect(languageId).toBeNull()
    expect(subtitleId).toBe('529')
  })
})
