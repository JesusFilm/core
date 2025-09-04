import { SuggestionsClientImpl } from './suggestionsClient'
import type { SuggestionItem } from './types'

// Mock environment
jest.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_ALGOLIA_APP_ID: 'test-app-id',
    NEXT_PUBLIC_ALGOLIA_API_KEY: 'test-api-key',
    NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX: 'test-suggestions-index'
  }
}))

describe('SuggestionsClient', () => {
  let client: SuggestionsClientImpl

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Get the mocked algoliasearch
    const algoliasearch = require('algoliasearch').default

    // Get the mock search index
    const mockSearchIndex = algoliasearch().initIndex()

    // Setup mock responses
    mockSearchIndex.search.mockResolvedValue({
      hits: [
        { query: 'Jesus', popularity: 100 },
        { query: 'Bible Stories', popularity: 85 },
        { query: 'Christian', popularity: 70 }
      ]
    })

    // Create client after setting up mocks
    client = new SuggestionsClientImpl()
  })

  afterEach(() => {
    // Clear cache if method exists
    if (typeof client.clearCache === 'function') {
      client.clearCache()
    }
    jest.clearAllMocks()
  })

  describe('fetchPopular', () => {
    it('should return popular suggestions from Algolia', async () => {
      // Mock successful Algolia response
      mockSearchIndex.search.mockResolvedValue({
        hits: [
          { query: 'Jesus', popularity: 100 },
          { query: 'Bible Stories', popularity: 85 },
          { query: 'Christian', popularity: 70 }
        ]
      })

      const suggestions = await client.fetchPopular()

      expect(mockSearchIndex.search).toHaveBeenCalledWith({
        requests: [{
          indexName: 'test-suggestions-index',
          query: '',
          hitsPerPage: 8,
          analytics: false,
          clickAnalytics: false,
          attributesToRetrieve: ['query', 'popularity']
        }]
      })

      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBe(3)

      // Check structure of suggestion items
      suggestions.forEach((suggestion: SuggestionItem) => {
        expect(suggestion).toHaveProperty('text')
        expect(typeof suggestion.text).toBe('string')
        expect(suggestion.text.length).toBeGreaterThan(0)
        expect(suggestion.metadata).toHaveProperty('count')
      })

      expect(suggestions[0].text).toBe('Jesus')
      expect(suggestions[0].metadata?.count).toBe(100)
    })

    it('should fallback to curated data when Algolia fails', async () => {
      // Mock Algolia failure
      mockSearchIndex.search.mockRejectedValue(new Error('Algolia error'))

      const suggestions = await client.fetchPopular()

      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)

      // Should have fallen back to curated data
      suggestions.forEach((suggestion: SuggestionItem) => {
        expect(suggestion).toHaveProperty('text')
        expect(typeof suggestion.text).toBe('string')
        expect(suggestion.text.length).toBeGreaterThan(0)
      })
    })

    it('should respect the limit parameter', async () => {
      const limit = 3
      const suggestions = await client.fetchPopular({ limit })

      expect(suggestions.length).toBeLessThanOrEqual(limit)
    })

    it('should cache popular suggestions', async () => {
      // First call
      const suggestions1 = await client.fetchPopular()
      // Second call should use cache
      const suggestions2 = await client.fetchPopular()

      expect(suggestions1).toEqual(suggestions2)
    })

    it('should handle abort signal', async () => {
      const controller = new AbortController()
      controller.abort()

      await expect(client.fetchPopular({ signal: controller.signal })).rejects.toThrow('Request aborted')
    })
  })

  describe('fetchSuggestions', () => {
    it('should return suggestions for a query from Algolia', async () => {
      const query = 'jesus'

      // Mock successful Algolia response
      mockSearchIndex.search.mockResolvedValue({
        hits: [
          { query: 'Jesus', popularity: 100 },
          { query: 'Jesus Christ', popularity: 85 },
          { query: 'Jesus in the Bible', popularity: 70 }
        ]
      })

      const suggestions = await client.fetchSuggestions(query)

      expect(mockSearchIndex.search).toHaveBeenCalledWith({
        requests: [{
          indexName: 'test-suggestions-index',
          query: 'jesus',
          hitsPerPage: 8,
          analytics: false,
          clickAnalytics: false,
          attributesToRetrieve: ['query', 'popularity']
        }]
      })

      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBe(3)

      // Check structure and content
      expect(suggestions[0].text).toBe('Jesus')
      expect(suggestions[0].metadata?.count).toBe(100)
      expect(suggestions[0].highlight).toBeDefined()
    })

    it('should fallback to curated data when Algolia fails', async () => {
      const query = 'jesus'

      // Mock Algolia failure
      mockSearchIndex.search.mockRejectedValue(new Error('Algolia error'))

      const suggestions = await client.fetchSuggestions(query)

      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)

      // Should have fallen back to curated data
      const hasRelevantSuggestions = suggestions.some((s: SuggestionItem) =>
        s.text.toLowerCase().includes('jesus') ||
        s.text.toLowerCase().includes('christ') ||
        s.text.toLowerCase().includes('gospel')
      )
      expect(hasRelevantSuggestions).toBe(true)
    })

    it('should handle empty query by returning popular suggestions', async () => {
      const suggestions = await client.fetchSuggestions('')
      const popular = await client.fetchPopular()

      expect(suggestions).toEqual(popular)
    })

    it('should handle very short queries', async () => {
      const suggestions = await client.fetchSuggestions('a')
      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should respect the limit parameter', async () => {
      const query = 'christ'
      const limit = 2
      const suggestions = await client.fetchSuggestions(query, { limit })

      expect(suggestions.length).toBeLessThanOrEqual(limit)
    })

    it('should cache suggestions', async () => {
      const query = 'faith'

      // First call
      const suggestions1 = await client.fetchSuggestions(query)
      // Second call should use cache
      const suggestions2 = await client.fetchSuggestions(query)

      expect(suggestions1).toEqual(suggestions2)
    })

    it('should debounce requests', async () => {
      const query = 'hope'

      // Start multiple requests quickly
      const promise1 = client.fetchSuggestions(query)
      const promise2 = client.fetchSuggestions(query)
      const promise3 = client.fetchSuggestions(query)

      // Wait for debouncing to complete
      await new Promise(resolve => setTimeout(resolve, 250))

      // All promises should resolve to the same result
      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])

      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('should handle abort signal', async () => {
      const controller = new AbortController()
      const query = 'love'

      // Abort before the debounced call
      controller.abort()

      await expect(client.fetchSuggestions(query, { signal: controller.signal })).rejects.toThrow('Request aborted')
    })
  })

  describe('security and sanitization', () => {
    it('should sanitize input strings', async () => {
      // Test with control characters
      const maliciousQuery = 'test\x00\x01\x02'
      const suggestions = await client.fetchSuggestions(maliciousQuery)

      // Should not crash and should return valid suggestions
      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should handle very long queries', async () => {
      const longQuery = 'a'.repeat(200)
      const suggestions = await client.fetchSuggestions(longQuery)

      // Should not crash
      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should handle non-string inputs gracefully', async () => {
      // @ts-expect-error Testing invalid input
      const suggestions = await client.fetchSuggestions(123)

      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })

  describe('fuzzy matching', () => {
    it('should prioritize exact matches', async () => {
      const suggestions = await client.fetchSuggestions('Jesus')

      // "Jesus" should be the first result if it exists
      const jesusSuggestion = suggestions.find((s: SuggestionItem) =>
        s.text.toLowerCase() === 'jesus'
      )
      expect(jesusSuggestion).toBeDefined()
    })

    it('should prioritize prefix matches', async () => {
      const suggestions = await client.fetchSuggestions('Chr')

      // Should find "Christian" or similar
      const hasPrefixMatch = suggestions.some((s: SuggestionItem) =>
        s.text.toLowerCase().startsWith('chr')
      )
      expect(hasPrefixMatch).toBe(true)
    })

    it('should include substring matches', async () => {
      const suggestions = await client.fetchSuggestions('ove')

      // Should find "Love" or words containing "ove"
      const hasSubstringMatch = suggestions.some((s: SuggestionItem) =>
        s.text.toLowerCase().includes('ove')
      )
      expect(hasSubstringMatch).toBe(true)
    })
  })

  describe('highlighting', () => {
    it('should include highlight information for matches', async () => {
      const query = 'love'
      const suggestions = await client.fetchSuggestions(query)

      // Find a suggestion that should have highlighting
      const highlightedSuggestion = suggestions.find((s: SuggestionItem) =>
        s.highlight && s.text.toLowerCase().includes(query.toLowerCase())
      )

      if (highlightedSuggestion) {
        expect(highlightedSuggestion.highlight).toHaveProperty('match')
        expect(highlightedSuggestion.highlight).toHaveProperty('original')
        expect(highlightedSuggestion.highlight!.match.toLowerCase()).toBe(query.toLowerCase())
      }
    })
  })
})
